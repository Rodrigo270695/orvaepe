<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Support\Http\OrvaeSignedHttpClient;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Entrega un evento normalizado a la API interna del producto (firmada con HMAC, nunca pública).
 * Nunca incluye el token de Meta ni el payload crudo del webhook.
 */
final class ProductEventForwarder
{
    /**
     * @param  array<string, mixed>  $event
     */
    public function forward(string $producto, array $event): void
    {
        $url = trim((string) config("whatsapp_cloud.products.{$producto}.events_url", ''));
        $secret = (string) config("services.{$producto}.hmac_secret", '');

        if ($url === '' || $secret === '') {
            Log::warning('whatsapp_cloud.forward_skipped_missing_config', [
                'producto' => $producto,
                'evento' => $event['evento'] ?? null,
            ]);

            return;
        }

        $response = OrvaeSignedHttpClient::post(
            $url,
            $event,
            $secret,
            'wa:'.$producto.':'.($event['wa_message_id'] ?? '').':'.($event['evento'] ?? '').':'.($event['estado'] ?? ''),
            timeoutSeconds: 15,
            retries: 0,
        );

        if (! $response->successful()) {
            throw new RuntimeException("El producto {$producto} respondió HTTP {$response->status()} al evento WhatsApp.");
        }
    }
}
