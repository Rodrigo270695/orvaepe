<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use App\Jobs\WhatsAppCloud\ForwardEventToProduct;
use App\Models\WaChannel;
use App\Models\WaMessage;
use App\Models\WaTemplate;
use App\Models\WebhookEvent;
use App\Services\WhatsAppCloud\Providers\ProviderEvent;
use App\Services\WhatsAppCloud\Providers\WhatsAppProviders;
use Carbon\CarbonInterface;
use Closure;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Procesa el webhook de la Cloud API: estados de mensajes, mensajes entrantes y estado de plantillas.
 * Cada evento se registra en webhook_events (gateway whatsapp_cloud) por "id:estado",
 * así los reenvíos de Meta se ignoran.
 */
final class WebhookProcessor
{
    public const GATEWAY = 'whatsapp_cloud';

    /** Ventana para asociar una respuesta sin "context" al último recordatorio enviado a ese teléfono. */
    private const REMINDER_LOOKBACK_DAYS = 7;

    /** @var array<string, WaChannel|null> */
    private array $channels = [];

    public function __construct(
        private readonly WhatsAppProviders $providers,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public function process(array $payload): void
    {
        $this->channels = [];

        foreach ($this->providers->cloud()->parseWebhook($payload) as $event) {
            if ($event->type === ProviderEvent::TEMPLATE_STATUS) {
                $this->handleTemplateStatus($event);

                continue;
            }

            $channel = $this->channel((string) $event->phoneNumberId);
            if (! $channel instanceof WaChannel) {
                continue;
            }

            match ($event->type) {
                ProviderEvent::STATUS => $this->handleStatus($channel, $event),
                ProviderEvent::MESSAGE => $this->handleInbound($channel, $event),
                default => null,
            };
        }
    }

    private function channel(string $phoneNumberId): ?WaChannel
    {
        if (! array_key_exists($phoneNumberId, $this->channels)) {
            $this->channels[$phoneNumberId] = WaChannel::query()->where('phone_number_id', $phoneNumberId)->first();

            if ($this->channels[$phoneNumberId] === null) {
                Log::warning('whatsapp_cloud.webhook_unknown_channel', ['phone_number_id' => $phoneNumberId]);
            }
        }

        return $this->channels[$phoneNumberId];
    }

    private function handleStatus(WaChannel $channel, ProviderEvent $event): void
    {
        $wamid = $event->id;
        $estado = (string) $event->status;

        if (! in_array($estado, WaMessage::PROVIDER_STATUSES, true)) {
            return;
        }

        $this->once("{$wamid}:{$estado}", 'status.'.$estado, ['id' => $wamid, 'status' => $estado], function () use ($channel, $event, $wamid, $estado): ?array {
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

            $at = $this->timestamp($event->timestamp);

            $message->applyProviderStatus($estado, $at, $event->errorCode, $event->errorMsg);

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

    private function handleInbound(WaChannel $channel, ProviderEvent $event): void
    {
        $wamid = $event->id;
        $type = (string) $event->messageType;

        $this->once("{$wamid}:in", 'message.'.$type, ['id' => $wamid, 'type' => $type], function () use ($channel, $event, $wamid): ?array {
            $telefono = Phone::normalize((string) $event->from) ?? (string) $event->from;
            $texto = $event->text;
            $accion = ReminderReply::fromText($texto);
            $at = $this->timestamp($event->timestamp);

            $reminderId = $this->resolveReminderId($channel, $telefono, (string) $event->contextId);

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

    private function handleTemplateStatus(ProviderEvent $event): void
    {
        $metaStatus = (string) $event->status;
        $estado = WaTemplate::estadoFromMeta($metaStatus);

        if ($estado === null) {
            return;
        }

        $this->once("tpl:{$event->id}:{$metaStatus}", 'template.'.strtolower($metaStatus), ['id' => $event->id, 'event' => $metaStatus], function () use ($event, $estado): ?array {
            $templates = $this->templatesFor($event);

            if ($templates->isEmpty()) {
                Log::info('whatsapp_cloud.webhook_template_unknown', [
                    'meta_template_id' => $event->id,
                    'waba_id' => $event->wabaId,
                ]);

                return null;
            }

            foreach ($templates as $template) {
                $template->forceFill([
                    'meta_template_id' => $event->id,
                    'waba_id' => $template->waba_id ?? $event->wabaId,
                    'estado' => $estado,
                    'motivo' => $event->errorMsg !== null ? mb_substr($event->errorMsg, 0, 1000) : null,
                ])->save();
            }

            return null;
        });
    }

    /**
     * Por id de Meta; si aún no lo tenemos, por WABA + nombre + idioma.
     *
     * @return Collection<int, WaTemplate>
     */
    private function templatesFor(ProviderEvent $event): Collection
    {
        $byId = WaTemplate::query()->where('meta_template_id', $event->id)->get();

        if ($byId->isNotEmpty() || $event->templateName === null) {
            return $byId;
        }

        return WaTemplate::query()
            ->where('waba_id', $event->wabaId)
            ->where('nombre', $event->templateName)
            ->when($event->templateLanguage, fn ($q, $idioma) => $q->where('idioma', $idioma))
            ->get();
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

    private function timestamp(?int $value): CarbonInterface
    {
        return $value !== null ? Date::createFromTimestamp($value) : now();
    }
}
