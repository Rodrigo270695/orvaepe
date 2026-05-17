<?php

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\Order;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Services\Access\SubscriptionEntitlementSyncService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Crea suscripción automática desde checkout para SKUs de pago recurrente.
 * Idempotente por pedido.
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
            return $sku instanceof CatalogSku && $this->isRecurringSku($sku);
        })->values();

        if ($recurringLines->isEmpty()) {
            return;
        }

        $subscription = Subscription::query()
            ->where('user_id', $order->user_id)
            ->where('metadata->checkout_order_id', $order->id)
            ->first();

        if (! $subscription instanceof Subscription) {
            $firstSku = $recurringLines->first()?->sku;

            $subscription = Subscription::query()->create([
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

        foreach ($recurringLines as $line) {
            $sku = $line->sku;
            if (! $sku instanceof CatalogSku) {
                continue;
            }

            $exists = SubscriptionItem::query()
                ->where('subscription_id', $subscription->id)
                ->where('catalog_sku_id', $sku->id)
                ->exists();

            if ($exists) {
                continue;
            }

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

        $this->entitlementSync->sync($subscription->fresh());

        /** @var CatalogSku|null $primaryRecurringSku */
        $primaryRecurringSku = $recurringLines
            ->sortByDesc(fn ($line) => (float) $line->line_total)
            ->first()?->sku;

        if ($primaryRecurringSku instanceof CatalogSku) {
            $periodEnd = $subscription->current_period_end;
            DB::afterCommit(function () use ($order, $primaryRecurringSku, $periodEnd): void {
                $freshOrder = $order->fresh(['user', 'payments']);

                try {
                    $this->aulaVirtualProvisioner->provision($freshOrder, $primaryRecurringSku, $periodEnd);
                } catch (\Throwable $e) {
                    Log::warning('aulavirtual.provision_exception', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'exception' => $e->getMessage(),
                    ]);
                }

                try {
                    $this->vetsaasProvisioner->provision($freshOrder, $primaryRecurringSku, $periodEnd);
                } catch (\Throwable $e) {
                    Log::warning('vetsaas.provision_exception', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'exception' => $e->getMessage(),
                    ]);
                }
            });
        }
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

        // Compatibilidad para SKUs heredados: si el modelo no está normalizado,
        // inferimos por billing_interval.
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
