<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Fortify;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 201);
        }

        $user = $request->user();
        $home = Fortify::redirects('register', config('fortify.home'));

        if ($user?->hasRole('client') && ! $user->hasRole('superadmin')) {
            $home = '/cliente';
        }

        return redirect()->intended($home);
    }
}
