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

    /** Modelos de venta para productos categoría Servicios (detalle /servicios/{slug}). */
    public const SERVICE_SALE_MODELS = [
        'service_project',
        'service_subscription',
    ];

    /**
     * Extrae el primer string no vacío de `specs[$key]`.
     * `specs` puede guardar valores como string o como lista de strings.
     *
     * @param  array<string, mixed>  $specs
     * @param  list<string>  $keys
     */
    private static function firstSpecUrl(array $specs, array $keys): ?string
    {
        foreach ($keys as $key) {
            $v = null;
            $found = false;
            $needle = strtolower($key);

            foreach ($specs as $specKey => $specValue) {
                if (! is_string($specKey)) {
                    continue;
                }

                if (strtolower($specKey) !== $needle) {
                    continue;
                }

                $v = $specValue;
                $found = true;
                break;
            }

            if (! $found) {
                continue;
            }

            if (is_string($v)) {
                $t = trim($v);
                if ($t !== '') {
                    return $t;
                }
            }

            if (is_array($v)) {
                foreach ($v as $item) {
                    if (! is_scalar($item)) {
                        continue;
                    }
                    $t = trim((string) $item);
                    if ($t !== '') {
                        return $t;
                    }
                }
            }

            if (is_scalar($v)) {
                $t = trim((string) $v);
                if ($t !== '') {
                    return $t;
                }
            }
        }

        return null;
    }

    /**
     * Extrae el primer string no vacío de `specs[$key]`.
     *
     * A diferencia de `firstSpecUrl`, no normaliza para https; solo devuelve el
     * string recortado tal cual.
     *
     * @param  array<string, mixed>  $specs
     * @param  list<string>  $keys
     */
    private static function firstSpecString(array $specs, array $keys): ?string
    {
        foreach ($keys as $key) {
            $v = null;
            $found = false;
            $needle = strtolower($key);

            foreach ($specs as $specKey => $specValue) {
                if (!is_string($specKey)) {
                    continue;
                }

                if (strtolower($specKey) !== $needle) {
                    continue;
                }

                $v = $specValue;
                $found = true;
                break;
            }

            if (! $found) {
                continue;
            }

            if (is_string($v)) {
                $t = trim($v);
                if ($t !== '') {
                    return $t;
                }
            }

            if (is_array($v)) {
                foreach ($v as $item) {
                    if (!is_scalar($item)) {
                        continue;
                    }

                    $t = trim((string) $item);
                    if ($t !== '') {
                        return $t;
                    }
                }
            }

            if (is_scalar($v)) {
                $t = trim((string) $v);
                if ($t !== '') {
                    return $t;
                }
            }
        }

        return null;
    }

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
                $name = null;
                if (is_string($m)) {
                    $name = self::normalizeModuleNameFromSpecValue($m);
                } elseif (is_array($m) && isset($m['name'])) {
                    $name = self::normalizeModuleNameFromSpecValue((string) $m['name']);
                }
                if ($name !== null && $name !== '') {
                    $modules[] = ['name' => $name];
                }
            }
        }

        // Extra specs = todo lo que el admin agregue, pero que no corresponde
        // a la "plantilla/stack" conocida del detalle público.
        $knownSpecKeyAliases = self::knownSpecKeyAliasesSoftwareSystem();

        $extraSpecs = self::buildExtraSpecs($specs, $knownSpecKeyAliases);

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
            'revenueLine' => 'software_system',
            'alcance' => null,
            'sla' => null,
            'demoUrl' => self::normalizeDemoUrl(self::firstSpecUrl($specs, ['demo', 'link', 'url'])),
            'demoUser' => self::firstSpecString($specs, [
                'demo_user',
                'demo_username',
                'usuario',
                'username',
                'user',
            ]),
            'demoPassword' => self::firstSpecString($specs, [
                'demo_password',
                'demo_pass',
                'contraseña',
                'contrasena',
                'password',
                'pass',
            ]),
            'images' => self::extractSpecImages($specs),
            'pricingPlans' => $skus->map(fn (CatalogSku $sku) => self::skuToPlan($sku))->values()->all(),
            'howItWorksSteps' => (function () use ($specs) {
                $candidates = [
                    'how_it_works',
                    'como_funciona',
                    'como-funciona',
                ];

                foreach ($candidates as $key) {
                    if (isset($specs[$key]) && is_array($specs[$key])) {
                        return array_values(array_filter(array_map('strval', $specs[$key])));
                    }
                }

                return null;
            })(),
            'languages' => isset($specs['languages']) && is_array($specs['languages'])
                ? array_values(array_filter(array_map('strval', $specs['languages'])))
                : null,
            'frameworks' => isset($specs['frameworks']) && is_array($specs['frameworks'])
                ? array_values(array_filter(array_map('strval', $specs['frameworks'])))
                : null,
            'databases' => isset($specs['databases']) && is_array($specs['databases'])
                ? array_values(array_filter(array_map('strval', $specs['databases'])))
                : null,
            'extraSpecs' => $extraSpecs,
            'catalogProductId' => $product->id,
        ];
    }

    /**
     * Detalle público de un producto categoría Servicios (/servicios/{slug}).
     * Reutiliza el mismo shape que `productToSystem` para la vista tipo software-detail.
     *
     * @return array<string, mixed>
     */
    public static function productToServiceSystem(CatalogProduct $product): array
    {
        $category = $product->category;
        $categorySlug = $category?->slug ?? 'general';

        $skus = $product->relationLoaded('skus')
            ? $product->skus
            : $product->skus()
                ->where('is_active', true)
                ->whereIn('sale_model', self::SERVICE_SALE_MODELS)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get();

        $badges = self::badgesFromServiceSkus($skus);

        $specs = $product->specs ?? [];

        $modules = array_map(
            static fn (string $name): array => ['name' => $name],
            self::serviceIncludesFromSpecs($specs),
        );

        $knownSpecKeyAliases = self::knownSpecKeyAliasesService();
        $extraSpecs = self::buildExtraSpecs($specs, $knownSpecKeyAliases);

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
            'revenueLine' => 'service',
            'alcance' => self::firstSpecString($specs, ['alcance']),
            'sla' => self::firstSpecString($specs, ['sla']),
            'demoUrl' => self::normalizeDemoUrl(self::firstSpecUrl($specs, ['demo', 'link', 'url'])),
            'demoUser' => self::firstSpecString($specs, [
                'demo_user',
                'demo_username',
                'usuario',
                'username',
                'user',
            ]),
            'demoPassword' => self::firstSpecString($specs, [
                'demo_password',
                'demo_pass',
                'contraseña',
                'contrasena',
                'password',
                'pass',
            ]),
            'images' => self::extractSpecImages($specs),
            'pricingPlans' => $skus->map(fn (CatalogSku $sku) => self::skuToPlan($sku))->values()->all(),
            'howItWorksSteps' => (function () use ($specs) {
                $candidates = [
                    'how_it_works',
                    'como_funciona',
                    'como-funciona',
                ];

                foreach ($candidates as $key) {
                    if (isset($specs[$key]) && is_array($specs[$key])) {
                        return array_values(array_filter(array_map('strval', $specs[$key])));
                    }
                }

                return null;
            })(),
            'languages' => isset($specs['requisitos']) && is_array($specs['requisitos'])
                ? array_values(array_filter(array_map('strval', $specs['requisitos'])))
                : null,
            'frameworks' => isset($specs['entregables']) && is_array($specs['entregables'])
                ? array_values(array_filter(array_map('strval', $specs['entregables'])))
                : null,
            'databases' => self::capacidadSpecToTags($specs),
            'extraSpecs' => $extraSpecs,
            'catalogProductId' => $product->id,
        ];
    }

    /**
     * @return list<string>
     */
    private static function knownSpecKeyAliasesSoftwareSystem(): array
    {
        return [
            // Stack visible en detalle (Sistemas)
            'modules',
            'languages',
            'frameworks',
            'databases',
            'how_it_works',
            'como_funciona',
            'como-funciona',

            // Demo (URL + credenciales)
            'demo',
            'link',
            'url',
            'demo_user',
            'demo_username',
            'usuario',
            'username',
            'user',
            'demo_password',
            'demo_pass',
            'contraseña',
            'contrasena',
            'password',
            'pass',

            // Imágenes
            'imagenes',
            'image',
            'img',
        ];
    }

    /**
     * @return list<string>
     */
    private static function knownSpecKeyAliasesService(): array
    {
        return [
            'incluye',
            'alcance',
            'entregables',
            'requisitos',
            'capacidad',
            'sla',
            'how_it_works',
            'como_funciona',
            'como-funciona',
            'demo',
            'link',
            'url',
            'demo_user',
            'demo_username',
            'usuario',
            'username',
            'user',
            'demo_password',
            'demo_pass',
            'contraseña',
            'contrasena',
            'password',
            'pass',
            'imagenes',
            'image',
            'img',
            'notas',
        ];
    }

    /**
     * @param  array<string, mixed>  $specs
     * @param  list<string>  $knownSpecKeyAliases
     * @return list<array<string, mixed>>
     */
    private static function buildExtraSpecs(array $specs, array $knownSpecKeyAliases): array
    {
        $knownAliasSet = [];
        foreach ($knownSpecKeyAliases as $k) {
            $knownAliasSet[strtolower(trim((string) $k))] = true;
        }

        $extraSpecs = [];
        foreach ($specs as $specKey => $specValue) {
            if (! is_string($specKey)) {
                continue;
            }

            $keyLower = strtolower($specKey);
            if (isset($knownAliasSet[$keyLower])) {
                continue;
            }

            if (is_array($specValue)) {
                $values = [];
                foreach ($specValue as $v) {
                    if (is_scalar($v)) {
                        $t = trim((string) $v);
                        if ($t !== '') {
                            $values[] = $t;
                        }
                        continue;
                    }

                    $values[] = json_encode($v, JSON_UNESCAPED_UNICODE);
                }

                if ($values !== []) {
                    $extraSpecs[] = [
                        'code' => $specKey,
                        'values' => array_values($values),
                    ];
                }
            } else {
                if (is_scalar($specValue)) {
                    $t = trim((string) $specValue);
                    if ($t !== '') {
                        $extraSpecs[] = [
                            'code' => $specKey,
                            'value' => $t,
                        ];
                    }
                } else {
                    $t = json_encode($specValue, JSON_UNESCAPED_UNICODE);
                    $t = trim((string) $t);
                    if ($t !== '') {
                        $extraSpecs[] = [
                            'code' => $specKey,
                            'value' => $t,
                        ];
                    }
                }
            }
        }

        return $extraSpecs;
    }

    /**
     * Etiquetas para la columna "Capacidad" en detalle de servicios (spec `capacidad`).
     *
     * @param  array<string, mixed>  $specs
     * @return list<string>|null
     */
    private static function capacidadSpecToTags(array $specs): ?array
    {
        if (! isset($specs['capacidad'])) {
            return null;
        }

        $v = $specs['capacidad'];
        if (is_array($v)) {
            $out = array_values(array_filter(array_map('strval', $v)));

            return $out !== [] ? $out : null;
        }

        if (is_string($v)) {
            $parts = preg_split('/[\n\r,]+/', $v) ?: [];
            $out = [];
            foreach ($parts as $p) {
                $t = trim((string) $p);
                if ($t !== '') {
                    $out[] = $t;
                }
            }

            return $out !== [] ? $out : null;
        }

        if (is_scalar($v)) {
            $t = trim((string) $v);

            return $t !== '' ? [$t] : null;
        }

        return null;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, CatalogSku>  $skus
     * @return list<string>
     */
    private static function badgesFromServiceSkus($skus): array
    {
        $out = [];
        $models = $skus->pluck('sale_model')->unique()->all();

        foreach ($models as $sm) {
            $out[] = match ($sm) {
                'service_project' => 'Proyecto / implementación',
                'service_subscription' => 'Servicio recurrente',
                default => (string) $sm,
            };
        }

        return $out;
    }

    private static function normalizeDemoUrl(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }

        $t = trim($url);
        if ($t === '') {
            return null;
        }

        // Si guardan solo el dominio (ej. example.com) lo convertimos a https.
        if (! Str::startsWith($t, ['http://', 'https://'])) {
            $t = 'https://'.ltrim($t, '/');
        }

        return $t;
    }

    /**
     * En especificaciones, a veces cada ítem de `modules` se guarda como texto con JSON
     * (p. ej. {"name":"Plan de cuentas"}) en lugar del nombre solo. Devolvemos el nombre legible.
     */
    private static function normalizeModuleNameFromSpecValue(string $raw): ?string
    {
        $t = trim($raw);
        if ($t === '') {
            return null;
        }

        if (str_starts_with($t, '{') && str_contains($t, '"name"')) {
            $decoded = json_decode($t, true);
            if (is_array($decoded) && array_key_exists('name', $decoded)) {
                $n = trim((string) $decoded['name']);
                if ($n !== '') {
                    return $n;
                }
            }
        }

        return $t;
    }

    /**
     * Extrae ítems de `incluye` para servicios.
     * Soporta:
     * - lista real (["DNS", "Buzones"])
     * - texto multilínea con o sin guiones
     * - texto con separadores por coma o punto y coma
     *
     * @param  array<string, mixed>  $specs
     * @return list<string>
     */
    private static function serviceIncludesFromSpecs(array $specs): array
    {
        if (!array_key_exists('incluye', $specs)) {
            return [];
        }

        $raw = $specs['incluye'];
        $out = [];

        if (is_array($raw)) {
            foreach ($raw as $item) {
                if (is_string($item)) {
                    $name = self::normalizeModuleNameFromSpecValue($item);
                    if ($name !== null && $name !== '') {
                        $out[] = ltrim($name, "- \t");
                    }
                } elseif (is_array($item) && isset($item['name']) && is_scalar($item['name'])) {
                    $name = self::normalizeModuleNameFromSpecValue((string) $item['name']);
                    if ($name !== null && $name !== '') {
                        $out[] = ltrim($name, "- \t");
                    }
                }
            }
        } elseif (is_scalar($raw)) {
            $text = trim((string) $raw);
            if ($text !== '') {
                $parts = preg_split('/[\r\n;,]+/', $text) ?: [];
                foreach ($parts as $part) {
                    $name = self::normalizeModuleNameFromSpecValue((string) $part);
                    if ($name !== null && $name !== '') {
                        $out[] = ltrim($name, "- \t");
                    }
                }
            }
        }

        return array_values(array_unique(array_filter($out, static fn (string $v): bool => trim($v) !== '')));
    }

    /**
     * Extrae una lista de strings desde `specs` para claves de imágenes (case-insensitive).
     *
     * El valor puede ser:
     * - string (posible lista separada por comas o saltos)
     * - array de strings
     *
     * @param  array<string, mixed>  $specs
     * @return list<string>
     */
    private static function extractSpecImages(array $specs): array
    {
        $aliases = ['imagenes', 'image', 'img'];

        $out = [];

        foreach ($specs as $specKey => $specValue) {
            if (!is_string($specKey)) {
                continue;
            }

            $keyLower = strtolower($specKey);

            if (!in_array($keyLower, $aliases, true)) {
                continue;
            }

            if (is_string($specValue)) {
                // Soporta "url1,url2" o "url1\nurl2"
                $parts = preg_split('/[\n\r,]+/', $specValue) ?: [];
                foreach ($parts as $p) {
                    $t = trim((string) $p);
                    if ($t !== '') {
                        $out[] = $t;
                    }
                }
            } elseif (is_array($specValue)) {
                foreach ($specValue as $item) {
                    if (!is_scalar($item)) {
                        continue;
                    }
                    $t = trim((string) $item);
                    if ($t !== '') {
                        $out[] = $t;
                    }
                }
            } elseif (is_scalar($specValue)) {
                $t = trim((string) $specValue);
                if ($t !== '') {
                    $out[] = $t;
                }
            }
        }

        // Unique preserving order
        $unique = [];
        $seen = [];
        foreach ($out as $u) {
            $k = (string) $u;
            if (isset($seen[$k])) {
                continue;
            }
            $seen[$k] = true;
            $unique[] = $u;
        }

        return $unique;
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
            'listPrice' => (float) $sku->list_price,
            'currency' => $currency,
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
            'service_project' => 'Servicio por proyecto',
            'service_subscription' => 'Servicio recurrente',
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
