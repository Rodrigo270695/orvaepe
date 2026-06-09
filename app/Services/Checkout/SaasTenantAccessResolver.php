<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Order;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Checkout\SaasCatalogSku;
use App\Support\Checkout\SaasSubscriptionLookup;
use App\Support\Http\OrvaeSignedHttpClient;
use Illuminate\Support\Facades\Log;

/**
 * Resuelve URL, subdominio y usuario de un tenant SaaS ya existente.
 */
final class SaasTenantAccessResolver
{
    /**
     * @return array{login_url: string, tenant_slug: ?string, login_email: string, product_key: string}|null
     */
    public function resolveVetsaas(User $user): ?array
    {
        $email = strtolower(trim((string) $user->email));
        if ($email === '') {
            return null;
        }

        $fromApi = $this->lookupVetsaasByEmail($email);
        if ($fromApi !== null) {
            return $fromApi;
        }

        $subscription = SaasSubscriptionLookup::findVetsaasProvisioned((string) $user->id)
            ?? SaasSubscriptionLookup::findActiveSaasSubscription((string) $user->id, 'vetsaas');

        if ($subscription instanceof Subscription) {
            $access = $this->accessFromSubscription($user, $subscription, 'vetsaas');
            if ($access !== null) {
                return $access;
            }
        }

        return $this->accessFromOrders($user, 'vetsaas');
    }

    /**
     * @return array{login_url: string, tenant_slug: ?string, login_email: string, product_key: string}|null
     */
    public function resolveAulaVirtual(User $user): ?array
    {
        $subscription = SaasSubscriptionLookup::findAulaVirtualProvisioned((string) $user->id)
            ?? SaasSubscriptionLookup::findActiveSaasSubscription((string) $user->id, 'aulavirtual');

        if ($subscription instanceof Subscription) {
            $access = $this->accessFromSubscription($user, $subscription, 'aulavirtual');
            if ($access !== null) {
                return $access;
            }
        }

        return $this->accessFromOrders($user, 'aulavirtual');
    }

    /**
     * @return array{login_url: string, tenant_slug: ?string, login_email: string, product_key: string}|null
     */
    private function lookupVetsaasByEmail(string $email): ?array
    {
        if (! (bool) config('services.vetsaas.enabled', false)) {
            return null;
        }

        $url = $this->resolveLookupUrl();
        $secret = (string) config('services.vetsaas.hmac_secret');

        if ($url === '' || $secret === '') {
            return null;
        }

        try {
            $response = OrvaeSignedHttpClient::get(
                $url.'?email='.rawurlencode($email),
                $secret,
                'lookup:email:'.sha1($email),
                timeoutSeconds: 10,
                retries: 1,
            );
        } catch (\Throwable $e) {
            Log::warning('vetsaas.lookup_exception', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            return null;
        }

        if ($response->status() === 404) {
            return null;
        }

        if (! $response->successful()) {
            Log::warning('vetsaas.lookup_failed', [
                'email' => $email,
                'status' => $response->status(),
            ]);

            return null;
        }

        $json = $response->json();
        if (! is_array($json)) {
            return null;
        }

        $loginUrl = $json['login_url'] ?? null;
        $tenantSlug = $json['tenant_slug'] ?? null;
        $loginEmail = $json['login_email'] ?? $email;

        if (! is_string($loginUrl) || trim($loginUrl) === '') {
            return null;
        }

        return [
            'login_url' => trim($loginUrl),
            'tenant_slug' => is_string($tenantSlug) && $tenantSlug !== '' ? $tenantSlug : null,
            'login_email' => is_string($loginEmail) && $loginEmail !== '' ? $loginEmail : $email,
            'product_key' => 'vetsaas',
        ];
    }

    private function resolveLookupUrl(): string
    {
        $explicit = trim((string) config('services.vetsaas.lookup_url', ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $provision = trim((string) config('services.vetsaas.provision_url', ''));
        if ($provision === '') {
            return '';
        }

        if (str_ends_with($provision, '/provision')) {
            return substr($provision, 0, -strlen('/provision')).'/lookup';
        }

        return rtrim($provision, '/').'/lookup';
    }

    /**
     * @return array{login_url: string, tenant_slug: ?string, login_email: string, product_key: string}|null
     */
    private function accessFromSubscription(User $user, Subscription $subscription, string $productKey): ?array
    {
        $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];

        if ($productKey === 'vetsaas') {
            $loginUrl = $metadata['vetsaas_login_url'] ?? null;
            $tenantSlug = SaasSubscriptionLookup::tenantSlugFrom($subscription);

            if ((! is_string($loginUrl) || trim($loginUrl) === '') && is_string($tenantSlug) && $tenantSlug !== '') {
                $scheme = (string) config('services.vetsaas.tenant_scheme', 'https');
                $domain = (string) config('services.vetsaas.tenant_domain', 'vetsaas.orvae.pe');
                $loginUrl = sprintf('%s://%s.%s/login', $scheme, $tenantSlug, $domain);
            }

            if (! is_string($loginUrl) || trim($loginUrl) === '') {
                return null;
            }

            return [
                'login_url' => trim($loginUrl),
                'tenant_slug' => is_string($tenantSlug) ? $tenantSlug : null,
                'login_email' => (string) $user->email,
                'product_key' => 'vetsaas',
            ];
        }

        $loginUrl = $metadata['aula_virtual_academy_url'] ?? null;
        $tenantSlug = SaasSubscriptionLookup::aulaTenantSlugFrom($subscription);

        if (! is_string($loginUrl) || trim($loginUrl) === '') {
            return null;
        }

        return [
            'login_url' => trim($loginUrl),
            'tenant_slug' => is_string($tenantSlug) ? $tenantSlug : null,
            'login_email' => (string) $user->email,
            'product_key' => 'aulavirtual',
        ];
    }

    /**
     * @return array{login_url: string, tenant_slug: ?string, login_email: string, product_key: string}|null
     */
    private function accessFromOrders(User $user, string $productKey): ?array
    {
        $orders = Order::query()
            ->where('user_id', $user->id)
            ->where('status', Order::STATUS_PAID)
            ->orderByDesc('placed_at')
            ->limit(30)
            ->get(['billing_snapshot']);

        foreach ($orders as $order) {
            $snapshot = is_array($order->billing_snapshot) ? $order->billing_snapshot : [];

            if ($productKey === 'vetsaas') {
                $loginUrl = $snapshot['vetsaas_login_url'] ?? null;
                $tenantSlug = $snapshot['vetsaas_tenant_slug'] ?? null;
                $loginEmail = $snapshot['vetsaas_login_email'] ?? $user->email;

                if (is_string($loginUrl) && trim($loginUrl) !== '') {
                    return [
                        'login_url' => trim($loginUrl),
                        'tenant_slug' => is_string($tenantSlug) ? $tenantSlug : null,
                        'login_email' => (string) $loginEmail,
                        'product_key' => 'vetsaas',
                    ];
                }

                if (is_string($tenantSlug) && trim($tenantSlug) !== '') {
                    $scheme = (string) config('services.vetsaas.tenant_scheme', 'https');
                    $domain = (string) config('services.vetsaas.tenant_domain', 'vetsaas.orvae.pe');

                    return [
                        'login_url' => sprintf('%s://%s.%s/login', $scheme, trim($tenantSlug), $domain),
                        'tenant_slug' => trim($tenantSlug),
                        'login_email' => (string) $loginEmail,
                        'product_key' => 'vetsaas',
                    ];
                }
            }

            if ($productKey === 'aulavirtual') {
                $loginUrl = $snapshot['aula_virtual_academy_url'] ?? null;
                $tenantSlug = $snapshot['aula_virtual_tenant_slug'] ?? null;

                if (is_string($loginUrl) && trim($loginUrl) !== '') {
                    return [
                        'login_url' => trim($loginUrl),
                        'tenant_slug' => is_string($tenantSlug) ? $tenantSlug : null,
                        'login_email' => (string) $user->email,
                        'product_key' => 'aulavirtual',
                    ];
                }
            }
        }

        return null;
    }

    public function userAlreadyHasSaasProduct(User $user, string $productKey): bool
    {
        if ($productKey === 'vetsaas' && $this->resolveVetsaas($user) !== null) {
            return true;
        }

        if ($productKey === 'aulavirtual' && $this->resolveAulaVirtual($user) !== null) {
            return true;
        }

        if (SaasSubscriptionLookup::findActiveSaasSubscription((string) $user->id, $productKey) !== null) {
            return true;
        }

        return SaasSubscriptionLookup::hasPaidSaasOrder((string) $user->id, $productKey);
    }
}
