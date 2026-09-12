<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use App\Services\Notifications\DeferredNotificationSender;
use App\Support\Checkout\CheckoutCustomerPhone;
use App\Support\Checkout\SaasCatalogSku;
use App\Support\Checkout\WhatsAppRecipientDeduper;
use App\Support\WhatsAppPhoneNormalizer;
use Illuminate\Support\Facades\Log;

/**
 * WhatsApp, correo e in-app tras provisión SaaS (VetSaaS / Aula Virtual).
 * Un solo WhatsApp por número (cliente gana; admin se omite si es el mismo celular).
 */
final class SaasProvisionAccessNotifier
{
    public function __construct(
        private readonly DeferredNotificationSender $notificationSender,
    ) {}

    public function notify(
        Order $order,
        string $productKey,
        string $loginUrl,
        ?string $tenantSlug,
        string $loginEmail,
        ?string $temporaryPassword,
        ?WhatsAppRecipientDeduper $deduper = null,
    ): void {
        $loginUrl = trim($loginUrl);
        if ($loginUrl === '') {
            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            return;
        }

        $deduper ??= WhatsAppRecipientDeduper::forOrder($order);

        [$subject, $message] = $this->buildCustomerCopy(
            $productKey,
            $order,
            $loginUrl,
            $tenantSlug,
            $loginEmail,
            $temporaryPassword,
        );

        $data = $this->buildData($order, $loginUrl, $tenantSlug, $loginEmail, $temporaryPassword);

        Notification::query()->create([
            'user_id' => $user->id,
            'type' => $productKey.'.access.customer',
            'channel' => 'in_app',
            'subject' => $subject,
            'message' => $message,
            'data' => $data,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $customerTo = $deduper->resolveFromUser($user, $order);
        [$to, $skipWa] = $deduper->claim($customerTo);

        if ($skipWa || $to === null) {
            Log::warning('saas.access.customer_whatsapp_skipped', [
                'order_id' => $order->id,
                'product' => $productKey,
                'user_id' => $user->id,
                'phone_raw' => CheckoutCustomerPhone::raw($user, $order),
            ]);
        }

        if (! $skipWa && $to !== null) {
            $whatsappNotification = Notification::query()->create([
                'user_id' => $user->id,
                'type' => $productKey.'.access.customer',
                'channel' => 'whatsapp',
                'subject' => '',
                'message' => $message,
                'data' => array_merge($data, [
                    'phone_snapshot' => CheckoutCustomerPhone::raw($user, $order),
                    'whatsapp_to' => $to,
                    'customer_email' => $loginEmail,
                ]),
                'status' => 'pending',
            ]);

            $this->notificationSender->send($whatsappNotification);
        }

        $customerEmail = trim($loginEmail);
        if ($customerEmail !== '' && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
            $emailNotification = Notification::query()->create([
                'user_id' => $user->id,
                'type' => $productKey.'.access.customer',
                'channel' => 'email',
                'subject' => $subject,
                'message' => $message,
                'data' => array_merge($data, [
                    'email_to' => $customerEmail,
                    'customer_email' => $customerEmail,
                ]),
                'status' => 'pending',
            ]);

            $this->notificationSender->send($emailNotification);
        }

        $this->notifyAdmin(
            $order,
            $productKey,
            $user,
            $loginUrl,
            $tenantSlug,
            $loginEmail,
            $temporaryPassword,
            $deduper,
            $to !== null && ! $skipWa,
        );
    }

    private function notifyAdmin(
        Order $order,
        string $productKey,
        User $customer,
        string $loginUrl,
        ?string $tenantSlug,
        string $loginEmail,
        ?string $temporaryPassword,
        WhatsAppRecipientDeduper $deduper,
        bool $customerWhatsAppSent,
    ): void {
        $productLabel = \App\Support\Checkout\SaasCatalogSku::productLabel($productKey);
        $subject = "Acceso {$productLabel} provisionado – {$order->order_number}";

        $subdomainLine = $tenantSlug !== null && $tenantSlug !== ''
            ? '🌐 Subdominio: '.$tenantSlug."\n"
            : '';

        $customerPhone = CheckoutCustomerPhone::raw($customer, $order) ?? 'sin celular';
        $customerWaLine = $customerWhatsAppSent
            ? "✅ Acceso enviado por WhatsApp al cliente ({$customerPhone}).\n"
            : "⚠️ No se envió WhatsApp al cliente ({$customerPhone}). Revisá el celular del registro.\n";

        $body = "🔐 *Acceso {$productLabel} provisionado*\n"
            .'📦 Pedido: '.$order->order_number."\n"
            .'👤 Cliente: '.$customer->email."\n"
            .$subdomainLine
            .$customerWaLine
            .'👤 Usuario login: '.$loginEmail."\n"
            ."El enlace de bienvenida se envió al cliente (correo"
            .($customerWhatsAppSent ? ' y WhatsApp' : '').").";

        $data = $this->buildData($order, $loginUrl, $tenantSlug, $loginEmail, null);
        unset($data['temporary_password'], $data['login_url']);
        $data['customer_email'] = (string) $customer->email;
        $data['customer_whatsapp_sent'] = $customerWhatsAppSent;

        $adminUsers = User::query()
            ->role('superadmin')
            ->with('profile:id,user_id,phone')
            ->get(['id', 'phone', 'email']);

        foreach ($adminUsers as $admin) {
            Notification::query()->create([
                'user_id' => $admin->id,
                'type' => $productKey.'.access.admin',
                'channel' => 'in_app',
                'subject' => $subject,
                'message' => $body,
                'data' => $data,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $adminTo = WhatsAppPhoneNormalizer::toUltraMsgTo((string) $admin->phone)
                ?: WhatsAppPhoneNormalizer::toUltraMsgTo((string) ($admin->profile?->phone ?? ''))
                ?: WhatsAppPhoneNormalizer::toUltraMsgTo((string) config('openwa.admin_notification_number'));

            [$to, $skipWa] = $deduper->claim($adminTo);

            if (! $skipWa && $to !== null) {
                $whatsappNotification = Notification::query()->create([
                    'user_id' => $admin->id,
                    'type' => $productKey.'.access.admin',
                    'channel' => 'whatsapp',
                    'subject' => '',
                    'message' => $body,
                    'data' => array_merge($data, [
                        'whatsapp_to' => $to,
                    ]),
                    'status' => 'pending',
                ]);

                $this->notificationSender->send($whatsappNotification);
            }

            $adminEmail = trim((string) $admin->email);
            if ($adminEmail !== '' && filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
                $emailNotification = Notification::query()->create([
                    'user_id' => $admin->id,
                    'type' => $productKey.'.access.admin',
                    'channel' => 'email',
                    'subject' => $subject,
                    'message' => $body,
                    'data' => array_merge($data, [
                        'email_to' => $adminEmail,
                    ]),
                    'status' => 'pending',
                ]);

                $this->notificationSender->send($emailNotification);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function buildData(
        Order $order,
        string $loginUrl,
        ?string $tenantSlug,
        string $loginEmail,
        ?string $temporaryPassword,
    ): array {
        $data = [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'login_url' => $loginUrl,
            'tenant_slug' => $tenantSlug,
            'login_email' => $loginEmail,
        ];

        if ($temporaryPassword !== null && $temporaryPassword !== '') {
            $data['temporary_password'] = $temporaryPassword;
        }

        return $data;
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function buildCustomerCopy(
        string $productKey,
        Order $order,
        string $loginUrl,
        ?string $tenantSlug,
        string $loginEmail,
        ?string $temporaryPassword,
    ): array {
        $isVetsaas = $productKey === 'vetsaas';
        $isSendsaas = $productKey === 'sendsaas';
        $productLabel = \App\Support\Checkout\SaasCatalogSku::productLabel($productKey);
        $subject = match ($productKey) {
            'vetsaas' => 'Tu clínica VetSaaS está lista',
            'sendsaas' => 'Tu empresa SendSaaS está lista',
            default => 'Tu acceso a Aula Virtual está listo',
        };

        $subdomainLine = $tenantSlug !== null && $tenantSlug !== ''
            ? '🌐 Subdominio: '.$tenantSlug."\n"
            : '';

        $isBootstrap = ($isVetsaas || $isSendsaas) && str_contains($loginUrl, '/auth/bienvenida/');

        $credentialsBlock = '';
        if ($isBootstrap) {
            $credentialsBlock = "👤 Usuario: {$loginEmail}\n"
                ."🔐 Abre el enlace: entrarás directo a crear tu contraseña.\n\n";
        } elseif ($temporaryPassword !== null && $temporaryPassword !== '') {
            $credentialsBlock = "👤 Usuario: {$loginEmail}\n"
                ."🔑 Contraseña temporal: {$temporaryPassword}\n"
                ."⚠️ Cambia tu contraseña en el primer acceso.\n\n";
        } else {
            $credentialsBlock = "👤 Usuario: {$loginEmail}\n"
                ."🔐 Define tu contraseña con «Olvidé mi contraseña» en el login si aún no tienes una.\n\n";
        }

        $message = "✅ *{$productLabel} activado*\n"
            .'📦 Pedido: '.$order->order_number."\n"
            .$subdomainLine
            .'🔗 Acceso: '.$loginUrl."\n"
            .$credentialsBlock;

        return [$subject, $message];
    }
}
