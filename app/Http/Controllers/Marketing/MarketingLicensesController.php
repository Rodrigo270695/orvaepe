<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Support\MarketingOemLicensesPresenter;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingLicensesController extends Controller
{
    public function __invoke(): Response
    {
        $products = CatalogProduct::query()
            ->where('is_active', true)
            ->whereHas('category', function ($q) {
                $q->where('revenue_line', 'oem_license');
            })
            ->with([
                'skus' => function ($q) {
                    $q->where('is_active', true)
                        ->orderBy('sort_order')
                        ->orderBy('name');
                },
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('licenses', [
            'canRegister' => Features::enabled(Features::registration()),
            'sections' => MarketingOemLicensesPresenter::sections($products),
        ]);
    }
}
