<?php

declare(strict_types=1);

namespace App\Support\Http;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * POST JSON firmado con HMAC (mismo algoritmo que espera VetSaaS / Aula Virtual).
 *
 * El cuerpo firmado debe ser byte-a-byte idéntico al enviado; por eso no usamos asJson().
 */
final class OrvaeSignedHttpClient
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public static function post(
        string $url,
        array $payload,
        string $secret,
        string $idempotencyKey,
        int $timeoutSeconds = 30,
        int $retries = 2,
        int $retryDelayMs = 500,
    ): Response {
        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (! is_string($body)) {
            throw new RuntimeException('No se pudo serializar el payload de provisión.');
        }

        $timestamp = (string) now()->timestamp;
        $signature = hash_hmac('sha256', $timestamp.'.'.$body, $secret);

        return Http::timeout($timeoutSeconds)
            ->retry($retries, $retryDelayMs)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'X-Orvae-Timestamp' => $timestamp,
                'X-Orvae-Signature' => $signature,
                'X-Idempotency-Key' => $idempotencyKey,
            ])
            ->withBody($body, 'application/json')
            ->post($url);
    }
}
