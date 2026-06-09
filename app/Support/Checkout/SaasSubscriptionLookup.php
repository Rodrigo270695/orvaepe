<?php

declare(strict_types=1);

namespace App\Support\Checkout;

use App\Models\CatalogSku;
use App\Models\Order;
use App\Models\Subscription;

/**
 * Localiza suscripciones Orvae renovables (ya provisionadas en SaaS).
 */
final class SaasSubscriptionLookup
{
    public static function findVetsaasRenewable(string|int $userId, CatalogSku $sku): ?Subscription
    {
        return self::findRenewable((string) $userId, $sku, 'vetsaas_tenant_slug');
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

    public static function findAulaVirtualRenewable(string|int $userId, CatalogSku $sku): ?Subscription
    {
        return self::findRenewable((string) $userId, $sku, 'aula_virtual_academy_url');
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

    public static function findVetsaasProvisioned(string|int $userId): ?Subscription
    {
        return self::findProvisionedByMetadataKey((string) $userId, 'vetsaas_tenant_slug');
    }

    public static function findAulaVirtualProvisioned(string|int $userId): ?Subscription
    {
        return Subscription::query()
            ->where('user_id', (string) $userId)
            ->whereIn('status', self::renewableStatuses())
            ->orderByDesc('current_period_end')
            ->get()
            ->first(static function (Subscription $sub): bool {
                $metadata = is_array($sub->metadata) ? $sub->metadata : [];

                return filled($metadata['aula_virtual_academy_url'] ?? null)
                    || self::aulaTenantSlugFrom($sub) !== null;
            });
    }

    public static function isMarketingRenewalCheckout(CatalogSku $sku): bool
    {
        if (session('saas_marketing_renewal') === true) {
            return true;
        }

        if (! SaasCatalogSku::isVetsaas($sku)) {
            return false;
        }

        $renewSlug = session('vetsaas_renew_tenant_slug');

        return is_string($renewSlug) && trim($renewSlug) !== '';
    }

    public static function findActiveSaasSubscription(string|int $userId, string $productKey): ?Subscription
    {
        $skuIds = self::saasSkuIdsForProduct($productKey);
        if ($skuIds === []) {
            return null;
        }

        return Subscription::query()
            ->where('user_id', (string) $userId)
            ->whereIn('status', self::renewableStatuses())
            ->whereHas('items', static function ($q) use ($skuIds): void {
                $q->whereIn('catalog_sku_id', $skuIds);
            })
            ->orderByDesc('current_period_end')
            ->first();
    }

    public static function hasPaidSaasOrder(string|int $userId, string $productKey): bool
    {
        $skuIds = self::saasSkuIdsForProduct($productKey);
        if ($skuIds === []) {
            return false;
        }

        return Order::query()
            ->where('user_id', (string) $userId)
            ->where('status', Order::STATUS_PAID)
            ->whereHas('lines', static function ($q) use ($skuIds): void {
                $q->whereIn('catalog_sku_id', $skuIds);
            })
            ->exists();
    }

    /**
     * @return list<string>
     */
    private static function saasSkuIdsForProduct(string $productKey): array
    {
        return CatalogSku::query()
            ->with('product')
            ->where('is_active', true)
            ->get()
            ->filter(function (CatalogSku $sku) use ($productKey): bool {
                return match ($productKey) {
                    'vetsaas' => SaasCatalogSku::isVetsaas($sku),
                    'aulavirtual' => SaasCatalogSku::isAulaVirtual($sku),
                    default => false,
                };
            })
            ->pluck('id')
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    private static function renewableStatuses(): array
    {
        return [
            Subscription::STATUS_ACTIVE,
            Subscription::STATUS_TRIALING,
            Subscription::STATUS_PAST_DUE,
        ];
    }

    private static function findProvisionedByMetadataKey(string $userId, string $metadataKey): ?Subscription
    {
        return Subscription::query()
            ->where('user_id', $userId)
            ->whereIn('status', self::renewableStatuses())
            ->orderByDesc('current_period_end')
            ->get()
            ->first(static function (Subscription $sub) use ($metadataKey): bool {
                $metadata = is_array($sub->metadata) ? $sub->metadata : [];

                return filled($metadata[$metadataKey] ?? null);
            });
    }
}
