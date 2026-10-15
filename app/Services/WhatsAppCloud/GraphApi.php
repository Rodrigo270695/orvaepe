<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

/**
 * Llamadas genéricas a la Graph API de Meta (gestión de WABA, números y plantillas).
 * Los errores nunca incluyen la URL: puede llevar client_secret o el code de Embedded Signup.
 */
final class GraphApi
{
    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function get(string $path, ?string $token, array $query = []): array
    {
        return $this->send('get', $path, $token, $query);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function post(string $path, string $token, array $data = []): array
    {
        return $this->send('post', $path, $token, $data);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function send(string $method, string $path, ?string $token, array $data): array
    {
        $url = config('whatsapp_cloud.graph_url').'/'.config('whatsapp_cloud.graph_version').'/'.ltrim($path, '/');

        $request = Http::timeout((int) config('whatsapp_cloud.send_timeout_seconds', 15))->acceptJson();
        if ($token !== null) {
            $request = $request->withToken($token);
        }

        try {
            /** @var Response $response */
            $response = $method === 'get' ? $request->get($url, $data) : $request->post($url, $data);
        } catch (ConnectionException) {
            throw new WhatsAppCloudException('No se pudo conectar con la Graph API de Meta.', 'network', 502, true);
        }

        if (! $response->successful()) {
            $code = (int) $response->json('error.code', 0);
            $message = (string) ($response->json('error.error_user_msg')
                ?: $response->json('error.error_data.details')
                ?: $response->json('error.message', 'Graph API HTTP '.$response->status()));

            throw new WhatsAppCloudException(
                $message,
                $code !== 0 ? (string) $code : (string) $response->status(),
                502,
                $response->serverError() || $response->status() === 429,
            );
        }

        return (array) $response->json();
    }
}
