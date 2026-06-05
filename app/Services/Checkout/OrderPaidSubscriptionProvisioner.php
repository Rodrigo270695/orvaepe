<?php

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\Order;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Services\Access\SubscriptionEntitlementSyncService;
use App\Support\Checkout\SaasCatalogSku;
use App\Support\Checkout\SaasSubscriptionLookup;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Crea o renueva suscripción automática desde checkout para SKUs recurrentes.
 */
final class OrderPaidSubscriptionProvisioner
{
    public function __construct(
        private readonly SubscriptionEntitlementSyncService $entitlementSync,
        private readonly AulaVirtualPlanProvisioner $aulaVirtualProvisioner,
        private readonly VetSaaSPlanProvisioner $vetsaasProvisioner,
    ) {}

    public function provision(Order $order): void
    {
        $order->loadMissing(['user', 'lines.sku.product']);

        $recurringLines = $order->lines->filter(function ($line): bool {
            $sku = $line->sku;
            if (! $sku instanceof CatalogSku) {
                return false;
            }

            return $this->isRecurringSku($sku) || SaasCatalogSku::isSaasSubscription($sku);
        })->values();

        if ($recurringLines->isEmpty()) {
            return;
        }

        $subscription = $this->resolveSubscription($order, $recurringLines);
        $periodEnd = $subscription->current_period_end;

        foreach ($recurringLines as $line) {
            $sku = $line->sku;
            if (! $sku instanceof CatalogSku) {
                continue;
            }

            $exists = SubscriptionItem::query()
                ->where('subscription_id', $subscription->id)
                ->where('catalog_sku_id', $sku->id)
                ->exists();

            if (! $exists) {
                SubscriptionItem::query()->create([
                    'subscription_id' => $subscription->id,
                    'catalog_sku_id' => $sku->id,
                    'quantity' => max(1, (int) $line->quantity),
                    'unit_price' => (string) $line->unit_price,
                    'metadata' => [
                        'checkout_order_id' => $order->id,
                        'checkout_order_line_id' => $line->id,
                    ],
                ]);
            }
        }

        $this->entitlementSync->sync($subscription->fresh());
        $periodEnd = $subscription->fresh()->current_period_end;

        DB::afterCommit(function () use ($order, $recurringLines, $periodEnd): void {
            $freshOrder = $order->fresh(['user', 'payments', 'lines.sku.product']);

            foreach ($recurringLines as $line) {
                $sku = $line->sku;
                if (! $sku instanceof CatalogSku) {
                    continue;
                }

                if (SaasCatalogSku::isAulaVirtual($sku)) {
                    try {
                        $this->aulaVirtualProvisioner->provision($freshOrder, $sku, $periodEnd);
                    } catch (\Throwable $e) {
                        Log::warning('aulavirtual.provision_exception', [
                            'order_id' => $order->id,
                            'sku_code' => $sku->code,
                            'exception' => $e->getMessage(),
                        ]);
                    }
                }

                if (SaasCatalogSku::isVetsaas($sku)) {
                    try {
                        $this->vetsaasProvisioner->provision($freshOrder, $sku, $periodEnd);
                    } catch (\Throwable $e) {
                        Log::warning('vetsaas.provision_exception', [
                            'order_id' => $order->id,
                            'sku_code' => $sku->code,
                            'exception' => $e->getMessage(),
                        ]);
                    }
                }
            }
        });
    }

    /**
     * @param  \Illuminate\Support\Collection<int, \App\Models\OrderLine>  $recurringLines
     */
    private function resolveSubscription(Order $order, $recurringLines): Subscription
    {
        $firstSku = $recurringLines->first()?->sku;

        foreach ($recurringLines as $line) {
            $sku = $line->sku;
            if (! $sku instanceof CatalogSku) {
                continue;
            }

            if (SaasCatalogSku::isVetsaas($sku)) {
                $renewable = SaasSubscriptionLookup::findVetsaasRenewable((string) $order->user_id, $sku);
                if ($renewable instanceof Subscription) {
                    return $this->extendSubscription($renewable, $order, $sku);
                }
            }
        }

        $subscription = Subscription::query()
            ->where('user_id', $order->user_id)
            ->where('metadata->checkout_order_id', $order->id)
            ->first();

        if ($subscription instanceof Subscription) {
            return $subscription;
        }

        return Subscription::query()->create([
            'user_id' => $order->user_id,
            'status' => Subscription::STATUS_ACTIVE,
            'gateway_customer_id' => null,
            'gateway_subscription_id' => null,
            'current_period_start' => $order->placed_at ?? now(),
            'current_period_end' => $this->periodEndFromSku($firstSku instanceof CatalogSku ? $firstSku : null),
            'cancel_at_period_end' => false,
            'cancelled_at' => null,
            'trial_ends_at' => null,
            'metadata' => [
                'origen' => 'checkout_automatico',
                'checkout_order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ]);
    }

    private function extendSubscription(Subscription $subscription, Order $order, CatalogSku $sku): Subscription
    {
        $base = $subscription->current_period_end && $subscription->current_period_end->isFuture()
            ? $subscription->current_period_end
            : now();

        $newEnd = $this->periodEndFromBase($base, $sku);

        $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
        $metadata['last_renewal_order_id'] = $order->id;
        $metadata['last_renewal_order_number'] = $order->order_number;
        $metadata['last_renewal_at'] = now()->toIso8601String();

        $subscription->forceFill([
            'status' => Subscription::STATUS_ACTIVE,
            'current_period_start' => $base,
            'current_period_end' => $newEnd,
            'cancelled_at' => null,
            'cancel_at_period_end' => false,
            'metadata' => $metadata,
        ])->save();

        return $subscription->fresh();
    }

    private function periodEndFromBase(\DateTimeInterface $base, CatalogSku $sku): Carbon
    {
        $start = Carbon::parse($base);
        $interval = strtolower(trim((string) ($sku->billing_interval ?? '')));

        return match ($interval) {
            'year', 'yearly', 'annual', 'anual' => $start->copy()->addYear(),
            default => $start->copy()->addMonth(),
        };
    }

    private function isRecurringSku(CatalogSku $sku): bool
    {
        $saleModel = strtolower(trim((string) $sku->sale_model));
        if (in_array($saleModel, [
            'source_rental',
            'saas_subscription',
            'oem_license_subscription',
            'service_subscription',
        ], true)) {
            return true;
        }

        $interval = strtolower(trim((string) ($sku->billing_interval ?? '')));

        return in_array($interval, ['monthly', 'annual', 'custom'], true);
    }

    private function periodEndFromSku(?CatalogSku $sku): ?\DateTimeInterface
    {
        if (! $sku instanceof CatalogSku) {
            return now()->addMonth();
        }

        $interval = strtolower(trim((string) ($sku->billing_interval ?? '')));

        return match ($interval) {
            'month', 'monthly', 'mensual' => now()->addMonth(),
            'year', 'yearly', 'annual', 'anual' => now()->addYear(),
            default => now()->addMonth(),
        };
    }
}
