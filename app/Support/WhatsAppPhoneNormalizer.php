<?php

namespace App\Support;

/**
 * Normaliza números móviles peruanos al formato sin "+" que suelen aceptar APIs tipo UltraMsg (ej. 51987654321).
 */
final class WhatsAppPhoneNormalizer
{
    public static function toDigits(?string $phone): ?string
    {
        if ($phone === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if ($digits === '') {
            return null;
        }

        // Ya viene con código Perú
        if (strlen($digits) === 11 && str_starts_with($digits, '51') && $digits[2] === '9') {
            return $digits;
        }

        // Móvil PE: 9 dígitos empezando por 9
        if (strlen($digits) === 9 && str_starts_with($digits, '9')) {
            return '51'.$digits;
        }

        // Internacional genérico (conservar)
        if (strlen($digits) >= 10) {
            return $digits;
        }

        return null;
    }
}
