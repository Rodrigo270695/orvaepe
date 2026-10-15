<?php

declare(strict_types=1);

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Models\OpenWaLine;
use App\Services\SalesHub\InboundHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Mensajes de una línea OpenWA de ORVAE (POST /api/webhooks/openwa-lines/{line}).
 * OpenWA firma el body con HMAC-SHA256 usando SALESHUB_WEBHOOK_SECRET.
 */
class OpenWaLineWebhookController extends Controller
{
    public function __invoke(Request $request, OpenWaLine $line, InboundHandler $handler): JsonResponse
    {
        $secret = (string) config('saleshub.webhook_secret');

        if ($secret === '') {
            return response()->json(['error' => 'webhook_not_configured'], 503);
        }

        if (! $this->validSignature($request, $secret)) {
            Log::warning('saleshub.webhook_unauthorized', ['line' => $line->id]);

            return response()->json(['error' => 'unauthorized'], 401);
        }

        $payload = $request->json()->all();

        return response()->json(['ok' => true, 'result' => $handler->handle($line, is_array($payload) ? $payload : [])]);
    }

    private function validSignature(Request $request, string $secret): bool
    {
        $signature = (string) ($request->header('X-Webhook-Signature') ?: $request->header('X-OpenWA-Signature', ''));

        if ($signature !== '') {
            $expected = hash_hmac('sha256', $request->getContent(), $secret);
            $received = str_starts_with($signature, 'sha256=') ? substr($signature, 7) : $signature;

            return hash_equals($expected, $received);
        }

        $legacy = (string) $request->header('X-Webhook-Secret', '');

        return $legacy !== '' && hash_equals($secret, $legacy);
    }
}
