<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Services\WhatsApp\UltraMsgClient;
use Illuminate\Support\Facades\Log;

class NotificationSender
{
    public function __construct(
        private readonly UltraMsgClient $whatsApp,
    ) {
    }

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
        $user = $notification->user;
        $to = null;

        if ($user && $user->phone) {
            $to = $user->phone;
        } elseif ($notification->type === 'order.paid.admin') {
            $to = (string) config('ultramsg.admin_number');
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

        $this->whatsApp->sendText($to, $body);
    }
}

