<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use App\Services\Notifications\DeferredNotificationSender;
use App\Support\Checkout\WhatsAppRecipientDeduper;
use App\Support\WhatsAppPhoneNormalizer;

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

        $customerTo = $deduper->resolveFromUser($user);
        [$to, $skipWa] = $deduper->claim($customerTo);

        if (! $skipWa && $to !== null) {
            $whatsappNotification = Notification::query()->create([
                'user_id' => $user->id,
                'type' => $productKey.'.access.customer',
                'channel' => 'whatsapp',
                'subject' => '',
                'message' => $message,
                'data' => array_merge($data, [
                    'phone_snapshot' => $user->phone,
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
    ): void {
        $isVetsaas = $productKey === 'vetsaas';
        $productLabel = $isVetsaas ? 'VetSaaS' : 'Aula Virtual';
        $subject = "Acceso {$productLabel} provisionado – {$order->order_number}";

        $subdomainLine = $tenantSlug !== null && $tenantSlug !== ''
            ? '🌐 Subdominio: '.$tenantSlug."\n"
            : '';

        $passwordLine = $temporaryPassword !== null && $temporaryPassword !== ''
            ? '🔑 Contraseña temporal: '.$temporaryPassword."\n"
            : '';

        $body = "🔐 *Acceso {$productLabel} provisionado*\n"
            .'📦 Pedido: '.$order->order_number."\n"
            .'👤 Cliente: '.$customer->email."\n"
            .$subdomainLine
            .'🔗 URL: '.$loginUrl."\n"
            .'👤 Usuario: '.$loginEmail."\n"
            .$passwordLine;

        $data = $this->buildData($order, $loginUrl, $tenantSlug, $loginEmail, $temporaryPassword);
        $data['customer_email'] = (string) $customer->email;

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

            $adminTo = $deduper->resolveFromUser($admin)
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
        $productLabel = $isVetsaas ? 'VetSaaS' : 'Aula Virtual';
        $subject = $isVetsaas
            ? 'Tu clínica VetSaaS está lista'
            : 'Tu acceso a Aula Virtual está listo';

        $subdomainLine = $tenantSlug !== null && $tenantSlug !== ''
            ? '🌐 Subdominio: '.$tenantSlug."\n"
            : '';

        $isBootstrap = $isVetsaas && str_contains($loginUrl, '/auth/bienvenida/');

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
