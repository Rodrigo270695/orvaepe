<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

use RuntimeException;

final class WhatsAppCloudException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $errorCode = 'error',
        public readonly int $httpStatus = 502,
    ) {
        parent::__construct($message);
    }
}
