<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\Models\Notification;
use Illuminate\Support\Facades\Log;

/**
 * Encola el envío real (WhatsApp/email) después de la respuesta HTTP.
 * Evita que UltraMsg/SMTP bloqueen el redirect post-checkout.
 */
final class DeferredNotificationSender
{
    public function __construct(
        private readonly NotificationSender $sender,
    ) {}

    public function send(Notification $notification): void
    {
        $id = $notification->id;

        dispatch(function () use ($id): void {
            $fresh = Notification::query()->find($id);
            if (! $fresh instanceof Notification) {
                return;
            }

            try {
                app(NotificationSender::class)->send($fresh);
            } catch (\Throwable $e) {
                Log::warning('notification.deferred_send_failed', [
                    'id' => $id,
                    'error' => $e->getMessage(),
                ]);
            }
        })->afterResponse();
    }
}
