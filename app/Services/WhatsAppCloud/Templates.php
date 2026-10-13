<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud;

/**
 * Plantillas permitidas (config whatsapp_cloud.templates).
 */
final class Templates
{
    /**
     * @return list<string>
     */
    public static function names(): array
    {
        return array_keys((array) config('whatsapp_cloud.templates', []));
    }

    public static function variableCount(string $plantilla): ?int
    {
        $count = config("whatsapp_cloud.templates.{$plantilla}.variables");

        return is_numeric($count) ? (int) $count : null;
    }

    /**
     * @param  list<string>  $variables
     */
    public static function render(string $plantilla, array $variables): ?string
    {
        $texto = config("whatsapp_cloud.templates.{$plantilla}.texto");
        if (! is_string($texto) || $texto === '') {
            return null;
        }

        return preg_replace_callback(
            '/\{\{(\d+)\}\}/',
            fn (array $m): string => $variables[(int) $m[1] - 1] ?? '',
            $texto,
        );
    }
}
