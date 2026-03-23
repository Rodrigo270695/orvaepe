<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogSku;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ResolveCartSkuPricesController extends Controller
{
    /**
     * Devuelve precios de lista del catálogo por UUID de SKU (plan_id en el carrito).
     *
     * @return array<string, array{list_price: float, currency: string, name: string}>
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plan_ids' => ['required', 'array', 'min:1'],
            'plan_ids.*' => ['required', 'uuid'],
        ]);

        $ids = array_values(array_unique($data['plan_ids']));

        $columns = ['id', 'name', 'list_price', 'currency', 'tax_included'];
        if (Schema::hasColumn('catalog_skus', 'igv_applies')) {
            $columns[] = 'igv_applies';
        }

        $skus = CatalogSku::query()
            ->whereIn('id', $ids)
            ->where('is_active', true)
            ->get($columns);

        $prices = [];
        foreach ($skus as $sku) {
            $prices[$sku->id] = [
                'list_price' => (float) $sku->list_price,
                'currency' => strtoupper((string) $sku->currency),
                'name' => (string) $sku->name,
                'tax_included' => (bool) $sku->tax_included,
                'igv_applies' => Schema::hasColumn('catalog_skus', 'igv_applies')
                    ? (bool) ($sku->igv_applies ?? true)
                    : true,
            ];
        }

        return response()->json(['prices' => $prices]);
    }
}
