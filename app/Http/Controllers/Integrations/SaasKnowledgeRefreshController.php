<?php

declare(strict_types=1);

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Services\SalesHub\SaasKnowledgeClient;
use Illuminate\Http\JsonResponse;

/**
 * POST /api/internal/saas/{producto}/knowledge/refresh — el SaaS avisa que cambió su conocimiento de ventas.
 */
class SaasKnowledgeRefreshController extends Controller
{
    public function __invoke(string $producto, SaasKnowledgeClient $client): JsonResponse
    {
        $client->forget($producto);

        return response()->json(['ok' => true]);
    }
}
