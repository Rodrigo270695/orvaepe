<?php

namespace App\Support;

use App\Models\CatalogCategory;
use App\Models\CatalogProduct;
use Illuminate\Support\Collection;

/**
 * Dropdown "Servicios" en la navbar: categoría (revenue_line service) y productos con SKU de servicio activo.
 *
 * @see MarketingSoftwareCatalogPresenter::SERVICE_SALE_MODELS
 */
final class MarketingServicesNavGroups
{
    /**
     * @return list<array{categoryLabel: string, items: list<array{label: string, href: string}>}>
     */
    public static function all(): array
    {
        $saleModels = MarketingSoftwareCatalogPresenter::SERVICE_SALE_MODELS;

        $categories = CatalogCategory::query()
            ->where('is_active', true)
            ->where('revenue_line', 'service')
            ->whereHas('products', function ($q) use ($saleModels) {
                $q->where('is_active', true)
                    ->whereHas('skus', function ($sq) use ($saleModels) {
                        $sq->where('is_active', true)
                            ->whereIn('sale_model', $saleModels);
                    });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name']);

        $groups = [];

        foreach ($categories as $cat) {
            $products = CatalogProduct::query()
                ->where('category_id', $cat->id)
                ->where('is_active', true)
                ->whereHas('skus', function ($sq) use ($saleModels) {
                    $sq->where('is_active', true)
                        ->whereIn('sale_model', $saleModels);
                })
                ->orderBy('name')
                ->get(['name', 'slug']);

            if ($products->isEmpty()) {
                continue;
            }

            $items = [];
            foreach ($products as $product) {
                $items[] = [
                    'label' => $product->name,
                    'href' => '/servicios#'.$product->slug,
                ];
            }

            $groups[] = [
                'categoryLabel' => $cat->name,
                'items' => $items,
            ];
        }

        if ($groups !== []) {
            return $groups;
        }

        return self::fallbackGroups();
    }

    /**
     * Productos de servicio para la página /servicios (mismo orden que el menú: categoría → productos).
     *
     * @return Collection<int, CatalogProduct>
     */
    public static function orderedProductsForCatalogPage(): Collection
    {
        $saleModels = MarketingSoftwareCatalogPresenter::SERVICE_SALE_MODELS;

        $categories = CatalogCategory::query()
            ->where('is_active', true)
            ->where('revenue_line', 'service')
            ->whereHas('products', function ($q) use ($saleModels) {
                $q->where('is_active', true)
                    ->whereHas('skus', function ($sq) use ($saleModels) {
                        $sq->where('is_active', true)
                            ->whereIn('sale_model', $saleModels);
                    });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id']);

        $out = collect();

        foreach ($categories as $cat) {
            $chunk = CatalogProduct::query()
                ->where('category_id', $cat->id)
                ->where('is_active', true)
                ->whereHas('skus', function ($sq) use ($saleModels) {
                    $sq->where('is_active', true)
                        ->whereIn('sale_model', $saleModels);
                })
                ->with([
                    'skus' => function ($q) use ($saleModels) {
                        $q->where('is_active', true)
                            ->whereIn('sale_model', $saleModels)
                            ->orderBy('sort_order')
                            ->orderBy('name');
                    },
                ])
                ->orderBy('name')
                ->get();

            $out = $out->merge($chunk);
        }

        return $out;
    }

    /**
     * @return list<array{categoryLabel: string, items: list<array{label: string, href: string}>}>
     */
    private static function fallbackGroups(): array
    {
        return [
            [
                'categoryLabel' => 'Servicios',
                'items' => [
                    ['label' => 'Correos corporativos', 'href' => '/servicios#svc-correos-corporativos'],
                    ['label' => 'Integraciones', 'href' => '/servicios#svc-integraciones'],
                    ['label' => 'Despliegue y onboarding', 'href' => '/servicios#svc-despliegue-onboarding'],
                    ['label' => 'Capacitación', 'href' => '/servicios#svc-capacitacion'],
                ],
            ],
        ];
    }
}
