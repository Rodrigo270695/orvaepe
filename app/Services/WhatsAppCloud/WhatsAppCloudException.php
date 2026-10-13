<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use RuntimeException;

final class WhatsAppCloudException extends RuntimeException
{
    /**
     * @param  bool  $temporary  true si conviene reintentar (5xx, rate limit, red).
     */
    public function __construct(
        string $message,
        public readonly string $errorCode = 'error',
        public readonly int $httpStatus = 502,
        public readonly bool $temporary = false,
    ) {
        parent::__construct($message);
    }
}
