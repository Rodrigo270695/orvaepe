<?php

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

class AulaVirtualPlanProvisioner
{
    public function __construct(
        private readonly NotificationSender $notificationSender,
    ) {}

    public function provision(Order $order, CatalogSku $sku, ?\DateTimeInterface $periodEnd = null): void
    {
        if (! $this->isEnabled()) {
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
        $timestamp = now()->timestamp;

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
                'status' => 'active',
                'amount_paid' => (string) $order->grand_total,
                'currency' => (string) $order->currency,
                'payment_method' => $this->resolvePaymentMethod($order),
                'payment_reference' => $order->payments()->latest('paid_at')->value('gateway_payment_id'),
                'started_at' => optional($order->placed_at ?? now())->toIso8601String(),
                'expires_at' => $periodEnd?->format(\DateTimeInterface::ATOM),
            ],
        ];

        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (! is_string($body)) {
            Log::warning('aulavirtual.provision_skipped_json_error', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);

            return;
        }

        $signature = hash_hmac('sha256', $timestamp.'.'.$body, $secret);

        $response = Http::timeout(15)
            ->retry(2, 300)
            ->withHeaders([
                'X-Orvae-Timestamp' => (string) $timestamp,
                'X-Orvae-Signature' => $signature,
                'X-Idempotency-Key' => 'order:'.$order->id,
            ])
            ->asJson()
            ->post($url, $payload);

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
        $tenantSlug = is_array($body) ? ($body['tenant_slug'] ?? null) : null;

        if ($academyUrl || $tenantSlug) {
            $this->persistAcademyAccess($order, $academyUrl, $tenantSlug);
            $this->notifyAcademyAccess($order, $academyUrl, $tenantSlug);
        }

        Log::info('aulavirtual.provision_success', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'plan_slug' => $planSlug,
            'academy_url' => $academyUrl,
            'tenant_slug' => $tenantSlug,
        ]);
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

    private function resolvePaymentMethod(Order $order): string
    {
        $gateway = $order->payments()->latest('paid_at')->value('gateway');

        return is_string($gateway) && $gateway !== '' ? $gateway : 'manual';
    }

    private function isEnabled(): bool
    {
        return (bool) config('services.aulavirtual.enabled', false);
    }

    private function persistAcademyAccess(Order $order, mixed $academyUrl, mixed $tenantSlug): void
    {
        $subscription = Subscription::query()
            ->where('user_id', $order->user_id)
            ->where('metadata->checkout_order_id', $order->id)
            ->latest('created_at')
            ->first();

        if ($subscription instanceof Subscription) {
            $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];
            $metadata['aula_virtual_academy_url'] = is_string($academyUrl) ? $academyUrl : null;
            $metadata['aula_virtual_tenant_slug'] = is_string($tenantSlug) ? $tenantSlug : null;
            $subscription->forceFill(['metadata' => $metadata])->save();
        }
    }

    private function notifyAcademyAccess(Order $order, mixed $academyUrl, mixed $tenantSlug): void
    {
        $academyUrl = is_string($academyUrl) ? trim($academyUrl) : '';
        if ($academyUrl === '') {
            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            return;
        }

        $subject = 'Tu acceso a Aula Virtual está listo';
        $message = "✅ *Aula Virtual activada*\n"
            .'📦 Pedido: '.$order->order_number."\n"
            .'🔗 URL de acceso: '.$academyUrl."\n"
            .'👤 Usuario: '.$user->email."\n"
            ."🔐 Contraseña: usa «Olvidaste tu contraseña» para crearla.\n\n"
            .'Si no recibiste correo, entra a '.$academyUrl.'/forgot-password';

        Notification::query()->create([
            'user_id' => $user->id,
            'type' => 'aulavirtual.access.customer',
            'channel' => 'in_app',
            'subject' => $subject,
            'message' => $message,
            'data' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'academy_url' => $academyUrl,
                'tenant_slug' => is_string($tenantSlug) ? $tenantSlug : null,
            ],
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $emailNotification = Notification::query()->create([
            'user_id' => $user->id,
            'type' => 'aulavirtual.access.customer',
            'channel' => 'email',
            'subject' => $subject,
            'message' => $message,
            'data' => [
                'email_to' => $user->email,
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'academy_url' => $academyUrl,
                'tenant_slug' => is_string($tenantSlug) ? $tenantSlug : null,
            ],
            'status' => 'pending',
        ]);

        $this->notificationSender->send($emailNotification);
    }
}
