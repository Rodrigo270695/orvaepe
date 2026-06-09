<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Services\OpenWa\PlatformWhatsAppMessenger;
use App\Support\WhatsApp\WhatsAppChatId;
use App\Support\WhatsAppPhoneNormalizer;
use RuntimeException;

/**
 * Envío unificado: OpenWA (preferido) con fallback a UltraMsg durante migración.
 */
final class OrvaeWhatsAppSender
{
    public function __construct(
        private readonly PlatformWhatsAppMessenger $openWa,
        private readonly UltraMsgClient $ultraMsg,
    ) {}

    public function prefersOpenWa(): bool
    {
        return $this->openWa->isReady();
    }

    public function sendText(string $phone, string $message): void
    {
        if ($this->openWa->isReady()) {
            $chatId = WhatsAppChatId::fromPhone($phone);
            if ($chatId === null) {
                throw new RuntimeException('Número de WhatsApp inválido para OpenWA.');
            }

            $this->openWa->sendText($chatId, $message);

            return;
        }

        $to = WhatsAppPhoneNormalizer::toUltraMsgTo($phone);
        if ($to === null || $to === '') {
            throw new RuntimeException('Número de WhatsApp inválido.');
        }

        $this->ultraMsg->sendText($to, $message);
    }
}
