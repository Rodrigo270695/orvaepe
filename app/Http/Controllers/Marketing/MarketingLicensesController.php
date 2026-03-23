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
    /**
     * Orden de secciones (listas tipo flyer / PDF de precios).
     *
     * @var list<string>
     */
    private const SECTION_SLUG_ORDER = [
        'oem-mas-vendidos',
        'oem-antivirus-principales',
        'oem-antivirus-otros',
        'oem-otros-productos',
        'oem-office-mac',
        'oem-nuevos-ingresos',
    ];

    public function __invoke(): Response
    {
        $products = CatalogProduct::query()
            ->where('is_active', true)
            ->whereIn('slug', self::SECTION_SLUG_ORDER)
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
            ->get();

        $ordered = $products->sortBy(function (CatalogProduct $p) {
            $i = array_search($p->slug, self::SECTION_SLUG_ORDER, true);

            return $i === false ? 999 : $i;
        })->values();

        return Inertia::render('licenses', [
            'canRegister' => Features::enabled(Features::registration()),
            'sections' => MarketingOemLicensesPresenter::sections($ordered),
        ]);
    }
}
