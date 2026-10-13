<?php

namespace App\Http\Controllers\WhatsAppCloud;

use App\Http\Controllers\Controller;
use App\Jobs\WhatsAppCloud\ProcessWebhookPayload;
use App\Services\WhatsAppCloud\WebhookSignature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Verificación de Meta al suscribir el webhook.
     */
    public function verify(Request $request): Response
    {
        $expected = (string) config('whatsapp_cloud.verify_token', '');
        $mode = $this->hubParam($request, 'mode');
        $token = $this->hubParam($request, 'verify_token');

        if ($expected === '' || $mode !== 'subscribe' || ! hash_equals($expected, $token)) {
            return response('Forbidden', 403)->header('Content-Type', 'text/plain');
        }

        return response($this->hubParam($request, 'challenge'), 200)->header('Content-Type', 'text/plain');
    }

    /**
     * Eventos de Meta: valida firma, encola y responde de inmediato.
     */
    public function receive(Request $request): JsonResponse
    {
        $raw = $request->getContent();

        if (! WebhookSignature::isValid($raw, $request->header('X-Hub-Signature-256'), (string) config('whatsapp_cloud.app_secret', ''))) {
            Log::warning('whatsapp_cloud.webhook_invalid_signature', ['ip' => $request->ip()]);

            return response()->json(['ok' => false], 401);
        }

        $payload = json_decode($raw, true);
        if (! is_array($payload)) {
            return response()->json(['ok' => false], 400);
        }

        ProcessWebhookPayload::dispatch($payload);

        return response()->json(['ok' => true]);
    }

    /**
     * PHP convierte "hub.mode" en "hub_mode" al parsear la query; aceptamos ambas formas.
     */
    private function hubParam(Request $request, string $name): string
    {
        return (string) ($request->query('hub_'.$name) ?? $request->query('hub.'.$name) ?? '');
    }
}
