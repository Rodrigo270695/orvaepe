<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Jobs\WhatsAppCloud\SendOutboundMessage;
use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Models\WaOptin;
use App\Models\WaTemplate;

/**
 * Servicio interno de envío: valida opt-in, canal y plantilla, registra el mensaje y lo encola.
 * El envío real lo hace SendOutboundMessage (con límite de velocidad por canal).
 */
final class MessageSender
{
    public const CATEGORIA = 'utility';

    /**
     * @param  list<string>  $variables
     */
    public function queue(
        string $producto,
        string $tenantId,
        string $telefono,
        string $plantilla,
        array $variables,
        ?string $reminderId = null,
    ): WaMessage {
        $to = Phone::normalize($telefono);
        if ($to === null) {
            throw new WhatsAppCloudException('Teléfono inválido.', 'invalid_phone', 422);
        }

        $hasOptin = WaOptin::query()
            ->where('producto', $producto)
            ->where('tenant_id', $tenantId)
            ->where('telefono', $to)
            ->exists();

        if (! $hasOptin) {
            throw new WhatsAppCloudException('El teléfono no tiene consentimiento (opt-in) para este tenant.', 'no_optin', 422);
        }

        $channel = WaChannel::query()
            ->active()
            ->where('producto', $producto)
            ->where('tenant_id', $tenantId)
            ->first();

        if (! $channel instanceof WaChannel) {
            throw new WhatsAppCloudException('El tenant no tiene canal WhatsApp activo.', 'channel_not_found', 404);
        }

        $template = WaTemplate::usableBy($channel, $plantilla);
        if (! $template instanceof WaTemplate) {
            throw new WhatsAppCloudException('La plantilla no existe o no está aprobada para este tenant.', 'template_not_found', 422);
        }

        if (count($variables) !== $template->num_variables) {
            throw new WhatsAppCloudException(
                "La plantilla {$plantilla} requiere {$template->num_variables} variables.",
                'invalid_variables',
                422,
            );
        }

        $message = WaMessage::query()->create([
            'wa_channel_id' => $channel->id,
            'producto' => $producto,
            'tenant_id' => $tenantId,
            'reminder_id' => $reminderId,
            'telefono' => $to,
            'direccion' => WaMessage::DIRECCION_OUT,
            'categoria' => self::CATEGORIA,
            'plantilla' => $template->nombre,
            'idioma' => $template->idioma,
            'estado' => WaMessage::ESTADO_QUEUED,
            'texto' => $template->render($variables),
        ]);

        SendOutboundMessage::dispatch($message->id, $channel->id, $variables);

        return $message;
    }
}
