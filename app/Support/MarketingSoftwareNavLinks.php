<?php

namespace App\Support;

use App\Models\CatalogCategory;

/**
 * Enlaces del dropdown "Software" en la navbar (misma regla que el catálogo público).
 */
final class MarketingSoftwareNavLinks
{
    /**
     * @return list<array{label: string, href: string}>
     */
    public static function all(): array
    {
        $saleModels = MarketingSoftwareCatalogPresenter::OWN_SOFTWARE_SALE_MODELS;

        $categories = CatalogCategory::query()
            ->where('is_active', true)
            ->where('revenue_line', 'software_system')
            ->whereHas('products', function ($q) use ($saleModels) {
                $q->where('is_active', true)
                    ->whereHas('skus', function ($sq) use ($saleModels) {
                        $sq->where('is_active', true)
                            ->whereIn('sale_model', $saleModels);
                    });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['slug', 'name']);

        $links = [
            ['label' => 'Software desarrollado', 'href' => '/software'],
        ];

        if ($categories->isEmpty()) {
            foreach (self::fallbackCategoryAnchors() as $row) {
                $links[] = $row;
            }

            return $links;
        }

        foreach ($categories as $cat) {
            $links[] = [
                'label' => $cat->name,
                'href' => '/software#'.$cat->slug,
            ];
        }

        return $links;
    }

    /**
     * Lista estática anterior (cuando aún no hay categorías publicadas en BD).
     *
     * @return list<array{label: string, href: string}>
     */
    private static function fallbackCategoryAnchors(): array
    {
        return [
            ['label' => 'Contabilidad', 'href' => '/software#contabilidad'],
            ['label' => 'Ventas', 'href' => '/software#ventas'],
            ['label' => 'Matrículas', 'href' => '/software#matriculas'],
            ['label' => 'Contratos', 'href' => '/software#contratos'],
            ['label' => 'Inventario', 'href' => '/software#inventario'],
            ['label' => 'Reportes', 'href' => '/software#reportes'],
            ['label' => 'Veterinaria', 'href' => '/software#veterinaria'],
            ['label' => 'Transporte', 'href' => '/software#transporte'],
            ['label' => 'Mensajería', 'href' => '/software#mensajeria'],
        ];
    }
}
