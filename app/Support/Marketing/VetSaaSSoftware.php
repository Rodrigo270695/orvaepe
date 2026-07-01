<?php

declare(strict_types=1);

namespace App\Support\Marketing;

use App\Models\CatalogProduct;

final class VetSaaSSoftware
{
    public static function isSlug(string $slug): bool
    {
        return in_array(strtolower(trim($slug)), ['vetsaas', 'vet-saas'], true);
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

        return str_contains($name, 'vetsaas') || str_contains($name, 'vet saas');
    }
}
