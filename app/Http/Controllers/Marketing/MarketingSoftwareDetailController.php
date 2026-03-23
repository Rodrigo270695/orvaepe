<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Support\MarketingSoftwareCatalogPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingSoftwareDetailController extends Controller
{
    public function show(Request $request, string $system): Response
    {
        $saleModels = MarketingSoftwareCatalogPresenter::OWN_SOFTWARE_SALE_MODELS;

        $product = CatalogProduct::query()
            ->where('slug', $system)
            ->where('is_active', true)
            ->whereHas('category', function ($q) {
                $q->where('is_active', true)
                    ->where('revenue_line', 'software_system');
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
                'softwareReleases' => function ($rq) {
                    $rq->orderByDesc('released_at')->limit(1);
                },
            ])
            ->first();

        return Inertia::render('software-detail', [
            'canRegister' => Features::enabled(Features::registration()),
            'system' => $product
                ? MarketingSoftwareCatalogPresenter::productToSystem($product)
                : null,
        ]);
    }
}
