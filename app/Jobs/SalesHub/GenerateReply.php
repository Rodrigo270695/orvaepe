<?php

declare(strict_types=1);

namespace App\Jobs\SalesHub;

use App\Models\SalesHubConversation;
use App\Services\SalesHub\ReplyDebouncer;
use App\Services\SalesHub\ReplyGenerator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

/**
 * Responde con IA cuando el cliente dejó de escribir (solo la última generación del debounce).
 */
class GenerateReply implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 120;

    public function __construct(
        public readonly string $conversationId,
        public readonly int $generation,
        public readonly bool $preferVoice = false,
    ) {}

    public function handle(ReplyDebouncer $debouncer, ReplyGenerator $generator): void
    {
        if (! $debouncer->isCurrent($this->conversationId, $this->generation)) {
            return;
        }

        $conversation = SalesHubConversation::query()->with('line')->find($this->conversationId);
        if ($conversation === null) {
            return;
        }

        Cache::lock('saleshub:reply:'.$this->conversationId, 90)->block(60, function () use ($generator, $conversation): void {
            $generator->reply($conversation, $this->preferVoice);
        });
    }
}
