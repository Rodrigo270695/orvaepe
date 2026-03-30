<?php

namespace App\Services\Access;

use App\Models\Entitlement;
use App\Models\Subscription;
use App\Models\SubscriptionItem;

final class SubscriptionEntitlementSyncService
{
    public function sync(Subscription $subscription): void
    {
        $subscription->loadMissing(['items.catalogSku']);

        foreach ($subscription->items as $item) {
            if (! $item instanceof SubscriptionItem || $item->catalogSku === null) {
                continue;
            }

            $sku = $item->catalogSku;

            $entitlement = Entitlement::query()
                ->where('user_id', $subscription->user_id)
                ->where('subscription_id', $subscription->id)
                ->where('catalog_sku_id', $item->catalog_sku_id)
                ->first();

            $status = $this->mapStatus($subscription->status);
            $startsAt = $subscription->current_period_start ?? $subscription->created_at ?? now();
            $endsAt = $this->mapEndsAt($subscription);

            $metadata = [
                'origen' => 'suscripcion',
                'subscription_id' => $subscription->id,
                'gateway_subscription_id' => $subscription->gateway_subscription_id,
                'sale_model' => $sku->sale_model,
                'billing_interval' => $sku->billing_interval,
                'sku_code' => $sku->code,
                'quantity' => $item->quantity,
                'unit_price' => (string) $item->unit_price,
            ];

            if ($entitlement === null) {
                Entitlement::query()->create([
                    'user_id' => $subscription->user_id,
                    'catalog_product_id' => $sku->catalog_product_id,
                    'catalog_sku_id' => $sku->id,
                    'order_id' => null,
                    'order_line_id' => null,
                    'subscription_id' => $subscription->id,
                    'status' => $status,
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'suspended_at' => $status === Entitlement::STATUS_SUSPENDED ? now() : null,
                    'revoked_at' => $status === Entitlement::STATUS_REVOKED ? now() : null,
                    'revoke_reason' => $status === Entitlement::STATUS_REVOKED ? 'Suscripción cancelada' : null,
                    'feature_flags' => null,
                    'metadata' => $metadata,
                ]);
                continue;
            }

            $existingMeta = is_array($entitlement->metadata) ? $entitlement->metadata : [];

            $entitlement->forceFill([
                'catalog_product_id' => $sku->catalog_product_id,
                'catalog_sku_id' => $sku->id,
                'status' => $status,
                'starts_at' => $entitlement->starts_at ?? $startsAt,
                'ends_at' => $endsAt,
                'suspended_at' => $status === Entitlement::STATUS_SUSPENDED ? now() : null,
                'revoked_at' => $status === Entitlement::STATUS_REVOKED ? now() : null,
                'revoke_reason' => $status === Entitlement::STATUS_REVOKED ? 'Suscripción cancelada' : null,
                'metadata' => array_merge($existingMeta, $metadata),
            ])->save();
        }

        // Si quitaron items de la suscripción, revocar entitlements huérfanos de esa suscripción.
        $activeSkuIds = $subscription->items->pluck('catalog_sku_id')->filter()->values()->all();
        Entitlement::query()
            ->where('user_id', $subscription->user_id)
            ->where('subscription_id', $subscription->id)
            ->when($activeSkuIds !== [], fn ($q) => $q->whereNotIn('catalog_sku_id', $activeSkuIds))
            ->when($activeSkuIds === [], fn ($q) => $q)
            ->get()
            ->each(function (Entitlement $entitlement): void {
                $entitlement->forceFill([
                    'status' => Entitlement::STATUS_REVOKED,
                    'revoked_at' => now(),
                    'revoke_reason' => 'SKU removido de suscripción',
                    'ends_at' => now(),
                ])->save();
            });
    }

    private function mapStatus(string $subscriptionStatus): string
    {
        return match ($subscriptionStatus) {
            Subscription::STATUS_ACTIVE, Subscription::STATUS_TRIALING => Entitlement::STATUS_ACTIVE,
            Subscription::STATUS_PAST_DUE, Subscription::STATUS_PAUSED => Entitlement::STATUS_SUSPENDED,
            Subscription::STATUS_CANCELLED => Entitlement::STATUS_REVOKED,
            default => Entitlement::STATUS_PENDING,
        };
    }

    private function mapEndsAt(Subscription $subscription): ?\DateTimeInterface
    {
        if ($subscription->status === Subscription::STATUS_CANCELLED) {
            return $subscription->cancelled_at ?? now();
        }

        return $subscription->current_period_end;
    }
}
