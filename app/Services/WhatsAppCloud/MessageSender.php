<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Models\WaChannel;
use App\Models\WaMessage;
use Illuminate\Support\Facades\Log;

/**
 * Servicio interno de envío: resuelve el canal del tenant, envía y registra en wa_messages.
 */
final class MessageSender
{
    public function __construct(
        private readonly CloudApiClient $cloud,
    ) {}

    /**
     * @param  list<string>  $variables
     */
    public function send(
        string $producto,
        string $tenantId,
        string $telefono,
        string $plantilla,
        array $variables,
        ?string $reminderId = null,
        ?string $categoria = null,
        ?string $idioma = null,
    ): WaMessage {
        $channel = WaChannel::query()
            ->active()
            ->where('producto', $producto)
            ->where('tenant_id', $tenantId)
            ->first();

        if (! $channel instanceof WaChannel) {
            throw new WhatsAppCloudException('El tenant no tiene canal WhatsApp activo.', 'channel_not_found', 404);
        }

        if ($channel->provider !== WaChannel::PROVIDER_CLOUD) {
            throw new WhatsAppCloudException(
                'El canal de este tenant usa OpenWA; este servicio solo envía por Cloud API.',
                'provider_not_supported',
                422,
            );
        }

        $to = Phone::normalize($telefono);
        if ($to === null) {
            throw new WhatsAppCloudException('Teléfono inválido.', 'invalid_phone', 422);
        }

        $message = WaMessage::query()->create([
            'wa_channel_id' => $channel->id,
            'producto' => $producto,
            'tenant_id' => $tenantId,
            'reminder_id' => $reminderId,
            'telefono' => $to,
            'direccion' => WaMessage::DIRECCION_OUT,
            'categoria' => $categoria,
            'plantilla' => $plantilla,
            'estado' => WaMessage::ESTADO_QUEUED,
        ]);

        try {
            $wamid = $this->cloud->sendTemplate(
                $channel,
                $to,
                $plantilla,
                $variables,
                $idioma ?: (string) config('whatsapp_cloud.template_language', 'es'),
            );
        } catch (WhatsAppCloudException $e) {
            $message->forceFill([
                'estado' => WaMessage::ESTADO_FAILED,
                'error_code' => $e->errorCode,
                'error_msg' => mb_substr($e->getMessage(), 0, 500),
                'failed_at' => now(),
            ])->save();

            Log::warning('whatsapp_cloud.send_failed', [
                'wa_message_id' => $message->id,
                'producto' => $producto,
                'tenant_id' => $tenantId,
                'error_code' => $e->errorCode,
            ]);

            throw $e;
        }

        $message->forceFill([
            'provider_msg_id' => $wamid,
            'estado' => WaMessage::ESTADO_ACCEPTED,
        ])->save();

        return $message;
    }
}
