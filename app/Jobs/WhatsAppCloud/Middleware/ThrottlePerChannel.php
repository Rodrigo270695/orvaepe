<?php

declare(strict_types=1);

namespace App\Jobs\WhatsAppCloud\Middleware;

use Closure;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Máximo N envíos por segundo por canal; el exceso vuelve a la cola sin contar como error.
 */
final class ThrottlePerChannel
{
    public function __construct(
        private readonly string $channelId,
    ) {}

    public function handle(object $job, Closure $next): void
    {
        $key = 'whatsapp-cloud-send:'.$this->channelId;
        $perSecond = max(1, (int) config('whatsapp_cloud.send_per_second', 20));

        if (RateLimiter::tooManyAttempts($key, $perSecond)) {
            $job->release(max(1, RateLimiter::availableIn($key)));

            return;
        }

        RateLimiter::hit($key, 1);

        $next($job);
    }
}
