<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Clientes con cuenta Google deben completar DNI/RUC antes de usar el portal.
 */
class EnsureClientProfileComplete
{
    /**
     * @var list<string>
     */
    private const EXCLUDED_ROUTE_NAMES = [
        'auth.google.complete',
        'auth.google.complete.store',
        'logout',
        'verification.notice',
        'verification.verify',
        'verification.send',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->hasRole('superadmin')) {
            return $next($request);
        }

        if (! $user->hasRole('client')) {
            return $next($request);
        }

        if (! $user->needsProfileCompletion()) {
            return $next($request);
        }

        if ($request->routeIs(...self::EXCLUDED_ROUTE_NAMES)) {
            return $next($request);
        }

        return redirect()->route('auth.google.complete');
    }
}
