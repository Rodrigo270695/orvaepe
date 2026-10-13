<?php

declare(strict_types=1);

namespace App\Jobs\WhatsAppCloud;

use App\Services\WhatsAppCloud\WebhookProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Procesa en segundo plano un payload ya validado (firma OK) del webhook de Meta.
 * Reintentar es seguro: WebhookProcessor ignora los eventos ya procesados.
 */
class ProcessWebhookPayload implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public readonly array $payload,
    ) {}

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [10, 60, 300, 900];
    }

    public function handle(WebhookProcessor $processor): void
    {
        $processor->process($this->payload);
    }
}
