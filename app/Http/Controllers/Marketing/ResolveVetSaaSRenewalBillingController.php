<?php

declare(strict_types=1);

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Services\Checkout\VetSaaSRenewalBillingClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResolveVetSaaSRenewalBillingController extends Controller
{
    public function __invoke(Request $request, VetSaaSRenewalBillingClient $client): JsonResponse
    {
        $tenantSlug = trim((string) session('vetsaas_renew_tenant_slug', ''));

        if ($tenantSlug === '') {
            return response()->json([
                'applies' => false,
                'plan_amount' => 0,
                'bot_ia_amount' => 0,
                'total_amount' => 0,
                'addons' => [],
            ]);
        }

        $billing = $client->forTenantSlug($tenantSlug);

        if ($billing === null) {
            return response()->json([
                'applies' => false,
                'plan_amount' => 0,
                'bot_ia_amount' => 0,
                'total_amount' => 0,
                'addons' => [],
            ]);
        }

        return response()->json($billing);
    }
}
