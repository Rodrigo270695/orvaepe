<?php

declare(strict_types=1);

namespace App\Services\OpenWaLines;

use RuntimeException;

final class OpenWaLinesException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 0, ?\Throwable $previous = null)
    {
        parent::__construct($message, $status, $previous);
    }

    public function isNotFound(): bool
    {
        return $this->status === 404;
    }

    /**
     * OpenWA responde 400 cuando la sesión ya está iniciada, el QR aún no está o ya está autenticada.
     */
    public function isBadRequest(): bool
    {
        return $this->status === 400;
    }
}
