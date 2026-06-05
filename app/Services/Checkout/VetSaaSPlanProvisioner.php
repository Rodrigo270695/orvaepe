<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\Order;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Checkout\SaasCatalogSku;
use App\Support\Checkout\SaasSubscriptionLookup;
use App\Support\Http\OrvaeSignedHttpClient;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Provisión de clínica VetSaaS tras compra de plan veterinario en Orvae.
 */
class VetSaaSPlanProvisioner
{
    public function __construct(
        private readonly SaasProvisionAccessNotifier $accessNotifier,
        private readonly SaasRenewalAccessNotifier $renewalNotifier,
    ) {}

    public function provision(Order $order, CatalogSku $sku, ?\DateTimeInterface $periodEnd = null): void
    {
        if (! SaasCatalogSku::isVetsaas($sku)) {
            $this->noteSnapshot($order, ['vetsaas_provision_skipped' => 'sku_no_es_vetsaas']);

            return;
        }

        if (! $this->isEnabled()) {
            $this->noteSnapshot($order, ['vetsaas_provision_skipped' => 'VETSAAS_PROVISIONING_ENABLED=false']);
            Log::warning('vetsaas.provision_skipped_disabled', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);

            return;
        }

        $url = trim((string) config('services.vetsaas.provision_url'));
        $secret = (string) config('services.vetsaas.hmac_secret');

        if ($url === '' || $secret === '') {
            $this->noteSnapshot($order, ['vetsaas_provision_skipped' => 'falta_url_o_hmac_secret']);
            Log::warning('vetsaas.provision_skipped_missing_config', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);

            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            $this->noteSnapshot($order, ['vetsaas_provision_skipped' => 'pedido_sin_usuario']);

            return;
        }

        $existingSubscription = SaasSubscriptionLookup::findVetsaasRenewable($user->id, $sku);
        if ($existingSubscription instanceof Subscription) {
            $this->renew($order, $sku, $existingSubscription, $periodEnd);

            return;
        }

        $planSlug = $this->resolvePlanSlug($sku);
        if ($planSlug === null) {
            $this->noteSnapshot($order, [
                'vetsaas_provision_skipped' => 'plan_slug_no_mapeado',
                'sku_code' => $sku->code,
            ]);
            Log::info('vetsaas.provision_skipped_unmapped_plan', [
                'order_id' => $order->id,
                'sku_code' => $sku->code,
            ]);

            return;
        }

        $tenantName = $this->resolveTenantName($user);
        $tenantSlug = $this->resolveTenantSlug($tenantName, $user->email);
        $temporaryPassword = Str::password(16);

        $payload = [
            'external_order_id' => (string) $order->id,
            'order_number' => (string) $order->order_number,
            'plan_slug' => $planSlug,
            'tenant_slug' => $tenantSlug,
            'razon_social' => $tenantName,
            'nombre_comercial' => $tenantName,
            'telefono' => (string) ($user->phone ?? ''),
            'admin_nombres' => trim((string) ($user->name ?? '')) ?: 'Administrador',
            'admin_apellidos' => trim((string) ($user->lastname ?? '')) ?: 'Clínica',
            'admin_email' => (string) $user->email,
            'admin_password' => $temporaryPassword,
            'canal_adquisicion' => 'orvae',
            'payment' => [
                'monto' => (float) $order->grand_total,
                'moneda' => (string) $order->currency,
                'pasarela' => $this->resolvePaymentMethod($order),
                'transaction_id' => $order->payments()->latest('paid_at')->value('gateway_payment_id'),
                'pagado_at' => optional($order->placed_at ?? now())->toIso8601String(),
            ],
        ];

        Log::info('vetsaas.provision_request', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'plan_slug' => $planSlug,
            'tenant_slug' => $tenantSlug,
        ]);

        $response = OrvaeSignedHttpClient::post(
            $url,
            $payload,
            $secret,
            'order:'.$order->id,
            timeoutSeconds: 30,
        );

        if (! $response->successful()) {
            $this->noteSnapshot($order, [
                'vetsaas_provision_error' => [
                    'http_status' => $response->status(),
                    'body' => Str::limit((string) $response->body(), 2000),
                    'at' => now()->toIso8601String(),
                ],
            ]);
            Log::warning('vetsaas.provision_failed', [
                'order_id' => $order->id,
                'status' => $response->status(),
                'response' => Str::limit((string) $response->body(), 1000),
            ]);

            return;
        }

        $json = $response->json();
        $loginUrl = is_array($json) ? ($json['login_url'] ?? $json['academy_url'] ?? null) : null;
        $tenantSlugResp = is_array($json) ? ($json['tenant_slug'] ?? $json['tenant']['slug'] ?? null) : null;

        if ((! is_string($loginUrl) || $loginUrl === '') && is_string($tenantSlugResp) && $tenantSlugResp !== '') {
            $scheme = (string) config('services.vetsaas.tenant_scheme', 'https');
            $domain = (string) config('services.vetsaas.tenant_domain', 'vetsaas.orvae.pe');
            $loginUrl = sprintf('%s://%s.%s/login', $scheme, $tenantSlugResp, $domain);
        }

        if ($loginUrl || $tenantSlugResp) {
            $this->persistAccess($order, $loginUrl, $tenantSlugResp, $temporaryPassword);
            $this->accessNotifier->notify(
                $order,
                'vetsaas',
                is_string($loginUrl) ? $loginUrl : '',
                is_string($tenantSlugResp) ? $tenantSlugResp : null,
                (string) $user->email,
                $temporaryPassword,
            );
        }

        Log::info('vetsaas.provision_success', [
            'order_id' => $order->id,
            'login_url' => $loginUrl,
            'tenant_slug' => $tenantSlugResp,
        ]);
    }

    private function resolvePlanSlug(CatalogSku $sku): ?string
    {
        foreach (SaasCatalogSku::planSlugCandidates($sku) as $candidate) {
            if (! is_string($candidate)) {
                continue;
            }

            $normalized = SaasCatalogSku::normalizePlanSlug($sku, $candidate);
            if ($normalized !== null) {
                return $normalized;
            }
        }

        return null;
    }

    private function resolveTenantName(User $user): string
    {
        $fullName = trim((string) ($user->name ?? '').' '.(string) ($user->lastname ?? ''));

        if ($fullName !== '') {
            return 'Clínica '.$fullName;
        }

        return 'Clínica '.(string) $user->email;
    }

    private function resolveTenantSlug(string $tenantName, string $email): string
    {
        $fromName = Str::slug($tenantName);
        if ($fromName !== '') {
            return Str::limit($fromName, 60, '');
        }

        $localPart = Str::before($email, '@');
        $slug = Str::slug($localPart);

        return $slug !== '' ? Str::limit($slug, 60, '') : 'clinica-'.Str::lower(Str::random(8));
    }

    private function resolvePaymentMethod(Order $order): string
    {
        $gateway = $order->payments()->latest('paid_at')->value('gateway');

        return is_string($gateway) && $gateway !== '' ? $gateway : 'manual';
    }

    public function renew(
        Order $order,
        CatalogSku $sku,
        Subscription $existingSubscription,
        ?\DateTimeInterface $periodEnd = null,
    ): void {
        if (! SaasCatalogSku::isVetsaas($sku) || ! $this->isEnabled()) {
            return;
        }

        $url = $this->resolveRenewUrl();
        $secret = (string) config('services.vetsaas.hmac_secret');

        if ($url === '' || $secret === '') {
            $this->noteSnapshot($order, ['vetsaas_renew_skipped' => 'falta_url_o_hmac_secret']);

            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            return;
        }

        $tenantSlug = SaasSubscriptionLookup::tenantSlugFrom($existingSubscription);
        if ($tenantSlug === null) {
            $this->noteSnapshot($order, ['vetsaas_renew_skipped' => 'sin_tenant_slug']);

            return;
        }

        $planSlug = $this->resolvePlanSlug($sku);
        if ($planSlug === null) {
            return;
        }

        $periodStart = $existingSubscription->current_period_end && $existingSubscription->current_period_end->isFuture()
            ? $existingSubscription->current_period_end
            : now();

        $periodEndAt = $periodEnd instanceof \DateTimeInterface
            ? Carbon::parse($periodEnd)
            : $this->periodEndFromInterval($periodStart, $sku);

        $payload = [
            'external_order_id' => (string) $order->id,
            'order_number' => (string) $order->order_number,
            'tenant_slug' => $tenantSlug,
            'plan_slug' => $planSlug,
            'ciclo' => $this->resolveCiclo($sku),
            'period_start' => $periodStart->toIso8601String(),
            'period_end' => $periodEndAt->toIso8601String(),
            'precio_pactado' => (float) $order->grand_total,
            'payment' => [
                'monto' => (float) $order->grand_total,
                'moneda' => (string) $order->currency,
                'pasarela' => $this->resolvePaymentMethod($order),
                'transaction_id' => $order->payments()->latest('paid_at')->value('gateway_payment_id'),
                'pagado_at' => optional($order->placed_at ?? now())->toIso8601String(),
            ],
        ];

        Log::info('vetsaas.renew_request', [
            'order_id' => $order->id,
            'tenant_slug' => $tenantSlug,
            'plan_slug' => $planSlug,
        ]);

        $response = OrvaeSignedHttpClient::post(
            $url,
            $payload,
            $secret,
            'renew-order:'.$order->id,
            timeoutSeconds: 30,
        );

        if (! $response->successful()) {
            $this->noteSnapshot($order, [
                'vetsaas_renew_error' => [
                    'http_status' => $response->status(),
                    'body' => Str::limit((string) $response->body(), 2000),
                    'at' => now()->toIso8601String(),
                ],
            ]);
            Log::warning('vetsaas.renew_failed', [
                'order_id' => $order->id,
                'status' => $response->status(),
            ]);

            return;
        }

        $json = $response->json();
        $loginUrl = is_array($json) ? ($json['login_url'] ?? null) : null;
        $tenantSlugResp = is_array($json) ? ($json['tenant_slug'] ?? $tenantSlug) : $tenantSlug;

        if ((! is_string($loginUrl) || $loginUrl === '') && is_string($tenantSlugResp) && $tenantSlugResp !== '') {
            $scheme = (string) config('services.vetsaas.tenant_scheme', 'https');
            $domain = (string) config('services.vetsaas.tenant_domain', 'vetsaas.orvae.pe');
            $loginUrl = sprintf('%s://%s.%s/login', $scheme, $tenantSlugResp, $domain);
        }

        $this->persistRenewalAccess($order, $existingSubscription, $loginUrl, $tenantSlugResp);

        $this->renewalNotifier->notify(
            $order,
            'vetsaas',
            is_string($loginUrl) ? $loginUrl : '',
            is_string($tenantSlugResp) ? $tenantSlugResp : null,
            (string) $user->email,
            $periodEndAt->format('d/m/Y H:i'),
        );

        Log::info('vetsaas.renew_success', [
            'order_id' => $order->id,
            'tenant_slug' => $tenantSlugResp,
        ]);
    }

    private function resolveRenewUrl(): string
    {
        $explicit = trim((string) config('services.vetsaas.renew_url', ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $provision = trim((string) config('services.vetsaas.provision_url', ''));
        if ($provision === '') {
            return '';
        }

        if (str_ends_with($provision, '/provision')) {
            return substr($provision, 0, -strlen('/provision')).'/renew';
        }

        return rtrim($provision, '/').'/renew';
    }

    private function resolveCiclo(CatalogSku $sku): string
    {
        $interval = strtolower(trim((string) ($sku->billing_interval ?? '')));

        return in_array($interval, ['year', 'yearly', 'annual', 'anual'], true) ? 'anual' : 'mensual';
    }

    private function periodEndFromInterval(\DateTimeInterface $start, CatalogSku $sku): Carbon
    {
        $base = Carbon::parse($start);

        return $this->resolveCiclo($sku) === 'anual'
            ? $base->copy()->addYear()
            : $base->copy()->addMonth();
    }

    private function persistRenewalAccess(
        Order $order,
        Subscription $subscription,
        mixed $loginUrl,
        mixed $tenantSlug,
    ): void {
        $url = is_string($loginUrl) ? $loginUrl : null;
        $slug = is_string($tenantSlug) ? $tenantSlug : null;

        $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
        $metadata['vetsaas_login_url'] = $url;
        $metadata['vetsaas_tenant_slug'] = $slug;
        $metadata['last_renewal_order_id'] = $order->id;
        $metadata['last_renewal_at'] = now()->toIso8601String();
        $subscription->forceFill(['metadata' => $metadata])->save();

        $snapshot = is_array($order->billing_snapshot) ? $order->billing_snapshot : [];
        unset($snapshot['vetsaas_renew_error'], $snapshot['vetsaas_renew_skipped']);
        $snapshot['vetsaas_login_url'] = $url;
        $snapshot['vetsaas_tenant_slug'] = $slug;
        $snapshot['vetsaas_renewed_at'] = now()->toIso8601String();
        $order->forceFill(['billing_snapshot' => $snapshot])->save();
    }

    private function isEnabled(): bool
    {
        return (bool) config('services.vetsaas.enabled', false);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function noteSnapshot(Order $order, array $data): void
    {
        $snapshot = is_array($order->billing_snapshot) ? $order->billing_snapshot : [];
        $order->forceFill(['billing_snapshot' => array_merge($snapshot, $data)])->save();
    }

    private function persistAccess(Order $order, mixed $loginUrl, mixed $tenantSlug, string $temporaryPassword): void
    {
        $subscription = Subscription::query()
            ->where('user_id', $order->user_id)
            ->where('metadata->checkout_order_id', $order->id)
            ->latest('created_at')
            ->first();

        $url = is_string($loginUrl) ? $loginUrl : null;
        $slug = is_string($tenantSlug) ? $tenantSlug : null;

        if ($subscription instanceof Subscription) {
            $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
            $metadata['vetsaas_login_url'] = $url;
            $metadata['vetsaas_tenant_slug'] = $slug;
            $metadata['vetsaas_initial_password_sent'] = true;
            $subscription->forceFill(['metadata' => $metadata])->save();
        }

        $snapshot = is_array($order->billing_snapshot) ? $order->billing_snapshot : [];
        unset($snapshot['vetsaas_provision_error'], $snapshot['vetsaas_provision_skipped']);
        $snapshot['vetsaas_login_url'] = $url;
        $snapshot['vetsaas_tenant_slug'] = $slug;
        $snapshot['vetsaas_login_email'] = $order->user?->email;
        $snapshot['vetsaas_temporary_password'] = $temporaryPassword;
        $order->forceFill(['billing_snapshot' => $snapshot])->save();
    }
}
