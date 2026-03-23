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
        $pairs = [];

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
                    $pairs[] = [
                        'code' => $code,
                        'value_kind' => 'list',
                        'value' => '',
                        'values' => $items !== [] ? $items : [''],
                    ];
                } else {
                    $pairs[] = [
                        'code' => $code,
                        'value_kind' => 'text',
                        'value' => is_scalar($value) ? (string) $value : json_encode($value),
                        'values' => [''],
                    ];
                }
            }
        }

        if ($pairs === []) {
            $pairs[] = [
                'code' => '',
                'value_kind' => 'text',
                'value' => '',
                'values' => [''],
            ];
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
