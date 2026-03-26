<?php

namespace App\Services\WhatsApp;

use Illuminate\Support\Facades\Http;

class UltraMsgClient
{
    public function sendText(string $to, string $message): void
    {
        $baseUrl = rtrim((string) config('ultramsg.base_url'), '/');
        $instanceId = (string) config('ultramsg.instance_id');
        $token = (string) config('ultramsg.token');

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
            throw new \RuntimeException('UltraMsg HTTP error: '.$response->status());
        }

        $data = $response->json();
        if (! is_array($data) || ! empty($data['error'])) {
            $error = is_array($data) && isset($data['error'])
                ? (string) $data['error']
                : 'Respuesta inesperada de UltraMsg.';

            throw new \RuntimeException($error);
        }
    }
}

