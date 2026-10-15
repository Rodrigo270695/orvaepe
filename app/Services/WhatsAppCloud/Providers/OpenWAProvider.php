<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud\Providers;

use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Services\WhatsAppCloud\OpenWaTextSender;
use App\Services\WhatsAppCloud\WhatsAppCloudException;

/**
 * Canales en el OpenWA compartido con VetSaaS: no existen plantillas, se envía el texto
 * armado con el cuerpo de la plantilla.
 */
final class OpenWAProvider implements WhatsAppProvider
{
    public function __construct(
        private readonly OpenWaTextSender $sender,
    ) {}

    public function sendTemplate(WaChannel $channel, WaMessage $message, array $variables): ?string
    {
        $texto = (string) $message->texto;
        if ($texto === '') {
            throw new WhatsAppCloudException('La plantilla no tiene cuerpo para enviarla por OpenWA.', 'template_text_missing', 422);
        }

        return $this->sender->send($channel, $message->telefono, $texto);
    }

    /**
     * El OpenWA de VetSaaS entrega sus webhooks a VetSaaS, no a ORVAE: aquí no llegan
     * estados ni respuestas de canales OpenWA.
     */
    public function parseWebhook(array $payload): array
    {
        return [];
    }
}
