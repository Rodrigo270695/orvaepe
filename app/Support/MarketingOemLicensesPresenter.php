<?php

namespace App\Support;

use App\Models\CatalogProduct;
use App\Models\CatalogSku;
use Illuminate\Support\Collection;

/**
 * Formato del catálogo OEM para la vista marketing /licencias.
 */
final class MarketingOemLicensesPresenter
{
    /**
     * @param  Collection<int, CatalogProduct>  $products
     * @return list<array<string, mixed>>
     */
    public static function sections(Collection $products): array
    {
        $out = [];

        foreach ($products as $product) {
            /** @var CatalogProduct $product */
            $skus = $product->relationLoaded('skus')
                ? $product->skus
                : $product->skus()->where('is_active', true)->orderBy('sort_order')->get();

            $items = $skus->map(fn (CatalogSku $sku) => self::skuToItem($sku))->values()->all();

            $out[] = [
                'slug' => $product->slug,
                'title' => $product->name,
                'tagline' => $product->tagline,
                'description' => $product->description,
                'items' => $items,
            ];
        }

        return $out;
    }

    /**
     * @return array<string, mixed>
     */
    private static function skuToItem(CatalogSku $sku): array
    {
        $meta = is_array($sku->metadata) ? $sku->metadata : [];

        $price = (float) $sku->list_price;
        $currency = strtoupper((string) $sku->currency);

        return [
            'id' => $sku->id,
            'code' => $sku->code,
            'name' => $sku->name,
            'list_price' => $price,
            'currency' => $currency,
            'price_text' => number_format($price, 2, '.', ',').' '.$currency,
            'detail' => isset($meta['detail']) ? (string) $meta['detail'] : null,
            'list_number' => isset($meta['list_number']) ? (int) $meta['list_number'] : null,
            'image_url' => isset($meta['image_url']) && is_string($meta['image_url']) && $meta['image_url'] !== ''
                ? $meta['image_url']
                : null,
            'icon_key' => isset($meta['icon_key']) && is_string($meta['icon_key']) ? $meta['icon_key'] : 'generic',
        ];
    }
}
