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
        return "🚨 *Nueva compra confirmada*\n"
            .'📦 Pedido: '.$order->order_number."\n"
            .'👤 Cliente: '.$user->email."\n"
            .'💰 Total: '.(string) $order->grand_total.' '.(string) $order->currency."\n\n"
            ."🧾 Productos / SKU:\n".$linesSummary."\n\n"
            .'⚡ Acción requerida: revisa la orden y procede con la compra/carga de licencias.';
    }

    private function customerPaidMessage(Order $order, string $linesSummary): string
    {
        return "✅ *Pago confirmado*\n"
            .'📦 Pedido: '.$order->order_number."\n"
            .'💰 Total pagado: '.(string) $order->grand_total.' '.(string) $order->currency."\n\n"
            ."🧾 Detalle:\n".$linesSummary."\n\n"
            .'⏳ Tu licencia se está procesando y se activará en breve en tu portal.';
    }

    private function resolveCustomerFromOrder(Order $order, User $fallback): User
    {
        $order->loadMissing('user');
        $orderUser = $order->user;

        if ($orderUser instanceof User) {
            return $orderUser;
        }

        return $fallback;
    }

    public function notifyCustomer(Order $order, User $user): void
    {
        $customer = $this->resolveCustomerFromOrder($order, $user);
        $customer->refresh();
        $order->loadMissing(['lines.sku']);
        $linesSummary = $this->orderLinesSummary($order);
        $body = $this->customerPaidMessage($order, $linesSummary);

        Notification::query()->create([
            'user_id' => $customer->id,
            'type' => 'order.paid.customer',
            'channel' => 'in_app',
            'subject' => 'Pago confirmado',
            'message' => $body,
            'data' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'amount' => (string) $order->grand_total,
                'currency' => (string) $order->currency,
                'lines_summary' => $linesSummary,
                'customer_email' => (string) $customer->email,
            ],
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $notification = Notification::query()->create([
            'user_id' => $customer->id,
            'type' => 'order.paid.customer',
            'channel' => 'whatsapp',
            'subject' => 'Pago confirmado',
            'message' => $body,
            'data' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'amount' => (string) $order->grand_total,
                'currency' => (string) $order->currency,
                'lines_summary' => $linesSummary,
                'phone_snapshot' => $customer->phone,
                'customer_email' => (string) $customer->email,
            ],
            'status' => 'pending',
        ]);

        $this->sender->send($notification);
    }

    public function notifyAdmin(Order $order, User $user): void
    {
        $customer = $this->resolveCustomerFromOrder($order, $user);
        $order->loadMissing(['lines.sku']);
        $linesSummary = $this->orderLinesSummary($order);
        $body = $this->adminPaidMessage($order, $customer, $linesSummary);

        $adminUsers = User::query()
            ->role('superadmin')
            ->get(['id']);

        $data = [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_email' => (string) $customer->email,
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
