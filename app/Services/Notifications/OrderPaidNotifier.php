<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;

final class OrderPaidNotifier
{
    public function __construct(
        private readonly NotificationSender $sender,
    ) {
    }

    public function notifyCustomer(Order $order, User $user): void
    {
        Notification::query()->create([
            'user_id' => $user->id,
            'type' => 'order.paid.customer',
            'channel' => 'in_app',
            'subject' => 'Pago confirmado',
            'message' => 'Tu pedido '.$order->order_number.' ha sido registrado como pagado. Las licencias se generarán en breve.',
            'data' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'amount' => (string) $order->grand_total,
                'currency' => (string) $order->currency,
            ],
        ]);

        if ($user->phone) {
            $notification = Notification::query()->create([
                'user_id' => $user->id,
                'type' => 'order.paid.customer',
                'channel' => 'whatsapp',
                'subject' => 'Pago confirmado',
                'message' => 'Tu pedido '.$order->order_number.' ha sido registrado como pagado. Las licencias se generarán en breve.',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'amount' => (string) $order->grand_total,
                    'currency' => (string) $order->currency,
                ],
                'status' => 'pending',
            ]);

            $this->sender->send($notification);
        }
    }

    public function notifyAdmin(Order $order, User $user): void
    {
        $adminUsers = User::query()
            ->role('superadmin')
            ->get(['id']);

        foreach ($adminUsers as $admin) {
            Notification::query()->create([
                'user_id' => $admin->id,
                'type' => 'order.paid.admin',
                'channel' => 'in_app',
                'subject' => 'Nuevo pedido pagado',
                'message' => 'Se ha confirmado el pago del pedido '.$order->order_number.' del cliente '.$user->email.'.',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_email' => (string) $user->email,
                    'amount' => (string) $order->grand_total,
                    'currency' => (string) $order->currency,
                ],
            ]);

            $notification = Notification::query()->create([
                'user_id' => $admin->id,
                'type' => 'order.paid.admin',
                'channel' => 'whatsapp',
                'subject' => 'Nuevo pedido pagado',
                'message' => 'Se ha confirmado el pago del pedido '.$order->order_number.' del cliente '.$user->email.'.',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_email' => (string) $user->email,
                    'amount' => (string) $order->grand_total,
                    'currency' => (string) $order->currency,
                ],
                'status' => 'pending',
            ]);

            $this->sender->send($notification);
        }
    }
}

