<?php

declare(strict_types=1);

namespace App\Services\OpenWaLines;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Cliente del OpenWA propio de ORVAE (API v0.24: https://docs.open-wa.org/).
 */
final class OpenWaLinesClient
{
    public function isConfigured(): bool
    {
        return (bool) config('openwa_lines.enabled')
            && trim((string) config('openwa_lines.api_key', '')) !== '';
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findSessionByName(string $name): ?array
    {
        $response = $this->request('get', '/api/sessions', query: ['name' => $name]);

        $first = is_array($response) ? ($response[0] ?? null) : null;

        return is_array($first) ? $first : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function getSession(string $sessionId): ?array
    {
        try {
            $response = $this->request('get', '/api/sessions/'.$sessionId);
        } catch (OpenWaLinesException $e) {
            if ($e->isNotFound()) {
                return null;
            }

            throw $e;
        }

        return is_array($response) ? $response : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function createSession(string $name): array
    {
        return $this->expectArray($this->request('post', '/api/sessions', ['name' => $name]));
    }

    /**
     * @return array<string, mixed>
     */
    public function startSession(string $sessionId): array
    {
        return $this->expectArray($this->request('post', '/api/sessions/'.$sessionId.'/start'));
    }

    /**
     * @return array{qrCode?: string|null, status?: string}
     */
    public function getQrCode(string $sessionId): array
    {
        return $this->expectArray($this->request('get', '/api/sessions/'.$sessionId.'/qr'));
    }

    /**
     * Desvincula el dispositivo en WhatsApp (requiere sesión en marcha) y borra credenciales.
     *
     * @return array<string, mixed>
     */
    public function logoutSession(string $sessionId): array
    {
        return $this->expectArray($this->request('post', '/api/sessions/'.$sessionId.'/logout'));
    }

    /**
     * @return array<string, mixed>
     */
    public function stopSession(string $sessionId): array
    {
        return $this->expectArray($this->request('post', '/api/sessions/'.$sessionId.'/stop'));
    }

    public function deleteSession(string $sessionId): void
    {
        try {
            $this->request('delete', '/api/sessions/'.$sessionId);
        } catch (OpenWaLinesException $e) {
            if (! $e->isNotFound()) {
                throw $e;
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function sendText(string $sessionId, string $chatId, string $text): array
    {
        return $this->expectArray($this->request('post', '/api/sessions/'.$sessionId.'/messages/send-text', [
            'chatId' => $chatId,
            'text' => $text,
        ]));
    }

    /**
     * OpenWA descarga el audio desde la URL pública y lo envía como nota de voz.
     *
     * @return array<string, mixed>
     */
    public function sendAudioUrl(string $sessionId, string $chatId, string $url): array
    {
        return $this->expectArray($this->request('post', '/api/sessions/'.$sessionId.'/messages/send-audio', [
            'chatId' => $chatId,
            'url' => $url,
        ]));
    }

    /**
     * @return array<string, mixed>|null
     */
    public function getContact(string $sessionId, string $contactId): ?array
    {
        try {
            $response = $this->request('get', '/api/sessions/'.$sessionId.'/contacts/'.rawurlencode($contactId));
        } catch (OpenWaLinesException $e) {
            if ($e->isNotFound()) {
                return null;
            }

            throw $e;
        }

        return is_array($response) ? $response : null;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function listWebhooks(string $sessionId): array
    {
        $response = $this->request('get', '/api/sessions/'.$sessionId.'/webhooks');

        if (is_array($response) && is_array($response['data'] ?? null)) {
            $response = $response['data'];
        }

        return is_array($response) ? array_values(array_filter($response, 'is_array')) : [];
    }

    /**
     * @param  list<string>  $events
     * @return array<string, mixed>
     */
    public function registerWebhook(string $sessionId, string $url, string $secret, array $events): array
    {
        return $this->expectArray($this->request('post', '/api/sessions/'.$sessionId.'/webhooks', [
            'url' => $url,
            'events' => $events,
            'secret' => $secret,
        ]));
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function updateWebhook(string $sessionId, string $webhookId, array $payload): array
    {
        $path = '/api/sessions/'.$sessionId.'/webhooks/'.$webhookId;

        try {
            return $this->expectArray($this->request('put', $path, $payload));
        } catch (OpenWaLinesException $e) {
            if ($e->status !== 405) {
                throw $e;
            }

            return $this->expectArray($this->request('patch', $path, $payload));
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function expectArray(mixed $response): array
    {
        if (! is_array($response)) {
            throw new OpenWaLinesException('OpenWA devolvió una respuesta inesperada.');
        }

        return $response;
    }

    /**
     * @param  array<string, mixed>|null  $body
     * @param  array<string, mixed>  $query
     */
    private function request(string $method, string $path, ?array $body = null, array $query = []): mixed
    {
        $apiKey = trim((string) config('openwa_lines.api_key', ''));
        if ($apiKey === '') {
            throw new OpenWaLinesException('ORVAE_OPENWA_API_KEY no está configurada.');
        }

        $url = rtrim((string) config('openwa_lines.api_url'), '/').$path;

        $pending = Http::timeout((int) config('openwa_lines.timeout_seconds', 30))
            ->acceptJson()
            ->withHeaders(['X-API-Key' => $apiKey]);

        try {
            $response = match ($method) {
                'get' => $pending->get($url, $query),
                'post' => $pending->post($url, $body ?? (object) []),
                'put' => $pending->put($url, $body ?? (object) []),
                'patch' => $pending->patch($url, $body ?? (object) []),
                'delete' => $pending->delete($url),
                default => throw new OpenWaLinesException('Método HTTP no soportado: '.$method),
            };
        } catch (ConnectionException $e) {
            throw new OpenWaLinesException('No se pudo conectar con OpenWA.', 0, $e);
        }

        if ($response->status() === 401) {
            throw new OpenWaLinesException('OpenWA rechazó la API key. Revisa ORVAE_OPENWA_API_KEY.', 401);
        }

        if (! $response->successful()) {
            $message = $response->json('message');
            $message = is_array($message) ? implode(' ', $message) : (string) ($message ?? '');

            throw new OpenWaLinesException(
                'OpenWA HTTP '.$response->status().($message !== '' ? ': '.$message : ''),
                $response->status(),
            );
        }

        return $response->json();
    }
}
