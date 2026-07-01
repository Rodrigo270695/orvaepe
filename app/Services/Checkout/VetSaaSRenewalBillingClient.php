<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Support\Http\OrvaeSignedHttpClient;
use Illuminate\Support\Facades\Log;

/**
 * Consulta el importe de renovación VetSaaS (precio pactado + add-ons) server-to-server.
 */
final class VetSaaSRenewalBillingClient
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
        $url = $this->resolveBillingUrl($tenantSlug);

        if ($url === '' || $secret === '') {
            return null;
        }

        try {
            $response = OrvaeSignedHttpClient::get(
                $url,
                $secret,
                'vetsaas-renewal-billing:'.sha1($tenantSlug),
            );
        } catch (\Throwable $e) {
            Log::warning('vetsaas.renewal_billing_exception', [
                'tenant_slug' => $tenantSlug,
                'exception' => $e->getMessage(),
            ]);

            return null;
        }

        if (! $response->successful()) {
            Log::warning('vetsaas.renewal_billing_failed', [
                'tenant_slug' => $tenantSlug,
                'status' => $response->status(),
            ]);

            return null;
        }

        $json = $response->json();

        return is_array($json) ? $json : null;
    }

    private function resolveBillingUrl(string $tenantSlug): string
    {
        $provision = trim((string) config('services.vetsaas.provision_url', ''));

        if ($provision !== '') {
            $base = rtrim($provision, '/');

            if (str_ends_with($base, '/provision')) {
                $base = substr($base, 0, -strlen('/provision'));
            }

            return $base.'/tenants/'.rawurlencode($tenantSlug).'/renewal-billing';
        }

        return '';
    }
}
