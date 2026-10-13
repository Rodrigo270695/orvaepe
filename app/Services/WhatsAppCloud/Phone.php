<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

/**
 * Teléfono en formato que usa Cloud API: solo dígitos con código de país (51987654321).
 */
final class Phone
{
    public static function normalize(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone) ?? '';

        if (strlen($digits) === 9 && str_starts_with($digits, '9')) {
            $digits = '51'.$digits;
        }

        return strlen($digits) >= 10 && strlen($digits) <= 15 ? $digits : null;
    }
}
