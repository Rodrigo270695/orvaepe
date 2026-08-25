<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Support\Marketing\VetSaaSPlanFeaturesCatalog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Marketing VetSaaS (planes/features + conteo clínicas) para la landing Orvae.
 */
final class VetSaaSMarketingClient
{
    /**
     * @return array{
     *     clinics_count: int,
     *     clinics_display: int,
     *     clinics_label: string,
     *     plans: list<array<string, mixed>>,
     *     comparison: list<array<string, string>>,
     *     clients: list<array{slug: string, name: string, logo_url: string}>
     * }
     */
    public function payload(): array
    {
        return Cache::remember('vetsaas.marketing_payload', 600, function (): array {
            $remote = $this->fetchRemote();

            $catalog = VetSaaSPlanFeaturesCatalog::byCodigo();
            $plans = [];

            if (is_array($remote['plans'] ?? null) && $remote['plans'] !== []) {
                foreach ($remote['plans'] as $plan) {
                    if (! is_array($plan)) {
                        continue;
                    }
                    $codigo = strtolower(trim((string) ($plan['codigo'] ?? '')));
                    if ($codigo === '') {
                        continue;
                    }
                    $fallback = $catalog[$codigo] ?? null;
                    $highlights = $plan['highlights'] ?? ($fallback['highlights'] ?? []);
                    if (! is_array($highlights)) {
                        $highlights = $fallback['highlights'] ?? [];
                    }

                    $plans[] = [
                        'codigo' => $codigo,
                        'nombre' => (string) ($plan['nombre'] ?? $fallback['nombre'] ?? ucfirst($codigo)),
                        'descripcion' => (string) ($plan['descripcion'] ?? $fallback['descripcion'] ?? ''),
                        'badge' => $plan['badge'] ?? ($fallback['badge'] ?? null),
                        'referral_reward_days' => (int) ($plan['referral_reward_days'] ?? 0),
                        'highlights' => array_values(array_filter(array_map(
                            static fn ($h) => is_string($h) ? trim($h) : '',
                            $highlights,
                        ))),
                    ];
                }
            }

            if ($plans === []) {
                foreach ($catalog as $codigo => $meta) {
                    $plans[] = [
                        'codigo' => $codigo,
                        'nombre' => $meta['nombre'],
                        'descripcion' => $meta['descripcion'],
                        'badge' => $meta['badge'],
                        'referral_reward_days' => 0,
                        'highlights' => $meta['highlights'],
                    ];
                }
            }

            $count = (int) ($remote['clinics_count'] ?? 42);
            if ($count < 1) {
                $count = 42;
            }
            $display = (int) ($remote['clinics_display'] ?? 0);
            if ($display < 100) {
                $display = (int) (ceil($count / 100) * 100);
            }

            $clients = [];
            if (is_array($remote['clients'] ?? null)) {
                foreach ($remote['clients'] as $row) {
                    if (! is_array($row)) {
                        continue;
                    }
                    $name = trim((string) ($row['name'] ?? ''));
                    $logo = trim((string) ($row['logo_url'] ?? ''));
                    if ($name === '' || $logo === '') {
                        continue;
                    }
                    $clients[] = [
                        'slug' => (string) ($row['slug'] ?? ''),
                        'name' => $name,
                        'logo_url' => $logo,
                    ];
                }
            }

            $comparison = is_array($remote['comparison'] ?? null) && $remote['comparison'] !== []
                ? $remote['comparison']
                : VetSaaSPlanFeaturesCatalog::comparisonRows();

            $modulesNote = is_string($remote['modules_note'] ?? null) && trim((string) $remote['modules_note']) !== ''
                ? trim((string) $remote['modules_note'])
                : 'Todos los módulos (historia clínica, agenda, inventario, grooming, hotel, laboratorio, caja) están incluidos en todos los planes. Lo que cambia es la cantidad.';

            return [
                'clinics_count' => $count,
                'clinics_display' => $display,
                'clinics_label' => $display.'+',
                'plans' => $plans,
                'comparison' => $comparison,
                'modules_note' => $modulesNote,
                'clients' => $clients,
            ];
        });
    }

    public function forgetCache(): void
    {
        Cache::forget('vetsaas.marketing_payload');
    }

    /**
     * @return array<string, mixed>
     */
    private function fetchRemote(): array
    {
        $url = $this->resolveMarketingUrl();
        if ($url === '') {
            return [];
        }

        try {
            $response = Http::timeout(8)
                ->retry(1, 250)
                ->acceptJson()
                ->get($url);
        } catch (\Throwable $e) {
            Log::warning('vetsaas.marketing_exception', [
                'url' => $url,
                'exception' => $e->getMessage(),
            ]);

            return [];
        }

        if (! $response->successful()) {
            Log::warning('vetsaas.marketing_failed', [
                'url' => $url,
                'status' => $response->status(),
            ]);

            return [];
        }

        $json = $response->json();

        return is_array($json) ? $json : [];
    }

    private function resolveMarketingUrl(): string
    {
        $explicit = trim((string) config('services.vetsaas.marketing_url', ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $showcase = trim((string) config('services.vetsaas.showcase_url', ''));
        if ($showcase !== '' && str_contains($showcase, '/showcase')) {
            return str_replace('/showcase', '/marketing', $showcase);
        }

        $provision = trim((string) config('services.vetsaas.provision_url', ''));
        if ($provision === '') {
            return '';
        }

        $base = rtrim($provision, '/');
        if (str_ends_with($base, '/provision')) {
            $base = substr($base, 0, -strlen('/provision'));
        }
        if (str_ends_with($base, '/api/internal/saas')) {
            $base = substr($base, 0, -strlen('/api/internal/saas'));
        }

        return rtrim($base, '/').'/api/public/vetsaas/marketing';
    }
}
