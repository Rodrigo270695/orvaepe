<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Support\Http\OrvaeSignedHttpClient;
use Illuminate\Support\Facades\Log;

/**
 * Consulta el excedente de comprobantes VetSaaS del período en curso (server-to-server).
 */
final class VetSaaSComprobantesOverageClient
{
    /**
     * @return array<string, mixed>|null
     */
    public function forTenantSlug(string $tenantSlug): ?array
    {
        if (! (bool) config('services.vetsaas.enabled', false)) {
            return null;
        }

        $secret = (string) config('services.vetsaas.hmac_secret');
        $url = $this->resolveOverageUrl($tenantSlug);

        if ($url === '' || $secret === '') {
            return null;
        }

        try {
            $response = OrvaeSignedHttpClient::get(
                $url,
                $secret,
                'vetsaas-overage:'.sha1($tenantSlug),
            );
        } catch (\Throwable $e) {
            Log::warning('vetsaas.overage_exception', [
                'tenant_slug' => $tenantSlug,
                'exception' => $e->getMessage(),
            ]);

            return null;
        }

        if (! $response->successful()) {
            Log::warning('vetsaas.overage_failed', [
                'tenant_slug' => $tenantSlug,
                'status' => $response->status(),
            ]);

            return null;
        }

        $json = $response->json();

        return is_array($json) ? $json : null;
    }

    private function resolveOverageUrl(string $tenantSlug): string
    {
        $provision = trim((string) config('services.vetsaas.provision_url', ''));

        if ($provision !== '') {
            $base = rtrim($provision, '/');

            if (str_ends_with($base, '/provision')) {
                $base = substr($base, 0, -strlen('/provision'));
            }

            return $base.'/tenants/'.rawurlencode($tenantSlug).'/comprobantes-overage';
        }

        return '';
    }
}
