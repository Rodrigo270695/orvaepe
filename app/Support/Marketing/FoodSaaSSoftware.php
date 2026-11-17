<?php

declare(strict_types=1);

namespace App\Support\Marketing;

use App\Models\CatalogProduct;

final class FoodSaaSSoftware
{
    public static function isSlug(string $slug): bool
    {
        return in_array(strtolower(trim($slug)), ['foodsaas', 'food-saas'], true);
    }

    public static function isProduct(?CatalogProduct $product): bool
    {
        if ($product === null) {
            return false;
        }

        if (self::isSlug((string) $product->slug)) {
            return true;
        }

        $name = strtolower(trim((string) $product->name));

        return str_contains($name, 'foodsaas') || str_contains($name, 'food saas');
    }

    /**
     * Página pública cuando el producto aún no está en el catálogo.
     * Sin planes inventados: el checkout aparece cuando existan SKU.
     *
     * @return array<string, mixed>
     */
    public static function fallback(string $slug): array
    {
        return [
            'slug' => $slug,
            'categorySlug' => 'software',
            'name' => 'FoodSaaS',
            'shortDescription' => 'Gestión para restaurantes: salón, cocina, caja, carta y comprobantes SUNAT en tu subdominio.',
            'description' => 'FoodSaaS es el sistema del restaurante en la nube. La mesa, el pedido, la cocina y la caja viven en el mismo piso. Cada local entra por su subdominio.',
            'badges' => ['Restaurantes', 'PWA', 'SUNAT'],
            'modules' => [],
            'pricingPlans' => [],
            'demoUrl' => 'https://demo.foodsaas.orvae.pe/login',
            'demoUser' => 'demo@foodsaas.pe',
            'demoPassword' => 'demo1234',
            'images' => ['/images/foodsaas/hero.jpg'],
        ];
    }
}
