<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Planes y features de TallerSaaS para la landing de Orvae.
 * La fuente es el panel de TallerSaaS (GET /api/public/tallersaas/plans); TallerSaaS avisa al cambiar
 * y aquí se borra la caché. Si TallerSaaS no responde se usa la última respuesta buena.
 */
final class TallerSaaSMarketingClient
{
    private const CACHE_KEY = 'tallersaas.marketing_payload';

    private const LAST_GOOD_KEY = 'tallersaas.marketing_last_good';

    private const TTL_SECONDS = 600;

    /** Filas de la tabla comparativa, en orden. Los módulos van en todos los planes. */
    private const COMPARISON_FEATURES = [
        'max_sedes' => 'Sedes',
        'max_usuarios' => 'Usuarios',
        'max_clientes' => 'Clientes',
        'max_vehiculos' => 'Vehículos',
        'max_productos' => 'Productos en inventario',
        'boletas_electronicas' => 'Boleta SUNAT',
        'facturas_electronicas' => 'Factura SUNAT',
        'guias_remision' => 'Guías de remisión',
        'max_comprobantes_mes' => 'Comprobantes SUNAT / mes',
    ];

    private const INCLUDED_MODULES = ['Car wash', 'WhatsApp'];

    /**
     * @return array{
     *     plans: list<array{codigo: string, nombre: string, descripcion: ?string, badge: ?string, trial_days: int, highlights: list<string>, features: array<string, mixed>}>,
     *     comparison: list<array{key: string, label: string, values: array<string, string>}>
     * }|null
     */
    public function payload(): ?array
    {
        $cached = Cache::get(self::CACHE_KEY);
        if (is_array($cached)) {
            return $cached;
        }

        $fresh = $this->build($this->fetchRemote());
        if ($fresh !== null) {
            Cache::put(self::CACHE_KEY, $fresh, self::TTL_SECONDS);
            Cache::forever(self::LAST_GOOD_KEY, $fresh);

            return $fresh;
        }

        $lastGood = Cache::get(self::LAST_GOOD_KEY);
        if (is_array($lastGood)) {
            Cache::put(self::CACHE_KEY, $lastGood, 60);

            return $lastGood;
        }

        return null;
    }

    public function forgetCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @param  array<string, mixed>  $remote
     * @return array<string, mixed>|null
     */
    private function build(array $remote): ?array
    {
        $plans = [];
        foreach ((array) ($remote['plans'] ?? []) as $plan) {
            if (! is_array($plan) || ! is_array($plan['features'] ?? null)) {
                continue;
            }
            $codigo = strtolower(trim((string) ($plan['codigo'] ?? '')));
            if ($codigo === '') {
                continue;
            }

            $features = $plan['features'];
            $plans[] = [
                'codigo' => $codigo,
                'nombre' => (string) ($plan['nombre'] ?? ucfirst($codigo)),
                'descripcion' => isset($plan['descripcion']) ? (string) $plan['descripcion'] : null,
                'badge' => isset($plan['badge']) ? (string) $plan['badge'] : null,
                'trial_days' => (int) ($plan['trial_days'] ?? 0),
                'highlights' => self::highlights($features),
                'features' => $features,
            ];
        }

        if ($plans === []) {
            return null;
        }

        $comparison = [];
        foreach (self::COMPARISON_FEATURES as $feature => $label) {
            $values = [];
            foreach ($plans as $plan) {
                $values[$plan['codigo']] = self::formatValue($plan['features'][$feature] ?? null);
            }
            $comparison[] = ['key' => $feature, 'label' => $label, 'values' => $values];
        }
        foreach (self::INCLUDED_MODULES as $module) {
            $comparison[] = [
                'key' => 'modulo_'.strtolower(str_replace(' ', '_', $module)),
                'label' => $module,
                'values' => array_fill_keys(array_column($plans, 'codigo'), 'Sí'),
            ];
        }

        return ['plans' => $plans, 'comparison' => $comparison];
    }

    public static function formatValue(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? 'Sí' : 'No';
        }
        if ($value === null) {
            return '—';
        }
        if (is_numeric($value)) {
            $int = (int) $value;

            return match (true) {
                $int < 0 => 'Ilimitado',
                $int === 0 => 'No incluye',
                default => self::number($int),
            };
        }

        return (string) $value;
    }

    /**
     * @param  array<string, mixed>  $f
     * @return list<string>
     */
    private static function highlights(array $f): array
    {
        $sedes = (int) ($f['max_sedes'] ?? 1);
        $usuarios = (int) ($f['max_usuarios'] ?? 1);
        $clientes = (int) ($f['max_clientes'] ?? 0);
        $vehiculos = (int) ($f['max_vehiculos'] ?? 0);
        $productos = (int) ($f['max_productos'] ?? 0);
        $comprobantes = (int) ($f['max_comprobantes_mes'] ?? 0);
        $boleta = (bool) ($f['boletas_electronicas'] ?? false);
        $factura = (bool) ($f['facturas_electronicas'] ?? false);
        $guias = (bool) ($f['guias_remision'] ?? false);

        $lines = ['Todos los módulos incluidos'];

        $sedesTxt = match (true) {
            $sedes < 0 => 'Sedes ilimitadas',
            $sedes === 1 => '1 sede',
            default => 'Hasta '.self::number($sedes).' sedes',
        };
        $usuariosTxt = match (true) {
            $usuarios < 0 => 'usuarios ilimitados',
            $usuarios === 1 => '1 usuario',
            default => self::number($usuarios).' usuarios',
        };
        $lines[] = $sedesTxt.' · '.$usuariosTxt;

        $lines[] = $clientes === $vehiculos
            ? self::quantity($clientes, 'clientes y vehículos', 'Clientes y vehículos')
            : self::quantity($clientes, 'clientes', 'Clientes').' · '.mb_strtolower(self::quantity($vehiculos, 'vehículos', 'Vehículos'));
        $lines[] = self::quantity($productos, 'productos', 'Productos');

        if (! $boleta && ! $factura) {
            $lines[] = 'Sin comprobantes SUNAT';

            return $lines;
        }

        $docs = array_values(array_filter([
            $boleta ? 'boleta' : null,
            $factura ? 'factura' : null,
            $guias ? 'guías' : null,
        ]));
        $lines[] = count($docs) === 1
            ? ucfirst($docs[0]).' electrónica SUNAT'
            : ucfirst(implode(', ', array_slice($docs, 0, -1)).' y '.end($docs)).' SUNAT';

        $lines[] = match (true) {
            $comprobantes < 0 => 'Comprobantes ilimitados',
            $comprobantes === 0 => 'Sin comprobantes al mes',
            default => self::number($comprobantes).' comprobantes / mes',
        };

        return $lines;
    }

    private static function quantity(int $value, string $noun, string $unlimitedNoun): string
    {
        return $value < 0 ? $unlimitedNoun.' ilimitados' : self::number($value).' '.$noun;
    }

    private static function number(int $value): string
    {
        return number_format($value, 0, ',', ' ');
    }

    /**
     * @return array<string, mixed>
     */
    private function fetchRemote(): array
    {
        $url = $this->resolveUrl();
        if ($url === '') {
            return [];
        }

        try {
            $response = Http::timeout(6)->retry(1, 250, throw: false)->acceptJson()->get($url);
        } catch (\Throwable $e) {
            Log::warning('tallersaas.marketing_exception', ['url' => $url, 'exception' => $e->getMessage()]);

            return [];
        }

        if (! $response->successful()) {
            Log::warning('tallersaas.marketing_failed', ['url' => $url, 'status' => $response->status()]);

            return [];
        }

        $json = $response->json();

        return is_array($json) ? $json : [];
    }

    private function resolveUrl(): string
    {
        $explicit = trim((string) config('services.tallersaas.marketing_url', ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $provision = rtrim(trim((string) config('services.tallersaas.provision_url', '')), '/');
        if ($provision === '') {
            return '';
        }

        foreach (['/provision', '/api/internal/saas'] as $suffix) {
            if (str_ends_with($provision, $suffix)) {
                $provision = substr($provision, 0, -strlen($suffix));
            }
        }

        return rtrim($provision, '/').'/api/public/tallersaas/plans';
    }
}
