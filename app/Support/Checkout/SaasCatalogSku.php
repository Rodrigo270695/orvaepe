<?php

declare(strict_types=1);

namespace App\Support\Checkout;

use App\Models\CatalogSku;
use Illuminate\Support\Collection;

/**
 * Identifica SKUs de suscripción SaaS (VetSaaS / Aula Virtual) y reglas de checkout $0.
 */
final class SaasCatalogSku
{
    public static function isVetsaas(CatalogSku $sku): bool
    {
        $metadata = is_array($sku->metadata) ? $sku->metadata : [];
        $product = strtolower(trim((string) ($metadata['saas_product'] ?? '')));

        if (in_array($product, ['vetsaas', 'vet-saas', 'veterinaria'], true)) {
            return true;
        }

        $haystack = strtolower(implode(' ', array_filter([
            (string) ($sku->code ?? ''),
            (string) ($sku->name ?? ''),
            (string) ($sku->product?->name ?? ''),
        ])));

        if (str_contains($haystack, 'vetsaas') || str_contains($haystack, 'vet-saas')) {
            return true;
        }

        $saleModel = strtolower(trim((string) $sku->sale_model));

        return $saleModel === 'saas_subscription'
            && str_contains($haystack, 'vet');
    }

    public static function isAulaVirtual(CatalogSku $sku): bool
    {
        $metadata = is_array($sku->metadata) ? $sku->metadata : [];
        $product = strtolower(trim((string) ($metadata['saas_product'] ?? '')));

        if (in_array($product, ['aulavirtual', 'aula-virtual', 'aula_virtual', 'academia'], true)) {
            return true;
        }

        $saleModel = strtolower(trim((string) $sku->sale_model));
        $haystack = strtolower(implode(' ', [
            (string) ($sku->code ?? ''),
            (string) ($sku->name ?? ''),
        ]));

        return $saleModel === 'saas_subscription'
            && str_contains($haystack, 'aula');
    }

    public static function isSaasSubscription(CatalogSku $sku): bool
    {
        return self::isVetsaas($sku) || self::isAulaVirtual($sku);
    }

    /**
     * @param  Collection<int, CatalogSku>|iterable<int, CatalogSku>  $skus
     */
    public static function collectionQualifiesForZeroTotalCheckout(iterable $skus): bool
    {
        $items = $skus instanceof Collection ? $skus : collect($skus);

        if ($items->isEmpty()) {
            return false;
        }

        return $items->every(fn (CatalogSku $sku): bool => self::isSaasSubscription($sku));
    }

    public static function normalizePlanSlug(CatalogSku $sku, ?string $resolved): ?string
    {
        if ($resolved === null) {
            return null;
        }

        $normalized = strtolower(trim($resolved));
        if ($normalized === '') {
            return null;
        }

        if (str_contains($normalized, 'free') || str_contains($normalized, 'gratis')) {
            return 'free';
        }

        if (str_contains($normalized, 'starter')) {
            return 'starter';
        }

        if (str_contains($normalized, 'business')) {
            return 'business';
        }

        if (preg_match('/\bpro\b/', $normalized) === 1 || str_contains($normalized, ' pro')) {
            return 'pro';
        }

        if (str_contains($normalized, 'clinica')) {
            return 'clinica';
        }

        return $normalized;
    }

    /**
     * @return list<string|null>
     */
    public static function planSlugCandidates(CatalogSku $sku): array
    {
        $metadata = is_array($sku->metadata) ? $sku->metadata : [];

        return [
            $metadata['vetsaas_plan_slug'] ?? null,
            $metadata['saas_plan_slug'] ?? null,
            $metadata['plan_slug'] ?? null,
            $sku->code ?? null,
        ];
    }
}
