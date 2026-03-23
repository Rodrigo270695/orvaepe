<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();
        $home = Fortify::redirects('login', config('fortify.home'));

        if ($user?->hasRole('superadmin')) {
            $home = config('fortify.home');
        } elseif ($user?->hasRole('client')) {
            $home = '/cliente';
        }

        return redirect()->intended($home);
    }
}
