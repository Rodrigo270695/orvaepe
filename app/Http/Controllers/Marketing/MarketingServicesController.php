<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Support\MarketingOemLicensesPresenter;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingServicesController extends Controller
{
    /**
     * Orden de secciones en /servicios (catálogo marketing).
     *
     * @var list<string>
     */
    private const SECTION_SLUG_ORDER = [
        'svc-correos-corporativos',
        'svc-integraciones',
        'svc-despliegue-onboarding',
        'svc-capacitacion',
    ];

    public function __invoke(): Response
    {
        $products = CatalogProduct::query()
            ->where('is_active', true)
            ->whereIn('slug', self::SECTION_SLUG_ORDER)
            ->whereHas('category', function ($q) {
                $q->where('revenue_line', 'service');
            })
            ->with([
                'skus' => function ($q) {
                    $q->where('is_active', true)
                        ->orderBy('sort_order')
                        ->orderBy('name');
                },
            ])
            ->get();

        $ordered = $products->sortBy(function (CatalogProduct $p) {
            $i = array_search($p->slug, self::SECTION_SLUG_ORDER, true);

            return $i === false ? 999 : $i;
        })->values();

        return Inertia::render('services', [
            'canRegister' => Features::enabled(Features::registration()),
            'sections' => MarketingOemLicensesPresenter::sections($ordered),
        ]);
    }
}
