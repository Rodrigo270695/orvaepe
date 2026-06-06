<?php

declare(strict_types=1);

namespace App\Support\Checkout;

use App\Models\CatalogSku;
use App\Models\Subscription;

/**
 * Localiza suscripciones Orvae renovables (ya provisionadas en SaaS).
 */
final class SaasSubscriptionLookup
{
    public static function findVetsaasRenewable(string $userId, CatalogSku $sku): ?Subscription
    {
        return self::findRenewable($userId, $sku, 'vetsaas_tenant_slug');
    }

    public static function findVetsaasByTenantSlug(string $tenantSlug, CatalogSku $sku): ?Subscription
    {
        $tenantSlug = trim($tenantSlug);
        if ($tenantSlug === '') {
            return null;
        }

        return Subscription::query()
            ->whereIn('status', [
                Subscription::STATUS_ACTIVE,
                Subscription::STATUS_TRIALING,
                Subscription::STATUS_PAST_DUE,
            ])
            ->whereHas('items', static function ($q) use ($sku): void {
                $q->where('catalog_sku_id', $sku->id);
            })
            ->orderByDesc('current_period_end')
            ->get()
            ->first(static function (Subscription $sub) use ($tenantSlug): bool {
                return self::tenantSlugFrom($sub) === $tenantSlug;
            });
    }

    public static function findAulaVirtualRenewable(string $userId, CatalogSku $sku): ?Subscription
    {
        return self::findRenewable($userId, $sku, 'aula_virtual_academy_url');
    }

    private static function findRenewable(string $userId, CatalogSku $sku, string $metadataKey): ?Subscription
    {
        return Subscription::query()
            ->where('user_id', $userId)
            ->whereIn('status', [
                Subscription::STATUS_ACTIVE,
                Subscription::STATUS_TRIALING,
                Subscription::STATUS_PAST_DUE,
            ])
            ->whereHas('items', static function ($q) use ($sku): void {
                $q->where('catalog_sku_id', $sku->id);
            })
            ->orderByDesc('current_period_end')
            ->get()
            ->first(static function (Subscription $sub) use ($metadataKey): bool {
                $metadata = is_array($sub->metadata) ? $sub->metadata : [];

                return filled($metadata[$metadataKey] ?? null);
            });
    }

    public static function tenantSlugFrom(Subscription $subscription): ?string
    {
        $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
        $slug = $metadata['vetsaas_tenant_slug'] ?? null;

        return is_string($slug) && $slug !== '' ? $slug : null;
    }

    public static function aulaTenantSlugFrom(Subscription $subscription): ?string
    {
        $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
        $slug = $metadata['aula_virtual_tenant_slug'] ?? null;

        return is_string($slug) && $slug !== '' ? $slug : null;
    }

    public static function isRenewableSaas(Subscription $subscription, CatalogSku $sku): bool
    {
        if (SaasCatalogSku::isVetsaas($sku)) {
            return self::tenantSlugFrom($subscription) !== null;
        }

        if (SaasCatalogSku::isAulaVirtual($sku)) {
            $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];

            return filled($metadata['aula_virtual_academy_url'] ?? null)
                || self::aulaTenantSlugFrom($subscription) !== null;
        }

        return false;
    }
}
