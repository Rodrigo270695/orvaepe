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
        $imageUrl = self::firstMetaString($meta, ['imagen_item', 'imagen_url', 'image_item', 'image_url']);

        $price = (float) $sku->list_price;
        $currency = strtoupper((string) $sku->currency);

        return [
            'id' => $sku->id,
            'code' => $sku->code,
            'name' => $sku->name,
            'list_price' => $price,
            'currency' => $currency,
            'price_text' => number_format($price, 2, '.', ',').' '.$currency,
            'detail' => self::firstMetaString($meta, ['detalle', 'detail']),
            'list_number' => self::firstMetaInt($meta, ['numero_lista', 'list_number']),
            'image_url' => $imageUrl,
            'icon_key' => self::firstMetaString($meta, ['clave_icono', 'icon_key']) ?? 'generic',
        ];
    }

    /**
     * @param  array<string, mixed>  $meta
     * @param  list<string>  $keys
     */
    private static function firstMetaString(array $meta, array $keys): ?string
    {
        foreach ($keys as $key) {
            if (!array_key_exists($key, $meta)) {
                continue;
            }
            $value = $meta[$key];
            if (is_array($value)) {
                foreach ($value as $v) {
                    if (!is_scalar($v)) {
                        continue;
                    }
                    $text = trim((string) $v);
                    if ($text !== '') {
                        return $text;
                    }
                }

                continue;
            }
            if (!is_scalar($value)) {
                continue;
            }
            $text = trim((string) $value);
            if ($text !== '') {
                return $text;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $meta
     * @param  list<string>  $keys
     */
    private static function firstMetaInt(array $meta, array $keys): ?int
    {
        foreach ($keys as $key) {
            if (!array_key_exists($key, $meta)) {
                continue;
            }
            $value = $meta[$key];
            if (is_int($value)) {
                return $value;
            }
            if (is_string($value) && preg_match('/^\d+$/', trim($value)) === 1) {
                return (int) trim($value);
            }
            if (is_float($value)) {
                return (int) $value;
            }
        }

        return null;
    }
}
