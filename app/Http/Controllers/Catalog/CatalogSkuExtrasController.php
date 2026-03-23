<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CatalogSkuExtrasUpdateRequest;
use App\Models\CatalogSku;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CatalogSkuExtrasController extends Controller
{
    public function index(CatalogSku $catalog_sku): Response
    {
        $catalog_sku->load(['product:id,name,slug,category_id', 'product.category:id,name,revenue_line']);

        $limits = $catalog_sku->limits;
        $metadata = $catalog_sku->metadata;

        return Inertia::render('admin/catalogo-skus/extras', [
            'sku' => [
                'id' => $catalog_sku->id,
                'code' => $catalog_sku->code,
                'name' => $catalog_sku->name,
                'product' => $catalog_sku->product,
            ],
            'limitsJson' => $limits === null
                ? ''
                : json_encode($limits, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            'metadataJson' => $metadata === null
                ? ''
                : json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        ]);
    }

    public function update(
        CatalogSkuExtrasUpdateRequest $request,
        CatalogSku $catalog_sku,
    ): RedirectResponse {
        $catalog_sku->update([
            'limits' => $request->validated('limits'),
            'metadata' => $request->validated('metadata'),
        ]);

        return redirect()
            ->route('panel.catalogo-skus.extras.index', $catalog_sku)
            ->with('toast', AdminFlashToast::success('Límites y metadata guardados'));
    }
}
