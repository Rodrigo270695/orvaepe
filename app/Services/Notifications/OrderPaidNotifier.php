<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;

final class OrderPaidNotifier
{
    public function __construct(
        private readonly NotificationSender $sender,
    ) {}

    private function orderLinesSummary(Order $order): string
    {
        $order->loadMissing(['lines.sku']);

        $lines = [];
        foreach ($order->lines as $line) {
            $name = trim((string) ($line->sku_name_snapshot ?: $line->sku?->name ?: 'Producto'));
            $code = trim((string) ($line->sku?->code ?? ''));
            $qty = max(1, (int) $line->quantity);
            $label = $name;
            if ($code !== '') {
                $label .= ' ('.$code.')';
            }
            $label .= ' × '.$qty;
            $lines[] = '• '.$label;
        }

        return $lines === [] ? '(sin líneas)' : implode("\n", $lines);
    }

    private function adminPaidMessage(Order $order, User $user, string $linesSummary): string
    {
        return 'Pedido '.$order->order_number.' pagado.'."\n"
            .'Cliente: '.$user->email."\n"
            .'Total: '.(string) $order->grand_total.' '.(string) $order->currency."\n\n"
            ."Productos / SKU:\n".$linesSummary;
    }

    public function notifyCustomer(Order $order, User $user): void
    {
        $user->refresh();

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
            'status' => 'sent',
            'sent_at' => now(),
        ]);

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
                'phone_snapshot' => $user->phone,
            ],
            'status' => 'pending',
        ]);

        $this->sender->send($notification);
    }

    public function notifyAdmin(Order $order, User $user): void
    {
        $order->loadMissing(['lines.sku']);
        $linesSummary = $this->orderLinesSummary($order);
        $body = $this->adminPaidMessage($order, $user, $linesSummary);

        $adminUsers = User::query()
            ->role('superadmin')
            ->get(['id']);

        $data = [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_email' => (string) $user->email,
            'amount' => (string) $order->grand_total,
            'currency' => (string) $order->currency,
            'lines_summary' => $linesSummary,
        ];

        foreach ($adminUsers as $admin) {
            Notification::query()->create([
                'user_id' => $admin->id,
                'type' => 'order.paid.admin',
                'channel' => 'in_app',
                'subject' => 'Nuevo pedido pagado',
                'message' => $body,
                'data' => $data,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $notification = Notification::query()->create([
                'user_id' => $admin->id,
                'type' => 'order.paid.admin',
                'channel' => 'whatsapp',
                'subject' => 'Pedido '.$order->order_number,
                'message' => $body,
                'data' => $data,
                'status' => 'pending',
            ]);

            $this->sender->send($notification);
        }
    }
}
