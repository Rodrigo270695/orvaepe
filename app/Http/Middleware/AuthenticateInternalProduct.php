<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\IpUtils;
use Symfony\Component\HttpFoundation\Response;

/**
 * API interna para productos (VetSaaS, TallerSaaS): el header X-Internal-Key identifica al producto.
 * Con WHATSAPP_INTERNAL_ALLOWED_IPS solo se acepta desde esas IPs / rangos CIDR.
 * El producto autenticado queda en $request->attributes->get('internal_producto').
 */
class AuthenticateInternalProduct
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedIps = (array) config('whatsapp_cloud.internal_allowed_ips', []);

        if ($allowedIps !== [] && ! IpUtils::checkIp((string) $request->ip(), $allowedIps)) {
            return response()->json(['ok' => false, 'message' => 'Forbidden'], 403);
        }

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
