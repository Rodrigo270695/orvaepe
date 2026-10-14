<?php

declare(strict_types=1);

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Services\Checkout\TallerSaaSMarketingClient;
use Illuminate\Http\JsonResponse;

/**
 * POST /api/internal/tallersaas/marketing/refresh — TallerSaaS avisa que cambió planes/features.
 */
class TallerSaaSMarketingRefreshController extends Controller
{
    public function __invoke(TallerSaaSMarketingClient $client): JsonResponse
    {
        $client->forgetCache();

        return response()->json(['ok' => true]);
    }
}
