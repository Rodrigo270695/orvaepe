<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use App\Services\OpenWaLines\SaasDirectory;
use App\Support\Http\OrvaeSignedHttpClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Conocimiento de ventas que publica cada SaaS conectado (planes, módulos, FAQ, novedades, demo).
 * GET firmado con su hmac_secret a services.{producto}.knowledge_url, o a
 * {provision_url sin /provision}/salesbot-knowledge. Caché corta + última respuesta buena.
 */
final class SaasKnowledgeClient
{
    public const VERSION = 1;

    private const CACHE_TTL_MINUTES = 30;

    /** Si el SaaS no responde, no se reintenta en cada mensaje: se usa la última respuesta buena. */
    private const FAILURE_TTL_MINUTES = 3;

    private const SECTION_TYPES = ['modulo', 'faq', 'objecion', 'novedad', 'general'];

    public function __construct(
        private readonly SaasDirectory $saas,
    ) {}

    /**
     * @return array<string, array<string, mixed>|null> clave del SaaS => conocimiento (null si nunca respondió)
     */
    public function all(): array
    {
        $out = [];

        foreach (array_keys($this->saas->connected()) as $producto) {
            $out[$producto] = $this->get($producto);
        }

        return $out;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function get(string $producto): ?array
    {
        if (! array_key_exists($producto, $this->saas->connected())) {
            return null;
        }

        $cached = Cache::get($this->cacheKey($producto));

        if (is_array($cached)) {
            return ($cached['__failed'] ?? false) ? Cache::get($this->lastGoodKey($producto)) : $cached;
        }

        $payload = $this->fetch($producto);

        if ($payload === null) {
            Cache::put($this->cacheKey($producto), ['__failed' => true], now()->addMinutes(self::FAILURE_TTL_MINUTES));

            return Cache::get($this->lastGoodKey($producto));
        }

        Cache::put($this->cacheKey($producto), $payload, now()->addMinutes(self::CACHE_TTL_MINUTES));
        Cache::forever($this->lastGoodKey($producto), $payload);

        return $payload;
    }

    public function forget(string $producto): void
    {
        Cache::forget($this->cacheKey($producto));
    }

    public function url(string $producto): ?string
    {
        $explicit = trim((string) config("services.{$producto}.knowledge_url", ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $provision = trim((string) config("services.{$producto}.provision_url", ''));
        if ($provision === '') {
            return null;
        }

        if (preg_match('#/provision/?$#', $provision) === 1) {
            return (string) preg_replace('#/provision/?$#', '/salesbot-knowledge', $provision);
        }

        $parts = parse_url($provision);
        if (! isset($parts['scheme'], $parts['host'])) {
            return null;
        }

        $port = isset($parts['port']) ? ':'.$parts['port'] : '';

        return "{$parts['scheme']}://{$parts['host']}{$port}/api/internal/saas/salesbot-knowledge";
    }

    /**
     * @return array<string, mixed>|null
     */
    private function fetch(string $producto): ?array
    {
        $url = $this->url($producto);
        $secret = (string) config("services.{$producto}.hmac_secret", '');

        if ($url === null || $secret === '') {
            return null;
        }

        try {
            $response = OrvaeSignedHttpClient::get($url, $secret, (string) Str::uuid(), timeoutSeconds: 10);
        } catch (Throwable $e) {
            Log::warning('saleshub.knowledge_fetch_failed', ['producto' => $producto, 'message' => $e->getMessage()]);

            return null;
        }

        if (! $response->successful() || ! is_array($response->json())) {
            Log::warning('saleshub.knowledge_fetch_failed', ['producto' => $producto, 'status' => $response->status()]);

            return null;
        }

        return $this->normalize($producto, (array) $response->json());
    }

    /**
     * Contrato v1. Todo se recorta y tipa: el SaaS no puede inyectar estructuras inesperadas.
     *
     * @param  array<string, mixed>  $raw
     * @return array<string, mixed>
     */
    private function normalize(string $producto, array $raw): array
    {
        $planes = [];
        foreach (array_slice((array) ($raw['planes'] ?? []), 0, 20) as $plan) {
            if (! is_array($plan) || blank($plan['nombre'] ?? null)) {
                continue;
            }

            $planes[] = [
                'codigo' => $this->str($plan['codigo'] ?? null, 64),
                'nombre' => $this->str($plan['nombre'], 120),
                'descripcion' => $this->str($plan['descripcion'] ?? null, 500),
                'precio_mensual' => is_numeric($plan['precio_mensual'] ?? null) ? (float) $plan['precio_mensual'] : null,
                'precio_anual' => is_numeric($plan['precio_anual'] ?? null) ? (float) $plan['precio_anual'] : null,
                'moneda' => $this->str($plan['moneda'] ?? 'PEN', 8) ?? 'PEN',
                'trial_days' => (int) ($plan['trial_days'] ?? 0),
                'incluye' => $this->strings($plan['incluye'] ?? [], 30, 200),
            ];
        }

        $secciones = [];
        foreach (array_slice((array) ($raw['secciones'] ?? []), 0, 200) as $seccion) {
            if (! is_array($seccion) || blank($seccion['titulo'] ?? null) || blank($seccion['contenido'] ?? null)) {
                continue;
            }

            $tipo = (string) ($seccion['tipo'] ?? 'general');

            $secciones[] = [
                'tipo' => in_array($tipo, self::SECTION_TYPES, true) ? $tipo : 'general',
                'titulo' => $this->str($seccion['titulo'], 200),
                'contenido' => $this->str($seccion['contenido'], 4000),
                'fecha' => $this->str($seccion['fecha'] ?? null, 32),
            ];
        }

        $demo = is_array($raw['demo'] ?? null) && filled($raw['demo']['url'] ?? null)
            ? [
                'url' => $this->str($raw['demo']['url'], 255),
                'usuario' => $this->str($raw['demo']['usuario'] ?? null, 120),
                'password' => $this->str($raw['demo']['password'] ?? null, 120),
            ]
            : null;

        return [
            'version' => (int) ($raw['version'] ?? self::VERSION),
            'producto' => $producto,
            'nombre' => $this->str($raw['nombre'] ?? null, 120) ?? (string) config("services.{$producto}.label", Str::headline($producto)),
            'resumen' => $this->str($raw['resumen'] ?? null, 2000),
            'publico' => $this->str($raw['publico'] ?? null, 500),
            'palabras_clave' => $this->strings($raw['palabras_clave'] ?? [], 50, 60),
            'planes' => $planes,
            'secciones' => $secciones,
            'demo' => $demo,
            'registro_url' => $this->str($raw['registro_url'] ?? null, 255),
            'actualizado_at' => $this->str($raw['actualizado_at'] ?? null, 40),
            'obtenido_at' => now()->toIso8601String(),
        ];
    }

    private function str(mixed $value, int $max): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : mb_substr($value, 0, $max);
    }

    /**
     * @return list<string>
     */
    private function strings(mixed $values, int $maxItems, int $maxLength): array
    {
        $out = [];

        foreach (array_slice(is_array($values) ? $values : [], 0, $maxItems) as $value) {
            $clean = $this->str($value, $maxLength);
            if ($clean !== null) {
                $out[] = $clean;
            }
        }

        return array_values(array_unique($out));
    }

    private function cacheKey(string $producto): string
    {
        return "saleshub.knowledge.{$producto}";
    }

    private function lastGoodKey(string $producto): string
    {
        return "saleshub.knowledge.{$producto}.last_good";
    }
}
