<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Services\OpenWa\OpenWaClient;
use App\Services\OpenWa\PlatformWhatsAppMessenger;
use App\Support\WhatsApp\WhatsAppChatId;
use App\Support\WhatsAppPhoneNormalizer;
use RuntimeException;

/**
 * Envío unificado: OpenWA cuando está habilitado; UltraMsg solo si OPENWA_ENABLED=false.
 */
final class OrvaeWhatsAppSender
{
    public function __construct(
        private readonly OpenWaClient $openWaClient,
        private readonly PlatformWhatsAppMessenger $openWa,
        private readonly UltraMsgClient $ultraMsg,
    ) {}

    public function prefersOpenWa(): bool
    {
        return $this->openWaClient->isConfigured() && $this->openWa->isReady();
    }

    /**
     * @return array{provider: string, detail: string}
     */
    public function status(): array
    {
        if (! (bool) config('openwa.enabled')) {
            return [
                'provider' => 'ultramsg',
                'detail' => 'OPENWA_ENABLED=false — usando UltraMsg (legacy).',
            ];
        }

        if (! $this->openWaClient->isConfigured()) {
            return [
                'provider' => 'none',
                'detail' => 'OPENWA_ENABLED=true pero falta OPENWA_API_KEY en .env.',
            ];
        }

        if ($this->openWa->isReady()) {
            return [
                'provider' => 'openwa',
                'detail' => 'Sesión OpenWA conectada ('.config('openwa.platform_session_name').').',
            ];
        }

        return [
            'provider' => 'openwa_pending',
            'detail' => 'OpenWA configurado pero sin sesión activa. Panel → Ops → WhatsApp → vincular QR.',
        ];
    }

    public function sendText(string $phone, string $message): void
    {
        if ((bool) config('openwa.enabled')) {
            if (! $this->openWaClient->isConfigured()) {
                throw new RuntimeException(
                    'OpenWA habilitado pero OPENWA_API_KEY no está definida en .env del servidor.',
                );
            }

            if (! $this->openWa->isReady()) {
                throw new RuntimeException(
                    'OpenWA configurado pero la sesión no está conectada. '
                    .'Entra a Panel → Ops → WhatsApp, pulsa «Vincular WhatsApp» y escanea el QR.',
                );
            }

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
