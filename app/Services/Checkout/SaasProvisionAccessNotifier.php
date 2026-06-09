<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use App\Services\Notifications\NotificationSender;
use App\Support\WhatsAppPhoneNormalizer;

/**
 * WhatsApp, correo e in-app tras provisión SaaS (VetSaaS / Aula Virtual) con URL y credenciales iniciales.
 */
final class SaasProvisionAccessNotifier
{
    public function __construct(
        private readonly NotificationSender $notificationSender,
    ) {}

    public function notify(
        Order $order,
        string $productKey,
        string $loginUrl,
        ?string $tenantSlug,
        string $loginEmail,
        ?string $temporaryPassword,
    ): void {
        $loginUrl = trim($loginUrl);
        if ($loginUrl === '') {
            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            return;
        }

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

        $whatsappNotification = Notification::query()->create([
            'user_id' => $user->id,
            'type' => $productKey.'.access.customer',
            'channel' => 'whatsapp',
            'subject' => $subject,
            'message' => $message,
            'data' => array_merge($data, [
                'phone_snapshot' => $user->phone,
                'whatsapp_to' => $this->resolveWhatsAppToFromUser($user),
                'customer_email' => $loginEmail,
            ]),
            'status' => 'pending',
        ]);

        $this->notificationSender->send($whatsappNotification);

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
            $adminTo = $this->resolveWhatsAppToFromUser($admin)
                ?: WhatsAppPhoneNormalizer::toUltraMsgTo((string) config('openwa.admin_notification_number'));

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

            $whatsappNotification = Notification::query()->create([
                'user_id' => $admin->id,
                'type' => $productKey.'.access.admin',
                'channel' => 'whatsapp',
                'subject' => $subject,
                'message' => $body,
                'data' => array_merge($data, [
                    'whatsapp_to' => $adminTo,
                ]),
                'status' => 'pending',
            ]);

            $this->notificationSender->send($whatsappNotification);

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

        $credentialsBlock = '';
        if ($temporaryPassword !== null && $temporaryPassword !== '') {
            $credentialsBlock = "👤 Usuario: {$loginEmail}\n"
                ."🔑 Contraseña temporal: {$temporaryPassword}\n"
                ."⚠️ Por seguridad, inicia sesión y cambia tu contraseña en el primer acceso "
                ."(Menú de usuario → Seguridad, o «Olvidé mi contraseña» en la pantalla de login).\n\n";
        } else {
            $credentialsBlock = "👤 Usuario: {$loginEmail}\n"
                ."🔐 Define tu contraseña con «Olvidé mi contraseña» en la pantalla de login si aún no tienes una.\n\n";
        }

        $forgotPath = $isVetsaas ? '/login' : '/forgot-password';
        $forgotHint = rtrim($loginUrl, '/');
        if (str_contains($forgotHint, '/login')) {
            $forgotHint = preg_replace('#/login$#', $forgotPath, $forgotHint) ?? $forgotHint.$forgotPath;
        } else {
            $forgotHint .= $forgotPath;
        }

        $message = "✅ *{$productLabel} activado*\n"
            .'📦 Pedido: '.$order->order_number."\n"
            .$subdomainLine
            .'🔗 Acceso: '.$loginUrl."\n"
            .$credentialsBlock
            .'Si no puedes entrar: '.$forgotHint;

        return [$subject, $message];
    }

    private function resolveWhatsAppToFromUser(User $user): ?string
    {
        $user->loadMissing('profile');

        if (is_string($user->phone) && trim($user->phone) !== '') {
            return WhatsAppPhoneNormalizer::toUltraMsgTo($user->phone);
        }

        $profilePhone = $user->profile?->phone;
        if (is_string($profilePhone) && trim($profilePhone) !== '') {
            return WhatsAppPhoneNormalizer::toUltraMsgTo($profilePhone);
        }

        return null;
    }
}
