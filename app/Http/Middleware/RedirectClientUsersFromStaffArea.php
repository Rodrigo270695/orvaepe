<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Clientes (solo rol `client`) no usan el panel interno: se envían al portal.
 */
class RedirectClientUsersFromStaffArea
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('client') && ! $user->hasRole('superadmin')) {
            return redirect()->route('cliente.home');
        }

        return $next($request);
    }
}
