<?php

namespace App\Support\Users;

use App\Models\User;

final class StaffDisplayName
{
    /**
     * Nombre legible para panel / PDF: perfil legal del usuario, luego nombre y apellidos.
     */
    public static function resolve(?User $user): string
    {
        if ($user === null) {
            return '—';
        }

        $legal = trim((string) ($user->profile?->legal_name ?? ''));
        if ($legal !== '') {
            return (string) preg_replace('/\s+/u', ' ', $legal);
        }

        $given = trim((string) ($user->name ?? ''));
        $family = trim((string) ($user->lastname ?? ''));
        $fromParts = (string) preg_replace('/\s+/u', ' ', implode(' ', array_filter([$given, $family])));
        if ($fromParts !== '') {
            return $fromParts;
        }

        $username = trim((string) ($user->username ?? ''));
        if ($username !== '') {
            return $username;
        }

        $email = trim((string) ($user->email ?? ''));

        return $email !== '' ? $email : '—';
    }
}
