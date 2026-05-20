<?php

namespace App\Http\Responses;

use App\Support\AuthRedirect;
use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 201);
        }

        $user = $request->user();

        if ($user?->needsProfileCompletion()) {
            return redirect()->intended(route('auth.google.complete'));
        }

        return redirect()->intended(AuthRedirect::homeFor($user));
    }
}
