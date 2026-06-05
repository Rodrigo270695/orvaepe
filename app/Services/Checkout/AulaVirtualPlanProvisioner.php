<?php

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

class AulaVirtualPlanProvisioner
{
    public function __construct(
        private readonly SaasProvisionAccessNotifier $accessNotifier,
        private readonly SaasRenewalAccessNotifier $renewalNotifier,
    ) {}

    public function provision(Order $order, CatalogSku $sku, ?\DateTimeInterface $periodEnd = null): void
    {
        if (! $this->isEnabled() || ! SaasCatalogSku::isAulaVirtual($sku)) {
            return;
        }

        $url = trim((string) config('services.aulavirtual.provision_url'));
        $secret = (string) config('services.aulavirtual.hmac_secret');

        if ($url === '' || $secret === '') {
            Log::warning('aulavirtual.provision_skipped_missing_config', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);

            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            Log::warning('aulavirtual.provision_skipped_missing_user', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);

            return;
        }

        $existingSubscription = SaasSubscriptionLookup::findAulaVirtualRenewable($user->id, $sku);
        if ($existingSubscription instanceof Subscription) {
            $this->renew($order, $sku, $existingSubscription, $periodEnd);

            return;
        }

        $planSlug = $this->resolvePlanSlug($sku);
        if ($planSlug === null) {
            Log::info('aulavirtual.provision_skipped_unmapped_plan', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'sku_id' => $sku->id,
                'sku_code' => $sku->code,
            ]);

            return;
        }

        $tenantName = $this->resolveTenantName($user);
        $tenantSlug = $this->resolveTenantSlug($tenantName, $user->email);

        $payload = [
            'external_order_id' => (string) $order->id,
            'order_number' => (string) $order->order_number,
            'customer' => [
                'external_user_id' => (string) $user->id,
                'email' => (string) $user->email,
                'first_name' => (string) ($user->name ?? ''),
                'last_name' => (string) ($user->lastname ?? ''),
                'phone' => (string) ($user->phone ?? ''),
                'document_number' => (string) ($user->document_number ?? ''),
            ],
            'tenant' => [
                'name' => $tenantName,
                'slug' => $tenantSlug,
            ],
            'subscription' => [
                'plan_slug' => $planSlug,
                'target_role' => $this->resolveTargetRole($sku, $planSlug),
                'status' => 'active',
                'amount_paid' => (string) $order->grand_total,
                'currency' => (string) $order->currency,
                'payment_method' => $this->resolvePaymentMethod($order),
                'payment_reference' => $order->payments()->latest('paid_at')->value('gateway_payment_id'),
                'started_at' => optional($order->placed_at ?? now())->toIso8601String(),
                'expires_at' => $periodEnd?->format(\DateTimeInterface::ATOM),
            ],
        ];

        $response = OrvaeSignedHttpClient::post(
            $url,
            $payload,
            $secret,
            'order:'.$order->id,
            timeoutSeconds: 15,
            retryDelayMs: 300,
        );

        if (! $response->successful()) {
            Log::warning('aulavirtual.provision_failed', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'plan_slug' => $planSlug,
                'status' => $response->status(),
                'response' => Str::limit((string) $response->body(), 1000),
            ]);

            return;
        }

        $body = $response->json();
        $academyUrl = is_array($body) ? ($body['academy_url'] ?? null) : null;
        $tenantSlugResp = is_array($body) ? ($body['tenant_slug'] ?? null) : null;

        if ($academyUrl || $tenantSlugResp) {
            $this->persistAcademyAccess($order, null, $academyUrl, $tenantSlugResp);
            $this->accessNotifier->notify(
                $order,
                'aulavirtual',
                is_string($academyUrl) ? $academyUrl : '',
                is_string($tenantSlugResp) ? $tenantSlugResp : null,
                (string) $user->email,
                null,
            );
        }

        Log::info('aulavirtual.provision_success', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'plan_slug' => $planSlug,
            'academy_url' => $academyUrl,
            'tenant_slug' => $tenantSlugResp,
        ]);
    }

    public function renew(
        Order $order,
        CatalogSku $sku,
        Subscription $existingSubscription,
        ?\DateTimeInterface $periodEnd = null,
    ): void {
        if (! SaasCatalogSku::isAulaVirtual($sku) || ! $this->isEnabled()) {
            return;
        }

        $url = $this->resolveRenewUrl();
        $secret = (string) config('services.aulavirtual.hmac_secret');

        if ($url === '' || $secret === '') {
            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            return;
        }

        $tenantSlug = SaasSubscriptionLookup::aulaTenantSlugFrom($existingSubscription);
        if ($tenantSlug === null) {
            $metadata = is_array($existingSubscription->metadata) ? $existingSubscription->metadata : [];
            $academyUrl = (string) ($metadata['aula_virtual_academy_url'] ?? '');
            if ($academyUrl !== '' && preg_match('#https?://([a-z0-9\-]+)\.#', $academyUrl, $m) === 1) {
                $tenantSlug = $m[1];
            }
        }

        if ($tenantSlug === null) {
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
            'tenant' => [
                'slug' => $tenantSlug,
            ],
            'subscription' => [
                'plan_slug' => $planSlug,
                'billing_interval' => (string) ($sku->billing_interval ?? 'monthly'),
                'amount_paid' => (string) $order->grand_total,
                'currency' => (string) $order->currency,
                'payment_method' => $this->resolvePaymentMethod($order),
                'payment_reference' => $order->payments()->latest('paid_at')->value('gateway_payment_id'),
                'started_at' => $periodStart->toIso8601String(),
                'expires_at' => $periodEndAt->format(\DateTimeInterface::ATOM),
            ],
        ];

        $response = OrvaeSignedHttpClient::post(
            $url,
            $payload,
            $secret,
            'renew-order:'.$order->id,
            timeoutSeconds: 15,
            retryDelayMs: 300,
        );

        if (! $response->successful()) {
            Log::warning('aulavirtual.renew_failed', [
                'order_id' => $order->id,
                'tenant_slug' => $tenantSlug,
                'status' => $response->status(),
            ]);

            return;
        }

        $body = $response->json();
        $academyUrl = is_array($body) ? ($body['academy_url'] ?? null) : null;
        $tenantSlugResp = is_array($body) ? ($body['tenant_slug'] ?? $tenantSlug) : $tenantSlug;

        $this->persistAcademyAccess($order, $existingSubscription, $academyUrl, $tenantSlugResp);

        $this->renewalNotifier->notify(
            $order,
            'aulavirtual',
            is_string($academyUrl) ? $academyUrl : (string) ($existingSubscription->metadata['aula_virtual_academy_url'] ?? ''),
            is_string($tenantSlugResp) ? $tenantSlugResp : null,
            (string) $user->email,
            $periodEndAt->format('d/m/Y H:i'),
        );

        Log::info('aulavirtual.renew_success', [
            'order_id' => $order->id,
            'tenant_slug' => $tenantSlugResp,
        ]);
    }

    private function resolveRenewUrl(): string
    {
        $explicit = trim((string) config('services.aulavirtual.renew_url', ''));
        if ($explicit !== '') {
            return $explicit;
        }

        $provision = trim((string) config('services.aulavirtual.provision_url', ''));
        if ($provision === '') {
            return '';
        }

        if (str_ends_with($provision, '/provision')) {
            return substr($provision, 0, -strlen('/provision')).'/renew';
        }

        return rtrim($provision, '/').'/renew';
    }

    private function periodEndFromInterval(\DateTimeInterface $start, CatalogSku $sku): Carbon
    {
        $base = Carbon::parse($start);
        $interval = strtolower(trim((string) ($sku->billing_interval ?? '')));

        return in_array($interval, ['year', 'yearly', 'annual', 'anual'], true)
            ? $base->copy()->addYear()
            : $base->copy()->addMonth();
    }

    private function resolvePlanSlug(CatalogSku $sku): ?string
    {
        $metadata = is_array($sku->metadata) ? $sku->metadata : [];
        $candidates = [
            $metadata['saas_plan_slug'] ?? null,
            $metadata['plan_slug'] ?? null,
            $metadata['aula_virtual_plan'] ?? null,
            $sku->code ?? null,
            $sku->name ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (! is_string($candidate)) {
                continue;
            }

            $normalized = strtolower(trim($candidate));
            if ($normalized === '') {
                continue;
            }

            if (str_contains($normalized, 'starter')) {
                return 'starter';
            }
            if (str_contains($normalized, 'business')) {
                return 'business';
            }
            if (preg_match('/\bpro\b/', $normalized) === 1 || str_contains($normalized, ' pro')) {
                return 'pro';
            }
            if (str_contains($normalized, 'free') || str_contains($normalized, 'gratis')) {
                return 'free';
            }
        }

        return null;
    }

    private function resolveTenantName(User $user): string
    {
        $fullName = trim((string) ($user->name ?? '').' '.(string) ($user->lastname ?? ''));

        if ($fullName !== '') {
            return 'Academia '.$fullName;
        }

        return 'Academia '.(string) $user->email;
    }

    private function resolveTenantSlug(string $tenantName, string $email): string
    {
        $fromName = Str::slug($tenantName);
        if ($fromName !== '') {
            return Str::limit($fromName, 100, '');
        }

        $localPart = Str::before($email, '@');
        $slug = Str::slug($localPart);

        return $slug !== '' ? Str::limit($slug, 100, '') : 'academia-'.Str::lower(Str::random(8));
    }

    private function resolveTargetRole(CatalogSku $sku, string $planSlug): string
    {
        $metadata = is_array($sku->metadata) ? $sku->metadata : [];
        $candidate = $metadata['saas_target_role'] ?? $metadata['target_role'] ?? null;

        if (is_string($candidate)) {
            $normalized = strtolower(trim($candidate));
            if (in_array($normalized, ['tenant_owner', 'instructor', 'student'], true)) {
                return $normalized;
            }
        }

        return match ($planSlug) {
            'free', 'starter', 'pro', 'business' => 'tenant_owner',
            default => 'tenant_owner',
        };
    }

    private function resolvePaymentMethod(Order $order): string
    {
        $gateway = $order->payments()->latest('paid_at')->value('gateway');

        return is_string($gateway) && $gateway !== '' ? $gateway : 'manual';
    }

    private function isEnabled(): bool
    {
        return (bool) config('services.aulavirtual.enabled', false);
    }

    private function persistAcademyAccess(
        Order $order,
        ?Subscription $subscription,
        mixed $academyUrl,
        mixed $tenantSlug,
    ): void {
        if ($subscription === null) {
            $subscription = Subscription::query()
                ->where('user_id', $order->user_id)
                ->where('metadata->checkout_order_id', $order->id)
                ->latest('created_at')
                ->first();
        }

        $url = is_string($academyUrl) ? $academyUrl : null;
        $slug = is_string($tenantSlug) ? $tenantSlug : null;

        if ($subscription instanceof Subscription) {
            $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
            $metadata['aula_virtual_academy_url'] = $url;
            $metadata['aula_virtual_tenant_slug'] = $slug;
            $metadata['last_renewal_order_id'] = $order->id;
            $metadata['last_renewal_at'] = now()->toIso8601String();
            $subscription->forceFill(['metadata' => $metadata])->save();
        }

        $snapshot = is_array($order->billing_snapshot) ? $order->billing_snapshot : [];
        $snapshot['aula_virtual_academy_url'] = $url;
        $snapshot['aula_virtual_tenant_slug'] = $slug;
        $snapshot['aula_virtual_renewed_at'] = now()->toIso8601String();
        $order->forceFill(['billing_snapshot' => $snapshot])->save();
    }
}
