<?php

declare(strict_types=1);

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Services\Checkout\TallerSaaSMarketingClient;
use App\Services\SalesHub\SaasKnowledgeClient;
use Illuminate\Http\JsonResponse;

/**
 * POST /api/internal/tallersaas/marketing/refresh — TallerSaaS avisa que cambió planes/features.
 */
class TallerSaaSMarketingRefreshController extends Controller
{
    public function __invoke(TallerSaaSMarketingClient $client, SaasKnowledgeClient $knowledge): JsonResponse
    {
        $client->forgetCache();
        $knowledge->forget('tallersaas');

        return response()->json(['ok' => true]);
    }
}
