<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Jobs\WhatsAppCloud\ForwardEventToProduct;
use App\Models\WaChannel;
use App\Models\WaMessage;
use Illuminate\Support\Facades\Log;

/**
 * Envía un mensaje encolado por el proveedor del canal y avisa al producto el resultado.
 * Errores temporales se relanzan para que la cola reintente; los definitivos se guardan y se informan.
 */
final class OutboundDeliverer
{
    public function __construct(
        private readonly CloudApiClient $cloud,
        private readonly OpenWaTextSender $openWa,
    ) {}

    /**
     * @param  list<string>  $variables
     */
    public function deliver(string $waMessageId, array $variables): void
    {
        $message = WaMessage::query()->with('channel')->find($waMessageId);

        if (! $message instanceof WaMessage || $message->estado !== WaMessage::ESTADO_QUEUED) {
            return;
        }

        $channel = $message->channel;
        if (! $channel instanceof WaChannel || $channel->estado !== WaChannel::ESTADO_ACTIVO) {
            $this->markFailed($message, 'channel_inactive', 'El canal WhatsApp del tenant no está activo.');

            return;
        }

        try {
            $providerMsgId = match ($channel->provider) {
                WaChannel::PROVIDER_CLOUD => $this->cloud->sendTemplate(
                    $channel,
                    $message->telefono,
                    (string) $message->plantilla,
                    $variables,
                    (string) config('whatsapp_cloud.template_language', 'es_PE'),
                ),
                WaChannel::PROVIDER_OPENWA => $this->openWa->send($channel, $message->telefono, (string) $message->texto),
                default => throw new WhatsAppCloudException('Proveedor no soportado: '.$channel->provider, 'provider_not_supported'),
            };
        } catch (WhatsAppCloudException $e) {
            if (! $e->temporary) {
                $this->markFailed($message, $e->errorCode, $e->getMessage());

                return;
            }

            $message->forceFill([
                'error_code' => mb_substr($e->errorCode, 0, 32),
                'error_msg' => mb_substr($e->getMessage(), 0, 500),
            ])->save();

            Log::warning('whatsapp_cloud.send_temporary_error', [
                'wa_message_id' => $message->id,
                'producto' => $message->producto,
                'tenant_id' => $message->tenant_id,
                'error_code' => $e->errorCode,
            ]);

            throw $e;
        }

        $message->forceFill([
            'provider_msg_id' => $providerMsgId,
            'estado' => WaMessage::ESTADO_SENT,
            'sent_at' => now(),
            'error_code' => null,
            'error_msg' => null,
        ])->save();

        $this->forward($message, 'message.sent');
    }

    public function markFailed(WaMessage $message, string $errorCode, string $errorMsg): void
    {
        $message->forceFill([
            'estado' => WaMessage::ESTADO_FAILED,
            'error_code' => mb_substr($errorCode, 0, 32),
            'error_msg' => mb_substr($errorMsg, 0, 500),
            'failed_at' => now(),
        ])->save();

        Log::warning('whatsapp_cloud.send_failed', [
            'wa_message_id' => $message->id,
            'producto' => $message->producto,
            'tenant_id' => $message->tenant_id,
            'error_code' => $message->error_code,
        ]);

        $this->forward($message, 'message.status');
    }

    private function forward(WaMessage $message, string $evento): void
    {
        ForwardEventToProduct::dispatch($message->producto, [
            'evento' => $evento,
            'producto' => $message->producto,
            'tenant_id' => $message->tenant_id,
            'wa_message_id' => $message->id,
            'provider_msg_id' => $message->provider_msg_id,
            'reminder_id' => $message->reminder_id,
            'telefono' => $message->telefono,
            'estado' => $message->estado,
            'ocurrido_at' => now()->toIso8601String(),
            'error' => $message->estado === WaMessage::ESTADO_FAILED
                ? ['code' => $message->error_code, 'message' => $message->error_msg]
                : null,
        ]);
    }
}
