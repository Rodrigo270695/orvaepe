<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Services\OpenWaLines\OpenWaLineManager;
use App\Services\OpenWaLines\OpenWaLinesClient;
use App\Support\WhatsApp\WhatsAppChatId;
use App\Support\WhatsAppPhoneNormalizer;
use RuntimeException;

/**
 * Notificaciones de ORVAE: salen por la línea OpenWA marcada para notificaciones (Panel → Ops → OpenWA);
 * UltraMsg solo si ORVAE_OPENWA_ENABLED=false.
 */
final class OrvaeWhatsAppSender
{
    public function __construct(
        private readonly OpenWaLinesClient $openWa,
        private readonly OpenWaLineManager $lines,
        private readonly UltraMsgClient $ultraMsg,
    ) {}

    public function usesOpenWa(): bool
    {
        return (bool) config('openwa_lines.enabled');
    }

    /**
     * @return array{provider: string, detail: string}
     */
    public function status(): array
    {
        if (! $this->usesOpenWa()) {
            return [
                'provider' => 'ultramsg',
                'detail' => 'ORVAE_OPENWA_ENABLED=false — usando UltraMsg (legacy).',
            ];
        }

        if (! $this->openWa->isConfigured()) {
            return [
                'provider' => 'none',
                'detail' => 'ORVAE_OPENWA_ENABLED=true pero falta ORVAE_OPENWA_API_KEY en .env.',
            ];
        }

        $line = $this->lines->notificationLine();
        if ($line === null) {
            return [
                'provider' => 'openwa_pending',
                'detail' => 'No hay líneas OpenWA. Crea una en Panel → Ops → OpenWA y vincúlala con el QR.',
            ];
        }

        return [
            'provider' => $line->isReady() ? 'openwa' : 'openwa_pending',
            'detail' => 'Línea «'.$line->nombre.'» ('.$line->session_name.'): '.$line->status.'.',
        ];
    }

    public function sendText(string $phone, string $message): void
    {
        if (! $this->usesOpenWa()) {
            $to = WhatsAppPhoneNormalizer::toUltraMsgTo($phone);
            if ($to === null || $to === '') {
                throw new RuntimeException('Número de WhatsApp inválido.');
            }

            $this->ultraMsg->sendText($to, $message);

            return;
        }

        if (! $this->openWa->isConfigured()) {
            throw new RuntimeException('ORVAE_OPENWA_ENABLED=true pero ORVAE_OPENWA_API_KEY no está definida en .env del servidor.');
        }

        $line = $this->lines->notificationLine();
        if ($line === null) {
            throw new RuntimeException('No hay líneas OpenWA para notificaciones. Crea una en Panel → Ops → OpenWA y vincúlala con el QR.');
        }

        $chatId = WhatsAppChatId::fromPhone($phone);
        if ($chatId === null) {
            throw new RuntimeException('Número de WhatsApp inválido para OpenWA.');
        }

        $this->lines->sendText($line, $chatId, $message);
    }
}
