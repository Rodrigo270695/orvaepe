<?php

namespace App\Http\Responses;

use App\Support\AuthRedirect;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();

        if ($user?->needsProfileCompletion()) {
            return redirect()->intended(route('auth.google.complete'));
        }

        return redirect()->intended(AuthRedirect::homeFor($user));
    }
}
