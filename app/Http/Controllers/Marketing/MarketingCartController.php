<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class MarketingCartController extends Controller
{
    public function __invoke(Request $request): Response
    {
        if ($request->query('renew') === '1' || $request->filled('renew_plan_id')) {
            $request->session()->put('saas_marketing_renewal', true);
        }

        $renewTenantSlug = session('vetsaas_renew_tenant_slug');

        return Inertia::render('marketing-cart', [
            'canRegister' => Features::enabled(Features::registration()),
            'salesIgvRate' => (float) config('sales.igv_rate', 0.18),
            'vetsaasRenewTenantSlug' => is_string($renewTenantSlug) && trim($renewTenantSlug) !== ''
                ? trim($renewTenantSlug)
                : null,
        ]);
    }
}
