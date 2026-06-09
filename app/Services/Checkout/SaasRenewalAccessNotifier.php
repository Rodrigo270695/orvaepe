<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use App\Services\Notifications\NotificationSender;
use App\Support\WhatsAppPhoneNormalizer;

/**
 * Notifica al cliente y admin tras renovar VetSaaS / Aula Virtual (sin contraseña temporal).
 */
final class SaasRenewalAccessNotifier
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
        string $periodEndFormatted,
    ): void {
        $loginUrl = trim($loginUrl);
        if ($loginUrl === '') {
            return;
        }

        $user = $order->user;
        if (! $user instanceof User) {
            return;
        }

        $isVetsaas = $productKey === 'vetsaas';
        $productLabel = $isVetsaas ? 'VetSaaS' : 'Aula Virtual';
        $subject = $isVetsaas
            ? 'Tu plan VetSaaS fue renovado'
            : 'Tu plan de Aula Virtual fue renovado';

        $subdomainLine = $tenantSlug !== null && $tenantSlug !== ''
            ? '🌐 Subdominio: '.$tenantSlug."\n"
            : '';

        $message = "✅ *{$productLabel} renovado*\n"
            .'📦 Pedido: '.$order->order_number."\n"
            .$subdomainLine
            .'📅 Nuevo vencimiento: '.$periodEndFormatted."\n"
            .'🔗 Acceso: '.$loginUrl."\n"
            ."👤 Usuario: {$loginEmail}\n\n"
            .'Tu clínica sigue en el mismo subdominio; no necesitas crear una cuenta nueva.';

        $data = [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'login_url' => $loginUrl,
            'tenant_slug' => $tenantSlug,
            'login_email' => $loginEmail,
            'period_end' => $periodEndFormatted,
        ];

        Notification::query()->create([
            'user_id' => $user->id,
            'type' => $productKey.'.renewal.customer',
            'channel' => 'in_app',
            'subject' => $subject,
            'message' => $message,
            'data' => $data,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $whatsappNotification = Notification::query()->create([
            'user_id' => $user->id,
            'type' => $productKey.'.renewal.customer',
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
                'type' => $productKey.'.renewal.customer',
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

        $this->notifyAdmin($order, $productKey, $user, $message, $subject, $data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function notifyAdmin(
        Order $order,
        string $productKey,
        User $customer,
        string $message,
        string $subject,
        array $data,
    ): void {
        $adminSubject = 'Renovación '.$subject.' – '.$order->order_number;
        $adminBody = "🔄 *Renovación SaaS*\n"
            .'📦 Pedido: '.$order->order_number."\n"
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
                'type' => $productKey.'.renewal.admin',
                'channel' => 'in_app',
                'subject' => $adminSubject,
                'message' => $adminBody,
                'data' => $adminData,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $whatsappNotification = Notification::query()->create([
                'user_id' => $admin->id,
                'type' => $productKey.'.renewal.admin',
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
                    'type' => $productKey.'.renewal.admin',
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
