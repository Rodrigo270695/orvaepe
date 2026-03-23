<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingCartController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('marketing-cart', [
            'canRegister' => Features::enabled(Features::registration()),
            'paypalSimulateCheckout' => config('paypal.simulate_checkout') && app()->environment('local'),
            'salesIgvRate' => (float) config('sales.igv_rate', 0.18),
        ]);
    }
}
