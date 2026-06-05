<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use App\Services\Notifications\NotificationSender;

/**
 * Notifica al cliente tras renovar VetSaaS / Aula Virtual (sin contraseña temporal).
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

        $emailNotification = Notification::query()->create([
            'user_id' => $user->id,
            'type' => $productKey.'.renewal.customer',
            'channel' => 'email',
            'subject' => $subject,
            'message' => $message,
            'data' => array_merge($data, ['email_to' => $loginEmail]),
            'status' => 'pending',
        ]);

        $this->notificationSender->send($emailNotification);
    }
}
