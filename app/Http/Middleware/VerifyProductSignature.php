<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Llamadas de un producto (VetSaaS, TallerSaaS…) hacia Orvae firmadas con el mismo HMAC
 * que Orvae usa al provisionar: sha256 sobre "{timestamp}.{raw_body}" con services.{producto}.hmac_secret.
 * Uso: ->middleware(VerifyProductSignature::class.':tallersaas')
 * Con ':route' el producto sale del parámetro {producto} de la ruta (solo SaaS de config/services.php).
 */
class VerifyProductSignature
{
    private const MAX_SKEW_SECONDS = 300;

    public function handle(Request $request, Closure $next, string $producto): Response
    {
        if ($producto === 'route') {
            $producto = (string) $request->route('producto');

            if (preg_match('/^[a-z0-9_-]{2,40}$/', $producto) !== 1 || ! array_key_exists('provision_url', (array) config("services.{$producto}", []))) {
                return response()->json(['error' => 'unauthorized'], 401);
            }
        }

        $secret = (string) config("services.{$producto}.hmac_secret", '');
        $timestamp = (string) $request->header('X-Orvae-Timestamp', '');
        $signature = (string) $request->header('X-Orvae-Signature', '');

        if ($secret === '' || ! ctype_digit($timestamp) || $signature === '') {
            return response()->json(['error' => 'unauthorized'], 401);
        }

        if (abs(time() - (int) $timestamp) > self::MAX_SKEW_SECONDS) {
            return response()->json(['error' => 'unauthorized', 'reason' => 'timestamp_skew'], 401);
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$request->getContent(), $secret);
        $received = str_starts_with($signature, 'sha256=') ? substr($signature, 7) : $signature;

        if (! hash_equals($expected, $received)) {
            return response()->json(['error' => 'unauthorized'], 401);
        }

        return $next($request);
    }
}
