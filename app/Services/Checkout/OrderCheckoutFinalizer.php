<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\Notifications\OrderPaidNotifier;
use Illuminate\Support\Facades\DB;

/**
 * Marca un pedido como pagado, registra el pago y dispara provisionamiento post-compra.
 */
final class OrderCheckoutFinalizer
{
    public function __construct(
        private readonly OrderPaidNotifier $notifier,
        private readonly OrderPaidEntitlementProvisioner $entitlementProvisioner,
        private readonly OrderPaidSubscriptionProvisioner $subscriptionProvisioner,
        private readonly OrderPaidLicenseProvisioner $licenseProvisioner,
    ) {}

    /**
     * @param  array<string, mixed>|null  $rawRequest
     * @param  array<string, mixed>|null  $rawResponse
     */
    public function finalizeAsPaid(
        Order $order,
        User $user,
        string $gateway,
        string $gatewayPaymentId,
        ?array $rawRequest = null,
        ?array $rawResponse = null,
    ): void {
        DB::transaction(function () use ($order, $user, $gateway, $gatewayPaymentId, $rawRequest, $rawResponse): void {
            $existing = Payment::query()->where('gateway_payment_id', $gatewayPaymentId)->first();

            if ($existing !== null) {
                if ($order->status !== Order::STATUS_PAID) {
                    $order->update([
                        'status' => Order::STATUS_PAID,
                        'placed_at' => $order->placed_at ?? now(),
                    ]);
                }

                $this->afterPaid($order, $user);

                return;
            }

            if ($order->status !== Order::STATUS_PAID) {
                $order->update([
                    'status' => Order::STATUS_PAID,
                    'placed_at' => now(),
                ]);
            }

            Payment::query()->create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'gateway' => $gateway,
                'gateway_payment_id' => $gatewayPaymentId,
                'amount' => $order->grand_total,
                'currency' => $order->currency,
                'status' => 'completed',
                'raw_request' => $rawRequest,
                'raw_response' => $rawResponse,
                'paid_at' => now(),
            ]);

            $this->afterPaid($order, $user);
        });
    }

    private function afterPaid(Order $order, User $user): void
    {
        session()->forget(['saas_marketing_renewal', 'vetsaas_renew_tenant_slug']);

        $order->refresh();
        $order->coupon?->increment('used_count');

        $this->notifier->notifyCustomer($order, $user);
        $this->notifier->notifyAdmin($order, $user);

        $freshOrder = $order->fresh(['user', 'lines.sku.product', 'payments']);
        $this->subscriptionProvisioner->provision($freshOrder);
        $this->entitlementProvisioner->provision($freshOrder);
        $this->licenseProvisioner->provision($freshOrder);
    }
}
