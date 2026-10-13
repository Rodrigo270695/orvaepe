<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

/**
 * Valida X-Hub-Signature-256 = "sha256=" + HMAC-SHA256(cuerpo crudo, app secret).
 */
final class WebhookSignature
{
    public static function isValid(string $rawBody, ?string $header, string $appSecret): bool
    {
        if ($appSecret === '' || $header === null) {
            return false;
        }

        $header = trim($header);
        if (! str_starts_with($header, 'sha256=')) {
            return false;
        }

        $expected = 'sha256='.hash_hmac('sha256', $rawBody, $appSecret);

        return hash_equals($expected, strtolower($header));
    }
}
