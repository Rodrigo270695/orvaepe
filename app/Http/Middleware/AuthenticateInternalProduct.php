<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * API interna para productos (VetSaaS, TallerSaaS): el header X-Internal-Key identifica al producto.
 * El producto autenticado queda en $request->attributes->get('internal_producto').
 */
class AuthenticateInternalProduct
{
    public function handle(Request $request, Closure $next): Response
    {
        $provided = (string) $request->header('X-Internal-Key', '');

        if ($provided !== '') {
            foreach ((array) config('whatsapp_cloud.products', []) as $producto => $settings) {
                $key = (string) ($settings['internal_api_key'] ?? '');

                if ($key !== '' && hash_equals($key, $provided)) {
                    $request->attributes->set('internal_producto', (string) $producto);

                    return $next($request);
                }
            }
        }

        return response()->json(['ok' => false, 'message' => 'Unauthorized'], 401);
    }
}
