<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

/**
 * Interpreta la respuesta del cliente a un recordatorio ("Confirmo", "REPROGRAMAR.", "reprogramar 🙏").
 */
final class ReminderReply
{
    public const CONFIRMADO = 'confirmado';

    public const REPROGRAMAR = 'reprogramar';

    public static function fromText(?string $text): ?string
    {
        $word = mb_strtolower(preg_replace('/[^\p{L}]+/u', '', (string) $text) ?? '');

        return match ($word) {
            'confirmo' => self::CONFIRMADO,
            'reprogramar' => self::REPROGRAMAR,
            default => null,
        };
    }
}
