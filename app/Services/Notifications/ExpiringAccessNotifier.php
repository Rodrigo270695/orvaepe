<?php

namespace App\Services\Notifications;

use App\Models\LicenseKey;
use App\Models\Notification;
use App\Models\Subscription;
use App\Models\User;
use App\Support\WhatsAppPhoneNormalizer;
use Illuminate\Support\Carbon;

final class ExpiringAccessNotifier
{
    public function __construct(
        private readonly NotificationSender $sender,
    ) {}

    public function notifyExpiring(int $daysBefore = 7): int
    {
        $targetDate = now()->addDays($daysBefore)->toDateString();
        $sent = 0;

        $subscriptions = Subscription::query()
            ->whereIn('status', [Subscription::STATUS_ACTIVE, Subscription::STATUS_TRIALING])
            ->whereNotNull('current_period_end')
            ->whereDate('current_period_end', '=', $targetDate)
            ->with(['user:id,name,lastname,email,phone,username', 'user.profile:id,user_id,phone'])
            ->get();

        foreach ($subscriptions as $subscription) {
            if (! $subscription instanceof Subscription) {
                continue;
            }
            $sent += $this->notifyAdminsForExpiringSubscription($subscription, $daysBefore);
        }

        $licenses = LicenseKey::query()
            ->where('status', LicenseKey::STATUS_ACTIVE)
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '=', $targetDate)
            ->with(['user:id,name,lastname,email,phone,username', 'user.profile:id,user_id,phone', 'catalogSku:id,code,name'])
            ->get();

        foreach ($licenses as $license) {
            if (! $license instanceof LicenseKey) {
                continue;
            }
            $sent += $this->notifyAdminsForExpiringLicense($license, $daysBefore);
        }

        return $sent;
    }

    private function notifyAdminsForExpiringSubscription(Subscription $subscription, int $daysBefore): int
    {
        $periodEnd = $subscription->current_period_end instanceof Carbon
            ? $subscription->current_period_end->format('Y-m-d H:i')
            : 'N/D';

        if ($this->alreadyNotified('subscription.expiring.admin', (string) $subscription->id, $daysBefore)) {
            return 0;
        }

        $customerEmail = (string) ($subscription->user?->email ?? '');
        $body = "⚠️ *Suscripción por vencer*\n"
            .'Cliente: '.($customerEmail !== '' ? $customerEmail : 'N/D')."\n"
            .'ID suscripción: '.$subscription->id."\n"
            .'Vence en: '.$daysBefore." días\n"
            .'Fin de período: '.$periodEnd."\n\n"
            .'Acción recomendada: contactar al cliente para renovar.';

        return $this->dispatchToAdmins(
            type: 'subscription.expiring.admin',
            subject: 'Suscripción por vencer',
            message: $body,
            data: [
                'subscription_id' => $subscription->id,
                'days_before' => $daysBefore,
                'period_end' => $periodEnd,
                'customer_email' => $customerEmail,
            ],
        );
    }

    private function notifyAdminsForExpiringLicense(LicenseKey $license, int $daysBefore): int
    {
        if ($this->alreadyNotified('license.expiring.admin', (string) $license->id, $daysBefore)) {
            return 0;
        }

        $expiresAt = $license->expires_at instanceof Carbon
            ? $license->expires_at->format('Y-m-d H:i')
            : 'N/D';
        $customerEmail = (string) ($license->user?->email ?? '');
        $skuCode = (string) ($license->catalogSku?->code ?? '');

        $body = "⚠️ *Licencia por vencer*\n"
            .'Cliente: '.($customerEmail !== '' ? $customerEmail : 'N/D')."\n"
            .'Clave: '.$license->key."\n"
            .'SKU: '.($skuCode !== '' ? $skuCode : 'N/D')."\n"
            .'Vence en: '.$daysBefore." días\n"
            .'Fecha vencimiento: '.$expiresAt."\n\n"
            .'Acción recomendada: contactar al cliente para renovación.';

        return $this->dispatchToAdmins(
            type: 'license.expiring.admin',
            subject: 'Licencia por vencer',
            message: $body,
            data: [
                'license_id' => $license->id,
                'days_before' => $daysBefore,
                'expires_at' => $expiresAt,
                'customer_email' => $customerEmail,
                'sku_code' => $skuCode,
            ],
        );
    }

    private function alreadyNotified(string $type, string $entityId, int $daysBefore): bool
    {
        $startOfDay = now()->startOfDay();

        return Notification::query()
            ->where('type', $type)
            ->where('created_at', '>=', $startOfDay)
            ->where('data->days_before', $daysBefore)
            ->where(function ($q) use ($entityId, $type): void {
                if ($type === 'subscription.expiring.admin') {
                    $q->where('data->subscription_id', $entityId);
                } else {
                    $q->where('data->license_id', $entityId);
                }
            })
            ->exists();
    }

    /**
     * @param array<string, mixed> $data
     */
    private function dispatchToAdmins(string $type, string $subject, string $message, array $data): int
    {
        $admins = User::query()
            ->role('superadmin')
            ->with('profile:id,user_id,phone')
            ->get(['id', 'email', 'phone']);

        $sent = 0;
        foreach ($admins as $admin) {
            $toWhatsApp = $this->resolveWhatsAppToFromUser($admin)
                ?: WhatsAppPhoneNormalizer::toUltraMsgTo((string) config('ultramsg.admin_number'));

            $whatsAppNotification = Notification::query()->create([
                'user_id' => $admin->id,
                'type' => $type,
                'channel' => 'whatsapp',
                'subject' => $subject,
                'message' => $message,
                'data' => array_merge($data, ['whatsapp_to' => $toWhatsApp]),
                'status' => 'pending',
            ]);
            $this->sender->send($whatsAppNotification);
            $sent++;

            $adminEmail = trim((string) $admin->email);
            if ($adminEmail !== '' && filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
                $emailNotification = Notification::query()->create([
                    'user_id' => $admin->id,
                    'type' => $type,
                    'channel' => 'email',
                    'subject' => $subject,
                    'message' => $message,
                    'data' => array_merge($data, ['email_to' => $adminEmail]),
                    'status' => 'pending',
                ]);
                $this->sender->send($emailNotification);
                $sent++;
            }
        }

        return $sent;
    }

    private function resolveWhatsAppToFromUser(User $user): ?string
    {
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
