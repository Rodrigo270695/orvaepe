<?php

namespace App\Services\WhatsApp;

use Illuminate\Support\Facades\Http;

class UltraMsgClient
{
    /**
     * UltraMsg documenta: POST https://api.ultramsg.com/{instance_id}/messages/chat
     * Si en .env se pone la URL completa con instancia (p. ej. .../instance123/), no debe
     * duplicarse con ULTRAMSG_INSTANCE_ID o la API responde "Path not found".
     *
     * @see https://docs.ultramsg.com/api/post/messages/chat
     */
    public function sendText(string $to, string $message): void
    {
        $baseUrl = $this->normalizedApiOrigin();
        $instanceId = trim((string) config('ultramsg.instance_id'));
        $token = trim((string) config('ultramsg.token'));

        if ($instanceId === '' || $token === '' || $to === '') {
            throw new \RuntimeException('Config UltraMsg incompleta o número vacío.');
        }

        $url = "{$baseUrl}/{$instanceId}/messages/chat";

        $response = Http::asForm()->post($url, [
            'token' => $token,
            'to' => $to,
            'body' => $message,
        ]);

        if (! $response->successful()) {
            $body = $response->body();
            $snippet = strlen($body) > 200 ? substr($body, 0, 200).'…' : $body;

            throw new \RuntimeException(
                'UltraMsg HTTP '.$response->status().': '.$snippet,
            );
        }

        $data = $response->json();
        if (! is_array($data) || ! empty($data['error'])) {
            $error = is_array($data) && isset($data['error'])
                ? (string) $data['error']
                : 'Respuesta inesperada de UltraMsg.';

            throw new \RuntimeException($error);
        }
    }

    private function normalizedApiOrigin(): string
    {
        $raw = trim((string) config('ultramsg.base_url', 'https://api.ultramsg.com'));
        if ($raw === '') {
            return 'https://api.ultramsg.com';
        }

        $parsed = parse_url($raw);
        if (! is_array($parsed) || empty($parsed['scheme']) || empty($parsed['host'])) {
            return 'https://api.ultramsg.com';
        }

        return $parsed['scheme'].'://'.$parsed['host'];
    }
}
