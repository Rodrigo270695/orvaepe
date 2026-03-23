<?php

namespace App\Support;

/** Payload de sesión `toast` consumido por HandleInertiaRequests y AdminFlashToast (front). */
final class AdminFlashToast
{
    /**
     * @return array{id: string, type: 'success', title: string, description?: string}
     */
    public static function success(string $title, ?string $description = null): array
    {
        $payload = [
            'id' => (string) microtime(true),
            'type' => 'success',
            'title' => $title,
        ];

        if ($description !== null && $description !== '') {
            $payload['description'] = $description;
        }

        return $payload;
    }

    /**
     * @return array{id: string, type: 'error', title: string, description?: string}
     */
    public static function error(string $title, ?string $description = null): array
    {
        $payload = [
            'id' => (string) microtime(true),
            'type' => 'error',
            'title' => $title,
        ];

        if ($description !== null && $description !== '') {
            $payload['description'] = $description;
        }

        return $payload;
    }
}
