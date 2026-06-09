<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\Order;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Checkout\SaasCatalogSku;
use App\Support\Checkout\SaasSubscriptionLookup;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Impide pedidos duplicados de alta SaaS; en su lugar reenvía acceso existente.
 */
final class SaasDuplicateCheckoutGuard
{
    public function __construct(
        private readonly SaasExistingAccountNotifier $existingAccountNotifier,
    ) {}

    /**
     * @param  Collection<int, CatalogSku>  $skus
     */
    public function assertCanCheckout(User $user, Collection $skus): void
    {
        foreach ($skus as $sku) {
            if (! SaasCatalogSku::isSaasSubscription($sku)) {
                continue;
            }

            $existing = $this->findProvisionedSubscription($user, $sku);
            if (! $existing instanceof Subscription) {
                continue;
            }

            if (SaasSubscriptionLookup::isMarketingRenewalCheckout($sku, $existing)) {
                continue;
            }

            $access = $this->resolveAccess($user, $sku, $existing);
            if ($access === null) {
                continue;
            }

            $this->existingAccountNotifier->notify($user, $access);

            $productLabel = $access['product_key'] === 'vetsaas' ? 'VetSaaS' : 'Aula Virtual';

            throw ValidationException::withMessages([
                'lines' => "Ya tienes una cuenta activa de {$productLabel}. "
                    .'Te enviamos por WhatsApp y correo tu subdominio y datos de acceso. '
                    .'Si olvidaste tu contraseña, usa «Olvidé mi contraseña» en la pantalla de login.',
            ]);
        }
    }

    private function findProvisionedSubscription(User $user, CatalogSku $sku): ?Subscription
    {
        if (SaasCatalogSku::isVetsaas($sku)) {
            return SaasSubscriptionLookup::findVetsaasProvisioned((string) $user->id)
                ?? $this->findVetsaasAccessFromOrders($user);
        }

        if (SaasCatalogSku::isAulaVirtual($sku)) {
            return SaasSubscriptionLookup::findAulaVirtualProvisioned((string) $user->id)
                ?? $this->findAulaAccessFromOrders($user);
        }

        return null;
    }

    /**
     * @return array{login_url: string, tenant_slug: ?string, login_email: string, product_key: string}|null
     */
    private function resolveAccess(User $user, CatalogSku $sku, Subscription $subscription): ?array
    {
        if (SaasCatalogSku::isVetsaas($sku)) {
            $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
            $loginUrl = $metadata['vetsaas_login_url'] ?? null;
            $tenantSlug = SaasSubscriptionLookup::tenantSlugFrom($subscription);

            if ((! is_string($loginUrl) || trim($loginUrl) === '') && is_string($tenantSlug) && $tenantSlug !== '') {
                $scheme = (string) config('services.vetsaas.tenant_scheme', 'https');
                $domain = (string) config('services.vetsaas.tenant_domain', 'vetsaas.orvae.pe');
                $loginUrl = sprintf('%s://%s.%s/login', $scheme, $tenantSlug, $domain);
            }

            if (! is_string($loginUrl) || trim($loginUrl) === '') {
                return $this->accessFromOrderSnapshot($user, 'vetsaas');
            }

            return [
                'login_url' => trim($loginUrl),
                'tenant_slug' => is_string($tenantSlug) ? $tenantSlug : null,
                'login_email' => (string) $user->email,
                'product_key' => 'vetsaas',
            ];
        }

        if (SaasCatalogSku::isAulaVirtual($sku)) {
            $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
            $loginUrl = $metadata['aula_virtual_academy_url'] ?? null;
            $tenantSlug = SaasSubscriptionLookup::aulaTenantSlugFrom($subscription);

            if (! is_string($loginUrl) || trim($loginUrl) === '') {
                return $this->accessFromOrderSnapshot($user, 'aulavirtual');
            }

            return [
                'login_url' => trim($loginUrl),
                'tenant_slug' => is_string($tenantSlug) ? $tenantSlug : null,
                'login_email' => (string) $user->email,
                'product_key' => 'aulavirtual',
            ];
        }

        return null;
    }

    /**
     * @return array{login_url: string, tenant_slug: ?string, login_email: string, product_key: string}|null
     */
    private function accessFromOrderSnapshot(User $user, string $productKey): ?array
    {
        $orders = Order::query()
            ->where('user_id', $user->id)
            ->where('status', Order::STATUS_PAID)
            ->orderByDesc('placed_at')
            ->limit(20)
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

    private function findVetsaasAccessFromOrders(User $user): ?Subscription
    {
        if ($this->accessFromOrderSnapshot($user, 'vetsaas') === null) {
            return null;
        }

        return Subscription::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [
                Subscription::STATUS_ACTIVE,
                Subscription::STATUS_TRIALING,
                Subscription::STATUS_PAST_DUE,
            ])
            ->orderByDesc('current_period_end')
            ->first();
    }

    private function findAulaAccessFromOrders(User $user): ?Subscription
    {
        if ($this->accessFromOrderSnapshot($user, 'aulavirtual') === null) {
            return null;
        }

        return Subscription::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [
                Subscription::STATUS_ACTIVE,
                Subscription::STATUS_TRIALING,
                Subscription::STATUS_PAST_DUE,
            ])
            ->orderByDesc('current_period_end')
            ->first();
    }
}
