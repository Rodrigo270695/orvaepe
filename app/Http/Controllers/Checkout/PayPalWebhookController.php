<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Models\WebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayPalWebhookController extends Controller
{
    /**
     * Webhook de PayPal.
     *
     * Registra el evento en la tabla webhook_events para tener trazabilidad
     * e idempotencia, igual que con Mercado Pago. El procesamiento posterior
     * (actualizar pedidos, etc.) puede engancharse más adelante sobre este registro.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        $eventType = strtolower((string) ($payload['event_type'] ?? 'unknown'));
        $resourceId = (string) data_get($payload, 'resource.id', '');

        $gatewayEventId = trim($eventType.':'.$resourceId);
        if ($gatewayEventId === ':' || $gatewayEventId === '') {
            $gatewayEventId = 'unknown:'.sha1((string) $request->getContent());
        }

        $event = WebhookEvent::query()->firstOrCreate(
            [
                'gateway' => 'paypal',
                'gateway_event_id' => $gatewayEventId,
            ],
            [
                'event_type' => $eventType,
                'payload' => $payload,
                'processed' => false,
                'attempts' => 0,
            ],
        );

        if ($event->wasRecentlyCreated) {
            return response()->json(['ok' => true, 'created' => true]);
        }

        return response()->json(['ok' => true, 'duplicate' => true]);
    }
}

