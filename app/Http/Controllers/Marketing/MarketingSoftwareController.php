<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Support\MarketingSoftwareCatalogPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingSoftwareController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $catalogSearch = null;
        $q = $request->query('q');
        if (is_string($q)) {
            $trimmed = mb_substr(trim($q), 0, 160);
            $catalogSearch = $trimmed !== '' ? $trimmed : null;
        }

        return Inertia::render('software', [
            'canRegister' => Features::enabled(Features::registration()),
            'softwareCategories' => MarketingSoftwareCatalogPresenter::publishedCategorySections(),
            'softwareCatalogSearch' => $catalogSearch,
        ]);
    }
}
