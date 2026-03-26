<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CatalogProductSpecsUpdateRequest;
use App\Models\CatalogProduct;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CatalogProductSpecsController extends Controller
{
    public function index(CatalogProduct $catalog_product): Response
    {
        $catalog_product->load(['category:id,name,revenue_line']);

        $raw = $catalog_product->specs;
        $existingPairs = [];
        $existingOrder = [];

        if (is_array($raw) && $raw !== []) {
            foreach ($raw as $code => $value) {
                if (!is_string($code)) {
                    continue;
                }

                if (is_array($value)) {
                    $items = [];
                    foreach ($value as $v) {
                        if (is_scalar($v)) {
                            $items[] = (string) $v;
                        } else {
                            $items[] = json_encode($v, JSON_UNESCAPED_UNICODE);
                        }
                    }
                    $pair = [
                        'code' => $code,
                        'value_kind' => 'list',
                        'value' => '',
                        'values' => $items !== [] ? $items : [''],
                    ];
                } else {
                    $pair = [
                        'code' => $code,
                        'value_kind' => 'text',
                        'value' => is_scalar($value) ? (string) $value : json_encode($value),
                        'values' => [''],
                    ];
                }

                $existingPairs[$code] = $pair;
                $existingOrder[] = $code;
            }
        }

        $pairs = [];
        $revenueLine = $catalog_product->category?->revenue_line;

        // Plantilla para Sistemas (stack del detalle público)
        if ($revenueLine === 'software_system') {
            $template = [
                // Stack principal que aparece en /software/{slug}
                ['code' => 'modules', 'value_kind' => 'list'],
                ['code' => 'languages', 'value_kind' => 'list'],
                ['code' => 'frameworks', 'value_kind' => 'list'],
                ['code' => 'databases', 'value_kind' => 'list'],
                // En detalle se muestra como "Cómo se pone en marcha".
                // En admin lo mostramos en español como `como_funciona`.
                ['code' => 'como_funciona', 'value_kind' => 'list'],

                // Demo
                ['code' => 'demo', 'value_kind' => 'text'],
                ['code' => 'demo_user', 'value_kind' => 'text'],
                ['code' => 'demo_password', 'value_kind' => 'text'],

                // Imágenes (uploader)
                ['code' => 'imagenes', 'value_kind' => 'list'],
            ];

            // Alias para mapear keys guardadas con variaciones
            $demoUrlAliases = ['demo', 'link', 'url'];
            $demoUserAliases = ['demo_user', 'demo_username', 'usuario', 'username', 'user'];
            $demoPasswordAliases = ['demo_password', 'demo_pass', 'contraseña', 'contrasena', 'password', 'pass'];
            $imagesAliases = ['imagenes', 'image', 'img'];
            $howItWorksAliases = [
                'como_funciona',
                'how_it_works',
                'como-funciona',
                'how-it-works',
            ];

            $usedExistingCodes = [];

            foreach ($template as $t) {
                $code = $t['code'];
                $kind = $t['value_kind'];

                $selected = null;

                if ($code === 'demo') {
                    foreach ($demoUrlAliases as $a) {
                        if (isset($existingPairs[$a])) {
                            $selected = $existingPairs[$a];
                            $usedExistingCodes[] = $a;
                            break;
                        }
                    }
                } elseif ($code === 'demo_user') {
                    foreach ($demoUserAliases as $a) {
                        if (isset($existingPairs[$a])) {
                            $selected = $existingPairs[$a];
                            $usedExistingCodes[] = $a;
                            break;
                        }
                    }
                } elseif ($code === 'demo_password') {
                    foreach ($demoPasswordAliases as $a) {
                        if (isset($existingPairs[$a])) {
                            $selected = $existingPairs[$a];
                            $usedExistingCodes[] = $a;
                            break;
                        }
                    }
                } elseif ($code === 'imagenes') {
                    foreach ($imagesAliases as $a) {
                        if (isset($existingPairs[$a])) {
                            $selected = $existingPairs[$a];
                            $usedExistingCodes[] = $a;
                            break;
                        }
                    }
                } elseif ($code === 'como_funciona') {
                    foreach ($howItWorksAliases as $a) {
                        if (isset($existingPairs[$a])) {
                            $selected = $existingPairs[$a];
                            $usedExistingCodes[] = $a;
                            break;
                        }
                    }
                } else {
                    if (isset($existingPairs[$code])) {
                        $selected = $existingPairs[$code];
                        $usedExistingCodes[] = $code;
                    }
                }

                if ($selected !== null) {
                    // Si el key original es alias (ej. `image`), mantenemos el key guardado.
                    // El detalle público es case-insensitive y entiende aliases.
                    $pairs[] = $selected;
                } else {
                    // Fila vacía de la plantilla
                    if ($kind === 'list') {
                        $pairs[] = [
                            'code' => $code,
                            'value_kind' => 'list',
                            'value' => '',
                            'values' => [''],
                        ];
                    } else {
                        $pairs[] = [
                            'code' => $code,
                            'value_kind' => 'text',
                            'value' => '',
                            'values' => [''],
                        ];
                    }
                }
            }

            // Agrega cualquier spec extra que el admin haya creado
            foreach ($existingOrder as $code) {
                if (!in_array($code, $usedExistingCodes, true)) {
                    $pairs[] = $existingPairs[$code];
                }
            }
        } elseif ($revenueLine === 'service') {
            // Plantilla para Servicios (detalle /servicios/{slug})
            $template = [
                ['code' => 'incluye', 'value_kind' => 'list'],
                ['code' => 'alcance', 'value_kind' => 'text'],
                ['code' => 'entregables', 'value_kind' => 'list'],
                ['code' => 'requisitos', 'value_kind' => 'list'],
                ['code' => 'capacidad', 'value_kind' => 'list'],
                ['code' => 'sla', 'value_kind' => 'text'],
                ['code' => 'como_funciona', 'value_kind' => 'list'],
                ['code' => 'imagenes', 'value_kind' => 'list'],
                ['code' => 'notas', 'value_kind' => 'text'],
            ];

            $imagesAliases = ['imagenes', 'image', 'img'];
            $howItWorksAliases = [
                'como_funciona',
                'how_it_works',
                'como-funciona',
                'how-it-works',
            ];

            $usedExistingCodes = [];

            foreach ($template as $t) {
                $code = $t['code'];
                $kind = $t['value_kind'];

                $selected = null;

                if ($code === 'imagenes') {
                    foreach ($imagesAliases as $a) {
                        if (isset($existingPairs[$a])) {
                            $selected = $existingPairs[$a];
                            $usedExistingCodes[] = $a;
                            break;
                        }
                    }
                } elseif ($code === 'como_funciona') {
                    foreach ($howItWorksAliases as $a) {
                        if (isset($existingPairs[$a])) {
                            $selected = $existingPairs[$a];
                            $usedExistingCodes[] = $a;
                            break;
                        }
                    }
                } else {
                    if (isset($existingPairs[$code])) {
                        $selected = $existingPairs[$code];
                        $usedExistingCodes[] = $code;
                    }
                }

                if ($selected !== null) {
                    $pairs[] = $selected;
                } elseif ($kind === 'list') {
                    $pairs[] = [
                        'code' => $code,
                        'value_kind' => 'list',
                        'value' => '',
                        'values' => [''],
                    ];
                } else {
                    $pairs[] = [
                        'code' => $code,
                        'value_kind' => 'text',
                        'value' => '',
                        'values' => [''],
                    ];
                }
            }

            foreach ($existingOrder as $code) {
                if (!in_array($code, $usedExistingCodes, true)) {
                    $pairs[] = $existingPairs[$code];
                }
            }
        } else {
            // Para otras líneas, comportamiento anterior: si no hay pairs, dejar 1 fila vacía.
            $pairs = array_values($existingPairs);

            if ($pairs === []) {
                $pairs[] = [
                    'code' => '',
                    'value_kind' => 'text',
                    'value' => '',
                    'values' => [''],
                ];
            }
        }

        return Inertia::render('admin/catalogo-productos/specs', [
            'product' => [
                'id' => $catalog_product->id,
                'name' => $catalog_product->name,
                'slug' => $catalog_product->slug,
                'tagline' => $catalog_product->tagline,
                'category' => $catalog_product->category,
            ],
            'pairs' => $pairs,
        ]);
    }

    public function update(
        CatalogProductSpecsUpdateRequest $request,
        CatalogProduct $catalog_product,
    ): RedirectResponse {
        $specs = $request->specsObject();

        $catalog_product->update([
            'specs' => $specs === [] ? null : $specs,
        ]);

        return redirect()
            ->route('panel.catalogo-productos.specs.index', $catalog_product)
            ->with('toast', AdminFlashToast::success('Especificaciones guardadas'));
    }
}
