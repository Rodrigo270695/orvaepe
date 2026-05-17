<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Notifications\NotificationSender;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Provisión de clínica VetSaaS tras compra de plan veterinario en Orvae.
 */
class VetSaaSPlanProvisioner
{
    public function __construct(
        private readonly NotificationSender $notificationSender,
    ) {}

    public function provision(Order $order, CatalogSku $sku, ?\DateTimeInterface $periodEnd = null): void
    {
        if (! $this->isEnabled() || ! $this->isVetsaasSku($sku)) {
            return;
        }

        $url = trim((string) config('services.vetsaas.provision_url'));
        $secret = (string) config('services.vetsaas.hmac_secret');

        if ($url === '' || $secret === '') {
            Log::warning('vetsaas.provision_skipped_missing_config', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);

            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            return;
        }

        $planSlug = $this->resolvePlanSlug($sku);
        if ($planSlug === null) {
            Log::info('vetsaas.provision_skipped_unmapped_plan', [
                'order_id' => $order->id,
                'sku_code' => $sku->code,
            ]);

            return;
        }

        $tenantName = $this->resolveTenantName($user);
        $tenantSlug = $this->resolveTenantSlug($tenantName, $user->email);
        $timestamp = now()->timestamp;

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
            'admin_password' => Str::password(16),
            'canal_adquisicion' => 'orvae',
            'payment' => [
                'monto' => (float) $order->grand_total,
                'moneda' => (string) $order->currency,
                'pasarela' => $this->resolvePaymentMethod($order),
                'transaction_id' => $order->payments()->latest('paid_at')->value('gateway_payment_id'),
                'pagado_at' => optional($order->placed_at ?? now())->toIso8601String(),
            ],
        ];

        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (! is_string($body)) {
            return;
        }

        $signature = hash_hmac('sha256', $timestamp.'.'.$body, $secret);

        $response = Http::timeout(30)
            ->retry(2, 500)
            ->withHeaders([
                'X-Orvae-Timestamp' => (string) $timestamp,
                'X-Orvae-Signature' => $signature,
                'X-Idempotency-Key' => 'order:'.$order->id,
            ])
            ->asJson()
            ->post($url, $payload);

        if (! $response->successful()) {
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

        if ($loginUrl || $tenantSlugResp) {
            $this->persistAccess($order, $loginUrl, $tenantSlugResp);
            $this->notifyAccess($order, $loginUrl, $tenantSlugResp);
        }

        Log::info('vetsaas.provision_success', [
            'order_id' => $order->id,
            'login_url' => $loginUrl,
            'tenant_slug' => $tenantSlugResp,
        ]);
    }

    private function isVetsaasSku(CatalogSku $sku): bool
    {
        $metadata = is_array($sku->metadata) ? $sku->metadata : [];
        $product = strtolower(trim((string) ($metadata['saas_product'] ?? '')));

        if (in_array($product, ['vetsaas', 'vet-saas', 'veterinaria'], true)) {
            return true;
        }

        $saleModel = strtolower(trim((string) $sku->sale_model));

        return $saleModel === 'saas_subscription'
            && str_contains(strtolower((string) ($sku->code ?? '')), 'vet');
    }

    private function resolvePlanSlug(CatalogSku $sku): ?string
    {
        $metadata = is_array($sku->metadata) ? $sku->metadata : [];
        $candidates = [
            $metadata['vetsaas_plan_slug'] ?? null,
            $metadata['saas_plan_slug'] ?? null,
            $metadata['plan_slug'] ?? null,
            $sku->code ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (! is_string($candidate)) {
                continue;
            }

            $normalized = strtolower(trim($candidate));
            if ($normalized !== '') {
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

    private function isEnabled(): bool
    {
        return (bool) config('services.vetsaas.enabled', false);
    }

    private function persistAccess(Order $order, mixed $loginUrl, mixed $tenantSlug): void
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
            $subscription->forceFill(['metadata' => $metadata])->save();
        }

        $snapshot = is_array($order->billing_snapshot) ? $order->billing_snapshot : [];
        $snapshot['vetsaas_login_url'] = $url;
        $snapshot['vetsaas_tenant_slug'] = $slug;
        $order->forceFill(['billing_snapshot' => $snapshot])->save();
    }

    private function notifyAccess(Order $order, mixed $loginUrl, mixed $tenantSlug): void
    {
        $loginUrl = is_string($loginUrl) ? trim($loginUrl) : '';
        if ($loginUrl === '') {
            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            return;
        }

        $subject = 'Tu clínica VetSaaS está lista';
        $message = "✅ *VetSaaS activado*\n"
            .'📦 Pedido: '.$order->order_number."\n"
            .'🔗 Acceso: '.$loginUrl."\n"
            .'👤 Usuario: '.$user->email."\n"
            ."🔐 Debes definir tu contraseña en el primer ingreso (enlace «Olvidé mi contraseña» si aplica).\n";

        Notification::query()->create([
            'user_id' => $user->id,
            'type' => 'vetsaas.access.customer',
            'channel' => 'in_app',
            'subject' => $subject,
            'message' => $message,
            'data' => [
                'order_id' => $order->id,
                'login_url' => $loginUrl,
                'tenant_slug' => is_string($tenantSlug) ? $tenantSlug : null,
            ],
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $emailNotification = Notification::query()->create([
            'user_id' => $user->id,
            'type' => 'vetsaas.access.customer',
            'channel' => 'email',
            'subject' => $subject,
            'message' => $message,
            'data' => [
                'email_to' => $user->email,
                'order_id' => $order->id,
                'login_url' => $loginUrl,
            ],
            'status' => 'pending',
        ]);

        $this->notificationSender->send($emailNotification);
    }
}
