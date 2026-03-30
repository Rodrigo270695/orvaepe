<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Support\MarketingOemLicensesPresenter;
use App\Support\MarketingServicesNavGroups;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingServicesController extends Controller
{
    public function __invoke(): Response
    {
        $ordered = MarketingServicesNavGroups::orderedProductsForCatalogPage();

        return Inertia::render('services', [
            'canRegister' => Features::enabled(Features::registration()),
            'sections' => MarketingOemLicensesPresenter::sections($ordered),
        ]);
    }
}
