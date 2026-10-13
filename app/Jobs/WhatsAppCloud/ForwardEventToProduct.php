<?php

declare(strict_types=1);

namespace App\Jobs\WhatsAppCloud;

use App\Services\WhatsAppCloud\ProductEventForwarder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Reenvía un evento WhatsApp normalizado al producto (VetSaaS, TallerSaaS) con reintentos.
 */
class ForwardEventToProduct implements ShouldQueue
{
    use Queueable;

    public int $tries = 6;

    /**
     * @param  array<string, mixed>  $event
     */
    public function __construct(
        public readonly string $producto,
        public readonly array $event,
    ) {}

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [30, 120, 300, 900, 1800];
    }

    public function handle(ProductEventForwarder $forwarder): void
    {
        $forwarder->forward($this->producto, $this->event);
    }

    public function failed(Throwable $e): void
    {
        Log::error('whatsapp_cloud.forward_failed', [
            'producto' => $this->producto,
            'evento' => $this->event['evento'] ?? null,
            'provider_msg_id' => $this->event['provider_msg_id'] ?? null,
            'exception' => $e->getMessage(),
        ]);
    }
}
