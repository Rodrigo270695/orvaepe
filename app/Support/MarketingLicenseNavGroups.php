<?php

namespace App\Support;

use App\Models\CatalogCategory;

/**
 * Estructura dinámica para dropdown "Licencias":
 * categoría (grupo) -> productos (items).
 */
final class MarketingLicenseNavGroups
{
    /**
     * @return list<array{categoryLabel: string, items: list<array{label: string, href: string}>}>
     */
    public static function all(): array
    {
        $categories = CatalogCategory::query()
            ->where('is_active', true)
            ->where('revenue_line', 'oem_license')
            ->whereHas('products', function ($q): void {
                $q->where('is_active', true)
                    ->whereHas('skus', function ($sq): void {
                        $sq->where('is_active', true);
                    });
            })
            ->with([
                'products' => function ($q): void {
                    $q->where('is_active', true)
                        ->whereHas('skus', function ($sq): void {
                            $sq->where('is_active', true);
                        })
                        ->orderBy('name');
                },
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name']);

        $groups = [];
        foreach ($categories as $category) {
            $items = [];
            foreach ($category->products as $product) {
                $slug = trim((string) $product->slug);
                if ($slug === '') {
                    continue;
                }

                $items[] = [
                    'label' => (string) $product->name,
                    'href' => '/licencias#'.$slug,
                ];
            }

            if ($items === []) {
                continue;
            }

            $groups[] = [
                'categoryLabel' => (string) $category->name,
                'items' => $items,
            ];
        }

        if ($groups !== []) {
            return $groups;
        }

        return [
            [
                'categoryLabel' => 'Licencias',
                'items' => [
                    ['label' => 'Más vendidos', 'href' => '/licencias#oem-mas-vendidos'],
                    ['label' => 'Antivirus', 'href' => '/licencias#oem-antivirus-principales'],
                    ['label' => 'Otros antivirus', 'href' => '/licencias#oem-antivirus-otros'],
                    ['label' => 'Visio / Project / más', 'href' => '/licencias#oem-otros-productos'],
                    ['label' => 'Office para Mac', 'href' => '/licencias#oem-office-mac'],
                    ['label' => 'Nuevos ingresos', 'href' => '/licencias#oem-nuevos-ingresos'],
                ],
            ],
        ];
    }
}
