<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Models\WaChannel;
use App\Services\OpenWa\OpenWaClient;
use App\Support\WhatsApp\WhatsAppChatId;
use RuntimeException;

/**
 * Canales provider=openwa: envía el texto armado con el cliente OpenWA existente (sin modificarlo).
 */
final class OpenWaTextSender
{
    public function __construct(
        private readonly OpenWaClient $client,
    ) {}

    /**
     * @return string|null id del mensaje en OpenWA, si lo devuelve
     */
    public function send(WaChannel $channel, string $telefono, string $texto): ?string
    {
        $sessionId = trim((string) $channel->openwa_session_id);
        if ($sessionId === '') {
            throw new WhatsAppCloudException('Canal OpenWA sin openwa_session_id.', 'channel_config', 422);
        }

        $chatId = WhatsAppChatId::fromPhone($telefono);
        if ($chatId === null) {
            throw new WhatsAppCloudException('Teléfono inválido para OpenWA.', 'invalid_phone', 422);
        }

        try {
            $response = $this->client->sendText($sessionId, $chatId, $texto);
        } catch (RuntimeException $e) {
            $message = $e->getMessage();
            $temporary = str_starts_with($message, 'Error de red')
                || preg_match('/OpenWA HTTP (5\d\d|429)/', $message) === 1;

            throw new WhatsAppCloudException(mb_substr($message, 0, 500), 'openwa', 502, $temporary);
        }

        $id = data_get($response, 'messageId')
            ?? data_get($response, 'id')
            ?? data_get($response, 'key.id')
            ?? data_get($response, 'data.id');

        return is_scalar($id) && (string) $id !== '' ? (string) $id : null;
    }
}
