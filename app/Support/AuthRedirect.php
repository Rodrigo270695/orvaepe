<?php

namespace App\Support;

use App\Models\User;
use Laravel\Fortify\Fortify;

final class AuthRedirect
{
    public static function homeFor(User $user): string
    {
        if ($user->hasRole('superadmin')) {
            return config('fortify.home');
        }

        if ($user->hasRole('client') && ! $user->hasRole('superadmin')) {
            return '/cliente';
        }

        return Fortify::redirects('login', config('fortify.home'));
    }
}
