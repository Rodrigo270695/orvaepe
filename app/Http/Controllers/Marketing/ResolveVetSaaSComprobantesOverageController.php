<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Services\Checkout\VetSaaSComprobantesOverageClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResolveVetSaaSComprobantesOverageController extends Controller
{
    public function __invoke(Request $request, VetSaaSComprobantesOverageClient $client): JsonResponse
    {
        $tenantSlug = trim((string) session('vetsaas_renew_tenant_slug', ''));

        if ($tenantSlug === '') {
            return response()->json([
                'applies' => false,
                'overage_cost' => '0.00',
            ]);
        }

        $overage = $client->forTenantSlug($tenantSlug);

        if ($overage === null) {
            return response()->json([
                'applies' => false,
                'overage_cost' => '0.00',
            ]);
        }

        return response()->json($overage);
    }
}
