<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use Illuminate\Support\Facades\Cache;

/**
 * OpenWA reenvía como "fromMe" lo que ORVAE envía por la línea. Se recuerdan los envíos
 * recientes para no confundirlos con un humano escribiendo desde el teléfono.
 */
final class OutgoingEcho
{
    private const TTL_SECONDS = 300;

    private const MAX_BODIES = 10;

    public function remember(string $lineId, string $chatId, string $body): void
    {
        $key = $this->key($lineId, $chatId);
        $bodies = Cache::get($key, []);
        $bodies[] = $this->normalize($body);

        Cache::put($key, array_slice($bodies, -self::MAX_BODIES), self::TTL_SECONDS);
    }

    public function isEcho(string $lineId, string $chatId, string $body): bool
    {
        $bodies = Cache::get($this->key($lineId, $chatId), []);
        if ($bodies === []) {
            return false;
        }

        $normalized = $this->normalize($body);
        if ($normalized === '') {
            return true;
        }

        foreach ($bodies as $sent) {
            if ($sent === $normalized
                || ($sent !== '' && (str_contains($sent, mb_substr($normalized, 0, 120)) || str_contains($normalized, mb_substr($sent, 0, 120))))) {
                return true;
            }
        }

        return false;
    }

    private function key(string $lineId, string $chatId): string
    {
        return 'saleshub:echo:'.md5($lineId.'|'.$chatId);
    }

    private function normalize(string $body): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', $body) ?? $body));
    }
}
