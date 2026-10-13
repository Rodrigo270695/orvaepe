<?php

declare(strict_types=1);

namespace App\Jobs\WhatsAppCloud;

use App\Jobs\WhatsAppCloud\Middleware\ThrottlePerChannel;
use App\Models\WaMessage;
use App\Services\WhatsAppCloud\OutboundDeliverer;
use DateTimeInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

/**
 * Envía un mensaje WhatsApp ya registrado en wa_messages.
 * Solo los errores temporales lanzan excepción: 1 intento + 3 reintentos con backoff.
 * Los reencolados por límite de velocidad no cuentan (por eso retryUntil en vez de tries).
 */
class SendOutboundMessage implements ShouldQueue
{
    use Queueable;

    public int $maxExceptions = 4;

    /**
     * @param  list<string>  $variables
     */
    public function __construct(
        public readonly string $waMessageId,
        public readonly string $channelId,
        public readonly array $variables,
    ) {}

    public function retryUntil(): DateTimeInterface
    {
        return now()->addHours(2);
    }

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [30, 120, 600];
    }

    /**
     * @return list<object>
     */
    public function middleware(): array
    {
        return [new ThrottlePerChannel($this->channelId)];
    }

    public function handle(OutboundDeliverer $deliverer): void
    {
        $deliverer->deliver($this->waMessageId, $this->variables);
    }

    public function failed(?Throwable $e): void
    {
        $message = WaMessage::query()->find($this->waMessageId);

        if ($message instanceof WaMessage && $message->estado === WaMessage::ESTADO_QUEUED) {
            app(OutboundDeliverer::class)->markFailed(
                $message,
                (string) ($message->error_code ?: 'retries_exhausted'),
                (string) ($message->error_msg ?: 'Se agotaron los reintentos de envío.'),
            );
        }
    }
}
