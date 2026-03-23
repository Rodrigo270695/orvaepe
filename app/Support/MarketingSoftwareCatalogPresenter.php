<?php

namespace App\Support;

use App\Models\CatalogProduct;
use App\Models\CatalogSku;
use Illuminate\Support\Str;

/**
 * Convierte productos del catálogo (sistemas propios) al shape que consume la vista /software.
 */
final class MarketingSoftwareCatalogPresenter
{
    /** Modelos de venta que definen "sistema propio" (fuente + SaaS), excl. OEM y servicios. */
    public const OWN_SOFTWARE_SALE_MODELS = [
        'source_perpetual',
        'source_rental',
        'saas_subscription',
    ];

    /**
     * @return array<string, mixed>
     */
    public static function productToSystem(CatalogProduct $product): array
    {
        $category = $product->category;
        $categorySlug = $category?->slug ?? 'general';

        $skus = $product->relationLoaded('skus')
            ? $product->skus
            : $product->skus()
                ->where('is_active', true)
                ->whereIn('sale_model', self::OWN_SOFTWARE_SALE_MODELS)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get();

        $badges = self::badgesFromSkus($skus);

        $latest = $product->relationLoaded('softwareReleases')
            ? $product->softwareReleases->first()
            : $product->softwareReleases()->orderByDesc('released_at')->first();

        if ($latest && $latest->version) {
            $badges[] = 'v'.$latest->version;
        }

        $badges = array_values(array_unique(array_filter($badges)));

        $specs = $product->specs ?? [];
        $modules = [];
        if (isset($specs['modules']) && is_array($specs['modules'])) {
            foreach ($specs['modules'] as $m) {
                if (is_string($m)) {
                    $modules[] = ['name' => $m];
                } elseif (is_array($m) && isset($m['name'])) {
                    $modules[] = ['name' => (string) $m['name']];
                }
            }
        }

        $short = $product->tagline
            ? (string) $product->tagline
            : Str::limit(strip_tags((string) ($product->description ?? '')), 160);

        return [
            'slug' => $product->slug,
            'categorySlug' => $categorySlug,
            'name' => $product->name,
            'shortDescription' => $short,
            'description' => (string) ($product->description ?? ''),
            'badges' => $badges,
            'modules' => $modules,
            'pricingPlans' => $skus->map(fn (CatalogSku $sku) => self::skuToPlan($sku))->values()->all(),
            'howItWorksSteps' => isset($specs['how_it_works']) && is_array($specs['how_it_works'])
                ? array_values(array_filter(array_map('strval', $specs['how_it_works'])))
                : null,
            'languages' => isset($specs['languages']) && is_array($specs['languages'])
                ? array_values(array_filter(array_map('strval', $specs['languages'])))
                : null,
            'frameworks' => isset($specs['frameworks']) && is_array($specs['frameworks'])
                ? array_values(array_filter(array_map('strval', $specs['frameworks'])))
                : null,
            'databases' => isset($specs['databases']) && is_array($specs['databases'])
                ? array_values(array_filter(array_map('strval', $specs['databases'])))
                : null,
            'catalogProductId' => $product->id,
        ];
    }

    /**
     * @param  \Illuminate\Support\Collection<int, CatalogSku>  $skus
     * @return list<string>
     */
    private static function badgesFromSkus($skus): array
    {
        $out = [];
        $models = $skus->pluck('sale_model')->unique()->all();

        foreach ($models as $sm) {
            $out[] = match ($sm) {
                'saas_subscription' => 'SaaS',
                'source_perpetual' => 'Código fuente',
                'source_rental' => 'Alquiler código',
                default => (string) $sm,
            };
        }

        return $out;
    }

    /**
     * @return array<string, mixed>
     */
    private static function skuToPlan(CatalogSku $sku): array
    {
        $price = number_format((float) $sku->list_price, 2, '.', '');
        $currency = strtoupper((string) $sku->currency);
        $tax = $sku->tax_included ? ' (incl. imp.)' : '';
        $recurring = self::billingIntervalSuffix($sku->billing_interval);

        return [
            'id' => $sku->id,
            'label' => $sku->name,
            'priceText' => $price.' '.$currency.$recurring.$tax,
            'saleModel' => $sku->sale_model,
            'saleModelLabel' => self::saleModelLabel($sku->sale_model),
            'highlights' => self::highlightsFromSku($sku),
        ];
    }

    private static function billingIntervalSuffix(?string $interval): string
    {
        return match ($interval) {
            'monthly' => ' / mes',
            'annual' => ' / año',
            'one_time' => '',
            'custom' => '',
            default => $interval ? ' ('.$interval.')' : '',
        };
    }

    private static function saleModelLabel(string $saleModel): string
    {
        return match ($saleModel) {
            'source_perpetual' => 'Licencia perpetua (código)',
            'source_rental' => 'Alquiler de código / acceso',
            'saas_subscription' => 'Suscripción SaaS',
            default => $saleModel,
        };
    }

    /**
     * @return list<string>
     */
    private static function highlightsFromSku(CatalogSku $sku): array
    {
        $h = [];
        if ($sku->billing_interval) {
            $h[] = match ($sku->billing_interval) {
                'monthly' => 'Plan de pago: mensual',
                'annual' => 'Plan de pago: anual',
                'one_time' => 'Pago único',
                'custom' => 'Facturación personalizada',
                default => 'Facturación: '.$sku->billing_interval,
            };
        }
        if ($sku->rental_days) {
            $h[] = $sku->rental_days.' días de alquiler';
        }
        if ($sku->fulfillment_type && $sku->fulfillment_type !== 'download') {
            $h[] = match ($sku->fulfillment_type) {
                'saas_url' => 'Entrega: acceso SaaS',
                'manual_provision' => 'Entrega: provisión manual',
                default => 'Entrega: '.$sku->fulfillment_type,
            };
        }

        return $h;
    }
}
