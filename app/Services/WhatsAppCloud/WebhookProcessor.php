<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Jobs\WhatsAppCloud\ForwardEventToProduct;
use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Models\WebhookEvent;
use Carbon\CarbonInterface;
use Closure;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Procesa el payload de la Cloud API: estados de mensajes enviados y mensajes entrantes.
 * Cada evento se registra en webhook_events (gateway whatsapp_cloud) por "wamid:estado",
 * así los reenvíos de Meta se ignoran.
 */
final class WebhookProcessor
{
    public const GATEWAY = 'whatsapp_cloud';

    /** Ventana para asociar una respuesta sin "context" al último recordatorio enviado a ese teléfono. */
    private const REMINDER_LOOKBACK_DAYS = 7;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function process(array $payload): void
    {
        foreach ((array) data_get($payload, 'entry', []) as $entry) {
            foreach ((array) data_get($entry, 'changes', []) as $change) {
                if (data_get($change, 'field') !== 'messages') {
                    continue;
                }

                $value = (array) data_get($change, 'value', []);
                $phoneNumberId = (string) data_get($value, 'metadata.phone_number_id', '');

                $channel = $phoneNumberId !== ''
                    ? WaChannel::query()->where('phone_number_id', $phoneNumberId)->first()
                    : null;

                if (! $channel instanceof WaChannel) {
                    Log::warning('whatsapp_cloud.webhook_unknown_channel', ['phone_number_id' => $phoneNumberId]);

                    continue;
                }

                foreach ((array) ($value['statuses'] ?? []) as $status) {
                    if (is_array($status)) {
                        $this->handleStatus($channel, $status);
                    }
                }

                foreach ((array) ($value['messages'] ?? []) as $message) {
                    if (is_array($message)) {
                        $this->handleInbound($channel, $message);
                    }
                }
            }
        }
    }

    /**
     * @param  array<string, mixed>  $status
     */
    private function handleStatus(WaChannel $channel, array $status): void
    {
        $wamid = (string) ($status['id'] ?? '');
        $estado = strtolower((string) ($status['status'] ?? ''));

        if ($wamid === '' || ! in_array($estado, WaMessage::PROVIDER_STATUSES, true)) {
            return;
        }

        $this->once("{$wamid}:{$estado}", 'status.'.$estado, $status, function () use ($channel, $status, $wamid, $estado): ?array {
            $message = WaMessage::query()
                ->where('provider_msg_id', $wamid)
                ->where('producto', $channel->producto)
                ->where('tenant_id', $channel->tenant_id)
                ->lockForUpdate()
                ->first();

            if (! $message instanceof WaMessage) {
                Log::info('whatsapp_cloud.webhook_status_unknown_message', [
                    'provider_msg_id' => $wamid,
                    'estado' => $estado,
                ]);

                return null;
            }

            $error = (array) data_get($status, 'errors.0', []);
            $errorCode = isset($error['code']) ? (string) $error['code'] : null;
            $errorMsg = (string) (data_get($error, 'error_data.details') ?: ($error['message'] ?? $error['title'] ?? ''));
            $at = $this->timestamp($status['timestamp'] ?? null);

            $message->applyProviderStatus($estado, $at, $errorCode, $errorMsg !== '' ? $errorMsg : null);

            return [
                'evento' => 'message.status',
                'producto' => $channel->producto,
                'tenant_id' => $channel->tenant_id,
                'wa_message_id' => $message->id,
                'provider_msg_id' => $wamid,
                'reminder_id' => $message->reminder_id,
                'telefono' => $message->telefono,
                'estado' => $estado,
                'ocurrido_at' => $at->toIso8601String(),
                'error' => $estado === WaMessage::ESTADO_FAILED
                    ? ['code' => $message->error_code, 'message' => $message->error_msg]
                    : null,
            ];
        });
    }

    /**
     * @param  array<string, mixed>  $message
     */
    private function handleInbound(WaChannel $channel, array $message): void
    {
        $wamid = (string) ($message['id'] ?? '');
        if ($wamid === '') {
            return;
        }

        $type = (string) ($message['type'] ?? 'unknown');

        $this->once("{$wamid}:in", 'message.'.$type, ['id' => $wamid, 'type' => $type], function () use ($channel, $message, $wamid): ?array {
            $telefono = Phone::normalize((string) ($message['from'] ?? '')) ?? (string) ($message['from'] ?? '');
            $texto = $this->extractText($message);
            $accion = ReminderReply::fromText($texto);
            $at = $this->timestamp($message['timestamp'] ?? null);

            $reminderId = $this->resolveReminderId(
                $channel,
                $telefono,
                (string) data_get($message, 'context.id', ''),
            );

            $inbound = WaMessage::query()->create([
                'wa_channel_id' => $channel->id,
                'producto' => $channel->producto,
                'tenant_id' => $channel->tenant_id,
                'reminder_id' => $reminderId,
                'provider_msg_id' => $wamid,
                'telefono' => $telefono,
                'direccion' => WaMessage::DIRECCION_IN,
                'categoria' => $accion !== null ? 'respuesta_recordatorio' : 'entrante',
                'estado' => WaMessage::ESTADO_RECEIVED,
                'texto' => $texto,
            ]);

            return [
                'evento' => 'message.received',
                'producto' => $channel->producto,
                'tenant_id' => $channel->tenant_id,
                'wa_message_id' => $inbound->id,
                'provider_msg_id' => $wamid,
                'reminder_id' => $reminderId,
                'telefono' => $telefono,
                'estado' => WaMessage::ESTADO_RECEIVED,
                'texto' => $texto,
                'accion' => $accion,
                'ocurrido_at' => $at->toIso8601String(),
            ];
        });
    }

    /**
     * Ejecuta $handler una sola vez por clave. Si un intento anterior falló a medias, se reintenta.
     *
     * @param  array<string, mixed>  $item
     * @param  Closure(): (array<string, mixed>|null)  $handler
     */
    private function once(string $key, string $eventType, array $item, Closure $handler): void
    {
        $event = WebhookEvent::query()->createOrFirst(
            ['gateway' => self::GATEWAY, 'gateway_event_id' => $key],
            ['event_type' => $eventType, 'payload' => $item, 'processed' => false, 'attempts' => 0],
        );

        if ($event->processed) {
            return;
        }

        try {
            $forward = DB::transaction($handler);
            $event->markProcessed();
        } catch (Throwable $e) {
            $event->markFailed(mb_substr($e->getMessage(), 0, 500));

            throw $e;
        }

        if (is_array($forward)) {
            ForwardEventToProduct::dispatch($forward['producto'], $forward);
        }
    }

    private function resolveReminderId(WaChannel $channel, string $telefono, string $contextId): ?string
    {
        $outbound = WaMessage::query()
            ->where('producto', $channel->producto)
            ->where('tenant_id', $channel->tenant_id)
            ->where('direccion', WaMessage::DIRECCION_OUT)
            ->whereNotNull('reminder_id');

        if ($contextId !== '') {
            $replied = (clone $outbound)->where('provider_msg_id', $contextId)->value('reminder_id');
            if ($replied !== null) {
                return (string) $replied;
            }
        }

        $latest = $outbound
            ->where('telefono', $telefono)
            ->where('created_at', '>=', now()->subDays(self::REMINDER_LOOKBACK_DAYS))
            ->latest()
            ->value('reminder_id');

        return $latest !== null ? (string) $latest : null;
    }

    /**
     * @param  array<string, mixed>  $message
     */
    private function extractText(array $message): ?string
    {
        $text = data_get($message, 'text.body')
            ?? data_get($message, 'button.text')
            ?? data_get($message, 'interactive.button_reply.title')
            ?? data_get($message, 'interactive.list_reply.title');

        return is_string($text) && $text !== '' ? $text : null;
    }

    private function timestamp(mixed $value): CarbonInterface
    {
        return is_numeric($value) ? Date::createFromTimestamp((int) $value) : now();
    }
}
