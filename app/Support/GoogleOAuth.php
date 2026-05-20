<?php

namespace App\Support;

final class GoogleOAuth
{
    public static function isConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'));
    }
}
