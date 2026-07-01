<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Support\Http\OrvaeSignedHttpClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Clínicas VetSaaS con plan de pago y logo (carrusel en orvae.pe/software/VETSAAS).
 */
final class VetSaaSShowcaseClient
{
    /**
     * @return list<array{slug: string, name: string, logo_url: string}>
     */
    public function clients(): array
    {
        return Cache::remember('vetsaas.showcase_clients', 900, function (): array {
            $rows = $this->fetchPublic();

            if ($rows === null) {
                $rows = $this->fetchSignedInternal();
            }

            if ($rows === null) {
                return [];
            }

            return $this->normalizeRows($rows);
        });
    }

    public function forgetCache(): void
    {
        Cache::forget('vetsaas.showcase_clients');
    }

    /**
     * @return list<array<string, mixed>>|null
     */
    private function fetchPublic(): ?array
    {
        $url = $this->resolvePublicShowcaseUrl();

        if ($url === '') {
            return null;
        }

        try {
            $response = Http::timeout(10)
                ->retry(1, 300)
                ->acceptJson()
                ->get($url);
        } catch (\Throwable $e) {
            Log::warning('vetsaas.showcase_public_exception', [
                'url' => $url,
                'exception' => $e->getMessage(),
            ]);

            return null;
        }

        if (! $response->successful()) {
            Log::warning('vetsaas.showcase_public_failed', [
                'url' => $url,
                'status' => $response->status(),
            ]);

            return null;
        }

        $data = $response->json('data');

        return is_array($data) ? $data : null;
    }

    /**
     * @return list<array<string, mixed>>|null
     */
    private function fetchSignedInternal(): ?array
    {
        if (! (bool) config('services.vetsaas.enabled', false)) {
            return null;
        }

        $secret = (string) config('services.vetsaas.hmac_secret');
        $url = $this->resolveSignedShowcaseUrl();

        if ($url === '' || $secret === '') {
            return null;
        }

        try {
            $response = OrvaeSignedHttpClient::get(
                $url,
                $secret,
                'vetsaas-showcase:clients',
            );
        } catch (\Throwable $e) {
            Log::warning('vetsaas.showcase_signed_exception', [
                'exception' => $e->getMessage(),
            ]);

            return null;
        }

        if (! $response->successful()) {
            Log::warning('vetsaas.showcase_signed_failed', [
                'status' => $response->status(),
            ]);

            return null;
        }

        $data = $response->json('data');

        return is_array($data) ? $data : null;
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     * @return list<array{slug: string, name: string, logo_url: string}>
     */
    private function normalizeRows(array $rows): array
    {
        $normalized = [];

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $logo = trim((string) ($row['logo_url'] ?? ''));
            $name = trim((string) ($row['name'] ?? ''));

            if ($logo === '' || $name === '') {
                continue;
            }

            $normalized[] = [
                'slug' => (string) ($row['slug'] ?? ''),
                'name' => $name,
                'logo_url' => $logo,
            ];
        }

        return $normalized;
    }

    private function resolvePublicShowcaseUrl(): string
    {
        $explicit = trim((string) config('services.vetsaas.showcase_url', ''));

        if ($explicit !== '') {
            return $explicit;
        }

        $base = $this->vetsaasApiBaseFromProvisionUrl();

        return $base !== '' ? $base.'/api/public/vetsaas/showcase' : '';
    }

    private function resolveSignedShowcaseUrl(): string
    {
        $base = $this->vetsaasApiBaseFromProvisionUrl();

        return $base !== '' ? $base.'/api/internal/saas/showcase' : '';
    }

    private function vetsaasApiBaseFromProvisionUrl(): string
    {
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

        return rtrim($base, '/');
    }
}
