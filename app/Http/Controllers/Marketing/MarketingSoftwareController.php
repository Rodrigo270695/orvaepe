<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogCategory;
use App\Support\MarketingSoftwareCatalogPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingSoftwareController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $saleModels = MarketingSoftwareCatalogPresenter::OWN_SOFTWARE_SALE_MODELS;

        $categories = CatalogCategory::query()
            ->where('is_active', true)
            ->where('revenue_line', 'software_system')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with([
                'products' => function ($q) use ($saleModels) {
                    $q->where('is_active', true)
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
                        ->orderBy('name');
                },
            ])
            ->get()
            ->map(function (CatalogCategory $category) {
                $systems = $category->products
                    ->map(fn ($product) => MarketingSoftwareCatalogPresenter::productToSystem($product))
                    ->values()
                    ->all();

                return [
                    'slug' => $category->slug,
                    'title' => $category->name,
                    'description' => (string) ($category->description ?? ''),
                    'systems' => $systems,
                ];
            })
            ->filter(fn (array $c) => count($c['systems']) > 0)
            ->values()
            ->all();

        $catalogSearch = null;
        $q = $request->query('q');
        if (is_string($q)) {
            $trimmed = mb_substr(trim($q), 0, 160);
            $catalogSearch = $trimmed !== '' ? $trimmed : null;
        }

        return Inertia::render('software', [
            'canRegister' => Features::enabled(Features::registration()),
            'softwareCategories' => $categories,
            'softwareCatalogSearch' => $catalogSearch,
        ]);
    }
}
