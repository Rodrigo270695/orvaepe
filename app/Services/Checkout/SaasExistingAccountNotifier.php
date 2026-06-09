<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Notification;
use App\Models\User;
use App\Services\Notifications\NotificationSender;
use App\Support\WhatsAppPhoneNormalizer;

/**
 * Avisa al cliente y admin que ya tiene cuenta SaaS (sin crear pedido duplicado).
 */
final class SaasExistingAccountNotifier
{
    public function __construct(
        private readonly NotificationSender $notificationSender,
    ) {}

    /**
     * @param  array{login_url: string, tenant_slug: ?string, login_email: string, product_key: string}  $access
     */
    public function notify(User $user, array $access): void
    {
        $loginUrl = trim($access['login_url']);
        if ($loginUrl === '') {
            return;
        }

        $productKey = $access['product_key'];
        $tenantSlug = $access['tenant_slug'] ?? null;
        $loginEmail = trim($access['login_email']);
        if ($loginEmail === '') {
            $loginEmail = (string) $user->email;
        }

        [$subject, $message] = $this->buildCopy($productKey, $loginUrl, $tenantSlug, $loginEmail);

        $data = [
            'login_url' => $loginUrl,
            'tenant_slug' => $tenantSlug,
            'login_email' => $loginEmail,
            'product_key' => $productKey,
        ];

        Notification::query()->create([
            'user_id' => $user->id,
            'type' => $productKey.'.existing_account.customer',
            'channel' => 'in_app',
            'subject' => $subject,
            'message' => $message,
            'data' => $data,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $whatsappNotification = Notification::query()->create([
            'user_id' => $user->id,
            'type' => $productKey.'.existing_account.customer',
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

        if ($loginEmail !== '' && filter_var($loginEmail, FILTER_VALIDATE_EMAIL)) {
            $emailNotification = Notification::query()->create([
                'user_id' => $user->id,
                'type' => $productKey.'.existing_account.customer',
                'channel' => 'email',
                'subject' => $subject,
                'message' => $message,
                'data' => array_merge($data, [
                    'email_to' => $loginEmail,
                    'customer_email' => $loginEmail,
                ]),
                'status' => 'pending',
            ]);

            $this->notificationSender->send($emailNotification);
        }

        $this->notifyAdmin($user, $productKey, $subject, $message, $data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function notifyAdmin(
        User $customer,
        string $productKey,
        string $subject,
        string $message,
        array $data,
    ): void {
        $adminSubject = 'Cliente existente – '.$subject;
        $adminBody = "ℹ️ *Intento de registro duplicado*\n"
            .'👤 Cliente: '.$customer->email."\n\n"
            .$message;

        $adminData = array_merge($data, [
            'customer_email' => (string) $customer->email,
        ]);

        $adminUsers = User::query()
            ->role('superadmin')
            ->with('profile:id,user_id,phone')
            ->get(['id', 'phone', 'email']);

        foreach ($adminUsers as $admin) {
            $adminTo = $this->resolveWhatsAppToFromUser($admin)
                ?: WhatsAppPhoneNormalizer::toUltraMsgTo((string) config('openwa.admin_notification_number'));

            Notification::query()->create([
                'user_id' => $admin->id,
                'type' => $productKey.'.existing_account.admin',
                'channel' => 'in_app',
                'subject' => $adminSubject,
                'message' => $adminBody,
                'data' => $adminData,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $whatsappNotification = Notification::query()->create([
                'user_id' => $admin->id,
                'type' => $productKey.'.existing_account.admin',
                'channel' => 'whatsapp',
                'subject' => $adminSubject,
                'message' => $adminBody,
                'data' => array_merge($adminData, [
                    'whatsapp_to' => $adminTo,
                ]),
                'status' => 'pending',
            ]);

            $this->notificationSender->send($whatsappNotification);

            $adminEmail = trim((string) $admin->email);
            if ($adminEmail !== '' && filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
                $emailNotification = Notification::query()->create([
                    'user_id' => $admin->id,
                    'type' => $productKey.'.existing_account.admin',
                    'channel' => 'email',
                    'subject' => $adminSubject,
                    'message' => $adminBody,
                    'data' => array_merge($adminData, [
                        'email_to' => $adminEmail,
                    ]),
                    'status' => 'pending',
                ]);

                $this->notificationSender->send($emailNotification);
            }
        }
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function buildCopy(
        string $productKey,
        string $loginUrl,
        ?string $tenantSlug,
        string $loginEmail,
    ): array {
        $isVetsaas = $productKey === 'vetsaas';
        $productLabel = $isVetsaas ? 'VetSaaS' : 'Aula Virtual';
        $subject = 'Ya tienes una cuenta '.$productLabel.' con ORVAE';

        $subdomainLine = $tenantSlug !== null && $tenantSlug !== ''
            ? '🌐 Subdominio: '.$tenantSlug."\n"
            : '';

        $forgotUrl = $this->forgotPasswordUrl($loginUrl, $isVetsaas);

        $message = "ℹ️ *Ya tienes una cuenta con nosotros*\n\n"
            ."Detectamos que ya tienes un acceso activo a {$productLabel}. "
            ."No es necesario registrarte de nuevo.\n\n"
            .$subdomainLine
            .'🔗 Acceso: '.$loginUrl."\n"
            .'👤 Usuario: '.$loginEmail."\n\n"
            ."🔐 Si no recuerdas tu contraseña, usa «Olvidé mi contraseña» para actualizarla:\n"
            .$forgotUrl;

        return [$subject, $message];
    }

    private function forgotPasswordUrl(string $loginUrl, bool $isVetsaas): string
    {
        $forgotPath = $isVetsaas ? '/forgot-password' : '/forgot-password';
        $base = rtrim($loginUrl, '/');

        if (str_contains($base, '/login')) {
            return preg_replace('#/login$#', $forgotPath, $base) ?? $base.$forgotPath;
        }

        return $base.$forgotPath;
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
