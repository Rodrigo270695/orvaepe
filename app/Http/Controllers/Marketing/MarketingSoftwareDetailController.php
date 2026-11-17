<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Services\Checkout\FoodSaaSMarketingClient;
use App\Services\Checkout\TallerSaaSMarketingClient;
use App\Services\Checkout\VetSaaSMarketingClient;
use App\Services\Checkout\VetSaaSShowcaseClient;
use App\Support\Marketing\FoodSaaSSoftware;
use App\Support\Marketing\TallerSaaSSoftware;
use App\Support\Marketing\VetSaaSSoftware;
use App\Support\MarketingSoftwareCatalogPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingSoftwareDetailController extends Controller
{
    public function show(
        Request $request,
        string $system,
        VetSaaSShowcaseClient $showcaseClient,
        VetSaaSMarketingClient $marketingClient,
        TallerSaaSMarketingClient $tallerMarketingClient,
        FoodSaaSMarketingClient $foodMarketingClient,
    ): Response {
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

        if ($product === null && FoodSaaSSoftware::isSlug($system)) {
            $product = CatalogProduct::query()
                ->whereRaw('LOWER(slug) in (?, ?)', ['foodsaas', 'food-saas'])
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
        }

        $isVetsaas = VetSaaSSoftware::isProduct($product);
        $resolved = $product
            ? MarketingSoftwareCatalogPresenter::productToSystem($product)
            : (FoodSaaSSoftware::isSlug($system) ? FoodSaaSSoftware::fallback($system) : null);

        return Inertia::render('software-detail', [
            'canRegister' => Features::enabled(Features::registration()),
            'system' => $resolved,
            'vetsaasShowcaseClients' => $isVetsaas
                ? $showcaseClient->clients()
                : [],
            'vetsaasMarketing' => $isVetsaas
                ? $marketingClient->payload()
                : null,
            'tallersaasMarketing' => TallerSaaSSoftware::isProduct($product)
                ? $tallerMarketingClient->payload()
                : null,
            'foodsaasMarketing' => FoodSaaSSoftware::isSlug($system) || FoodSaaSSoftware::isProduct($product)
                ? $foodMarketingClient->payload()
                : null,
        ]);
    }
}
