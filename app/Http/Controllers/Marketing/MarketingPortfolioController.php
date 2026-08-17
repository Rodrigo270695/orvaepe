<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\ShowcaseClient;
use App\Support\MarketingSoftwareCatalogPresenter;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingPortfolioController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('portafolio', [
            'canRegister' => Features::enabled(Features::registration()),
            'softwareCategories' => MarketingSoftwareCatalogPresenter::publishedCategorySections(),
            'showcaseClients' => ShowcaseClient::publishedForPublic(),
        ]);
    }
}
