<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Support\MarketingSoftwareCatalogPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingServiceDetailController extends Controller
{
    public function show(Request $request, string $service): Response
    {
        $saleModels = MarketingSoftwareCatalogPresenter::SERVICE_SALE_MODELS;

        $product = CatalogProduct::query()
            ->where('slug', $service)
            ->where('is_active', true)
            ->whereHas('category', function ($q) {
                $q->where('is_active', true)
                    ->where('revenue_line', 'service');
            })
            ->whereHas('skus', function ($sq) use ($saleModels) {
                $sq->where('is_active', true)
                    ->whereIn('sale_model', $saleModels);
            })
            ->with([
                'category:id,slug,name',
                'skus' => function ($sq) use ($saleModels) {
                    $sq->where('is_active', true)
                        ->whereIn('sale_model', $saleModels)
                        ->orderBy('sort_order')
                        ->orderBy('name');
                },
            ])
            ->first();

        return Inertia::render('service-detail', [
            'canRegister' => Features::enabled(Features::registration()),
            'system' => $product
                ? MarketingSoftwareCatalogPresenter::productToServiceSystem($product)
                : null,
        ]);
    }
}
