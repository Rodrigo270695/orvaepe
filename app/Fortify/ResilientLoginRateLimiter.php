<?php

namespace App\Fortify;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Fortify\LoginRateLimiter;
use Throwable;

/**
 * Evita 500 en login cuando el almacén de caché (p. ej. Redis) falla en producción.
 * Fortify incrementa intentos antes de lanzar ValidationException; si hit() rompe,
 * el usuario nunca ve "credenciales incorrectas".
 */
final class ResilientLoginRateLimiter extends LoginRateLimiter
{
    public function attempts(Request $request): mixed
    {
        try {
            return parent::attempts($request);
        } catch (Throwable $e) {
            Log::warning('Login rate limiter: attempts() falló; se omite el límite para esta petición.', [
                'exception' => $e,
            ]);

            return 0;
        }
    }

    public function tooManyAttempts(Request $request): bool
    {
        try {
            return parent::tooManyAttempts($request);
        } catch (Throwable $e) {
            Log::warning('Login rate limiter: tooManyAttempts() falló; no se bloquea el intento.', [
                'exception' => $e,
            ]);

            return false;
        }
    }

    public function increment(Request $request): void
    {
        try {
            parent::increment($request);
        } catch (Throwable $e) {
            Log::warning('Login rate limiter: increment() falló; se continúa con la respuesta de validación.', [
                'exception' => $e,
            ]);
        }
    }

    public function availableIn(Request $request): int
    {
        try {
            return parent::availableIn($request);
        } catch (Throwable $e) {
            Log::warning('Login rate limiter: availableIn() falló.', [
                'exception' => $e,
            ]);

            return 0;
        }
    }

    public function clear(Request $request): void
    {
        try {
            parent::clear($request);
        } catch (Throwable $e) {
            Log::warning('Login rate limiter: clear() falló.', [
                'exception' => $e,
            ]);
        }
    }
}
