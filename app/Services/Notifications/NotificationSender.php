<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Services\WhatsApp\UltraMsgClient;
use App\Support\WhatsAppPhoneNormalizer;
use Illuminate\Support\Facades\Log;

class NotificationSender
{
    public function __construct(
        private readonly UltraMsgClient $whatsApp,
    ) {}

    public function send(Notification $notification): void
    {
        if ($notification->status !== 'pending') {
            return;
        }

        try {
            match ($notification->channel) {
                'whatsapp' => $this->sendWhatsApp($notification),
                default => null,
            };
        } catch (\Throwable $e) {
            $notification->forceFill([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ])->save();

            Log::warning('notification.send_failed', [
                'id' => $notification->id,
                'channel' => $notification->channel,
                'error' => $e->getMessage(),
            ]);

            return;
        }

        $notification->forceFill([
            'status' => 'sent',
            'sent_at' => now(),
        ])->save();
    }

    private function sendWhatsApp(Notification $notification): void
    {
        $data = is_array($notification->data) ? $notification->data : [];

        $to = null;
        $explicitTo = $data['whatsapp_to'] ?? null;
        if (is_string($explicitTo) && trim($explicitTo) !== '') {
            $to = WhatsAppPhoneNormalizer::toUltraMsgTo($explicitTo);
        }

        $user = $notification->user()
            ->with('profile:id,user_id,phone')
            ->first(['id', 'phone']);

        if (! $to && $user && $user->phone) {
            $to = WhatsAppPhoneNormalizer::toUltraMsgTo($user->phone);
        }

        if (! $to && $user && $user->profile?->phone) {
            $to = WhatsAppPhoneNormalizer::toUltraMsgTo($user->profile->phone);
        }

        if (! $to && $notification->type === 'order.paid.admin') {
            $adminFromEnv = trim((string) config('ultramsg.admin_number'));
            if ($adminFromEnv !== '') {
                $to = WhatsAppPhoneNormalizer::toUltraMsgTo($adminFromEnv);
            }
        }

        // Fallback para cliente: usar snapshot guardado al crear la notificación.
        if (! $to && $notification->type === 'order.paid.customer') {
            $snapshotPhone = $data['phone_snapshot'] ?? null;
            if (is_string($snapshotPhone) && $snapshotPhone !== '') {
                $to = WhatsAppPhoneNormalizer::toUltraMsgTo($snapshotPhone);
            }
        }

        if (! $to) {
            throw new \RuntimeException('No hay número de WhatsApp configurado para esta notificación.');
        }

        $subject = $notification->subject ?? '';
        $message = $notification->message ?? '';
        $body = trim($subject !== '' ? "{$subject}\n\n{$message}" : $message);
        if ($body === '') {
            $body = 'Notificación desde ORVAE.';
        }

        Log::info('notification.whatsapp_target', [
            'notification_id' => $notification->id,
            'type' => $notification->type,
            'user_id' => $notification->user_id,
            'to' => $to,
        ]);

        $this->whatsApp->sendText($to, $body);
    }
}
