<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use Illuminate\Support\Facades\Cache;

/**
 * Cada mensaje entrante sube la generación; solo responde el job de la última,
 * así varias líneas seguidas del cliente reciben una sola respuesta.
 */
final class ReplyDebouncer
{
    private const TTL_SECONDS = 3600;

    public function bump(string $conversationId): int
    {
        $key = $this->key($conversationId);
        Cache::add($key, 0, self::TTL_SECONDS);

        return (int) Cache::increment($key);
    }

    public function isCurrent(string $conversationId, int $generation): bool
    {
        return (int) Cache::get($this->key($conversationId), 0) === $generation;
    }

    private function key(string $conversationId): string
    {
        return 'saleshub:gen:'.$conversationId;
    }
}
