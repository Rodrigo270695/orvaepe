<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use App\Services\Notifications\NotificationSender;

/**
 * Correo e in-app tras provisión SaaS (VetSaaS / Aula Virtual) con URL y credenciales iniciales.
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

        [$subject, $message] = $this->buildCopy(
            $productKey,
            $order,
            $loginUrl,
            $tenantSlug,
            $loginEmail,
            $temporaryPassword,
        );

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

        $emailNotification = Notification::query()->create([
            'user_id' => $user->id,
            'type' => $productKey.'.access.customer',
            'channel' => 'email',
            'subject' => $subject,
            'message' => $message,
            'data' => array_merge($data, ['email_to' => $loginEmail]),
            'status' => 'pending',
        ]);

        $this->notificationSender->send($emailNotification);
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function buildCopy(
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
}
