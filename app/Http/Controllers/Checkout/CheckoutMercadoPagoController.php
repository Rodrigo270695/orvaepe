<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\StorePayPalCheckoutRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\WebhookEvent;
use App\Services\Audit\AuditLogger;
use App\Services\Checkout\OrderFromCartLinesBuilder;
use App\Services\Checkout\OrderPaidEntitlementProvisioner;
use App\Services\Checkout\OrderPaidLicenseProvisioner;
use App\Services\Checkout\OrderPaidSubscriptionProvisioner;
use App\Services\Notifications\OrderPaidNotifier;
use App\Services\Payments\MercadoPagoClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutMercadoPagoController extends Controller
{
    public function store(
        StorePayPalCheckoutRequest $request,
        OrderFromCartLinesBuilder $builder,
        MercadoPagoClient $mercadoPago,
    ): JsonResponse {
        $user = $request->user();
        if (! $user->hasRole('client') && ! $user->hasRole('superadmin')) {
            return response()->json([
                'message' => 'Solo cuentas con rol cliente (o superadmin en pruebas) pueden pagar aquí. Usa el panel de ventas para otros casos.',
            ], 403);
        }

        $data = $request->validated();
        $lines = array_map(static fn (array $l) => [
            'plan_id' => $l['plan_id'],
            'qty' => (int) $l['qty'],
        ], $data['lines']);

        $couponCode = isset($data['coupon_code']) ? trim((string) $data['coupon_code']) : null;
        $couponCode = $couponCode === '' ? null : $couponCode;

        $order = $builder->createPendingOrder($user, $lines, $couponCode);
        Log::info('mercadopago.checkout_start', [
            'order_number' => $order->order_number,
            'order_id' => $order->id,
            'user_id' => $user->id,
            'grand_total' => (string) $order->grand_total,
            'order_currency' => (string) $order->currency,
            'coupon_code' => $couponCode,
        ]);

        $targetCurrency = strtoupper((string) config('mercadopago.checkout_currency', 'PEN'));
        $orderCurrency = strtoupper((string) $order->currency);

        if ($targetCurrency !== $orderCurrency) {
            $order->delete();

            return response()->json([
                'message' => "Mercado Pago está configurado para {$targetCurrency}, pero el pedido está en {$orderCurrency}.",
            ], 422);
        }

        $payload = [
            // Payload mínimo recomendado para Checkout Pro en producción.
            'items' => [[
                'title' => 'Pedido '.$order->order_number,
                'quantity' => 1,
                'currency_id' => $targetCurrency,
                'unit_price' => (float) $order->grand_total,
            ]],
            'external_reference' => $order->order_number,
            'payer' => [
                'email' => (string) $user->email,
            ],
            'back_urls' => [
                'success' => route('checkout.mercadopago.return', [], true),
                'failure' => route('checkout.mercadopago.cancel', [], true),
                'pending' => route('checkout.mercadopago.return', [], true),
            ],
            'auto_return' => 'approved',
        ];

        $webhook = trim((string) config('mercadopago.webhook_url'));
        if ($webhook !== '') {
            $payload['notification_url'] = $webhook;
        }
        Log::info('mercadopago.preference_payload_ready', [
            'order_number' => $order->order_number,
            'external_reference' => $payload['external_reference'] ?? null,
            'currency_id' => $payload['items'][0]['currency_id'] ?? null,
            'unit_price' => $payload['items'][0]['unit_price'] ?? null,
            'notification_url' => $payload['notification_url'] ?? null,
            'back_urls' => $payload['back_urls'] ?? null,
        ]);

        try {
            $preference = $mercadoPago->createPreference($payload);
        } catch (\Throwable $e) {
            $order->delete();
            Log::warning('mercadopago.create_preference_failed', [
                'order_number' => $order->order_number,
                'order_id' => $order->id,
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo iniciar Mercado Pago: '.$e->getMessage(),
            ], 502);
        }

        $initPoint = $preference['init_point'] ?? null;
        if (! is_string($initPoint) || $initPoint === '') {
            $order->delete();

            return response()->json([
                'message' => 'Mercado Pago no devolvió el enlace de pago.',
            ], 502);
        }

        $prefId = $preference['id'] ?? null;
        if (is_string($prefId) && $prefId !== '') {
            $order->notes_internal = trim((string) $order->notes_internal.' | MP preference '.$prefId);
            $order->save();
        }
        Log::info('mercadopago.preference_created', [
            'order_number' => $order->order_number,
            'order_id' => $order->id,
            'preference_id' => is_string($prefId) ? $prefId : null,
            'init_point' => $initPoint,
        ]);

        return response()->json([
            'approval_url' => $initPoint,
            'order_number' => $order->order_number,
        ]);
    }

    public function handleReturn(Request $request, MercadoPagoClient $mercadoPago): RedirectResponse
    {
        $user = $request->user();
        Log::info('mercadopago.handle_return_received', [
            'query' => $request->query(),
            'user_id' => $user?->id,
        ]);

        $externalRef = (string) $request->query('external_reference', '');
        if ($externalRef === '') {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'Mercado Pago devolvió una respuesta incompleta.');
        }

        $order = Order::query()
            ->where('order_number', $externalRef)
            ->where('user_id', $user->id)
            ->first();

        if ($order === null) {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'No se encontró el pedido asociado a esta sesión de pago.');
        }

        if ($order->status === Order::STATUS_PAID) {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'Este pedido ya estaba registrado como pagado ('.$order->order_number.').');
        }

        $paymentId = (string) ($request->query('payment_id') ?: $request->query('collection_id') ?: '');
        if ($paymentId === '') {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'Mercado Pago no devolvió el identificador del pago.');
        }

        try {
            $payment = $mercadoPago->getPayment($paymentId);
        } catch (\Throwable $e) {
            Log::warning('mercadopago.handle_return_payment_failed', [
                'order_number' => $order->order_number,
                'payment_id' => $paymentId,
                'exception' => $e->getMessage(),
            ]);

            return redirect()
                ->route('marketing-cart')
                ->with('status', 'No se pudo confirmar el pago con Mercado Pago. Reintenta en unos minutos.');
        }

        $status = strtolower((string) ($payment['status'] ?? ''));
        Log::info('mercadopago.handle_return_payment_status', [
            'order_number' => $order->order_number,
            'payment_id' => $paymentId,
            'status' => $status,
            'status_detail' => $payment['status_detail'] ?? null,
            'external_reference' => $payment['external_reference'] ?? null,
        ]);
        if ($status !== 'approved') {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'El pago con Mercado Pago no se completó. Estado: '.($payment['status'] ?? 'desconocido'));
        }

        $this->finalizeOrderAsPaid(
            $order,
            $user,
            $paymentId,
            'mercadopago',
            $payment,
            app(OrderPaidNotifier::class),
            app(OrderPaidEntitlementProvisioner::class),
            app(OrderPaidSubscriptionProvisioner::class),
            app(OrderPaidLicenseProvisioner::class),
        );

        return redirect()
            ->route('marketing-cart')
            ->with('status', 'Pago confirmado con Mercado Pago. Pedido '.$order->order_number.'.');
    }

    public function cancel(Request $request): RedirectResponse
    {
        $externalRef = (string) $request->query('external_reference', '');
        if ($externalRef !== '') {
            $order = Order::query()
                ->where('order_number', $externalRef)
                ->where('user_id', $request->user()->id)
                ->first();

            if ($order !== null && $order->status === Order::STATUS_PENDING_PAYMENT) {
                $order->update([
                    'status' => Order::STATUS_CANCELLED,
                ]);
            }
        }

        return redirect()
            ->route('marketing-cart')
            ->with('status', 'Pago cancelado en Mercado Pago. Puedes volver a intentarlo.');
    }

    public function webhook(Request $request, MercadoPagoClient $mercadoPago): JsonResponse
    {
        $topic = strtolower((string) ($request->query('type')
            ?: $request->query('topic')
            ?: $request->input('type')
            ?: $request->input('action')
            ?: 'unknown'));

        $resourceId = (string) ($request->input('data.id')
            ?: $request->query('data.id')
            ?: $request->input('id')
            ?: '');

        $gatewayEventId = trim($topic.':'.$resourceId);
        if ($gatewayEventId === ':' || $gatewayEventId === '') {
            $gatewayEventId = 'unknown:'.sha1((string) $request->getContent());
        }
        Log::info('mercadopago.webhook_received', [
            'topic' => $topic,
            'resource_id' => $resourceId,
            'gateway_event_id' => $gatewayEventId,
            'payload' => $request->all(),
        ]);

        $event = WebhookEvent::query()->firstOrCreate(
            [
                'gateway' => 'mercadopago',
                'gateway_event_id' => $gatewayEventId,
            ],
            [
                'event_type' => $topic,
                'payload' => $request->all(),
                'processed' => false,
                'attempts' => 0,
            ],
        );

        if ($event->processed) {
            app(AuditLogger::class)->log(
                action: 'webhook.duplicate_ignored',
                entityType: 'WebhookEvent',
                entityId: $event->id,
                oldValues: null,
                newValues: [
                    'gateway' => $event->gateway,
                    'gateway_event_id' => $event->gateway_event_id,
                    'event_type' => $event->event_type,
                ],
                request: $request,
            );

            return response()->json(['ok' => true, 'duplicate' => true]);
        }

        try {
            $paymentIds = $this->resolvePaymentIdsFromWebhook($topic, $resourceId, $mercadoPago);
            Log::info('mercadopago.webhook_resolved_payment_ids', [
                'topic' => $topic,
                'resource_id' => $resourceId,
                'payment_ids' => $paymentIds,
            ]);

            if ($paymentIds === []) {
                $event->markProcessed();
                app(AuditLogger::class)->log(
                    action: 'webhook.processed_ignored',
                    entityType: 'WebhookEvent',
                    entityId: $event->id,
                    oldValues: ['processed' => false],
                    newValues: ['processed' => true, 'reason' => 'no_payment_ids'],
                    request: $request,
                );

                return response()->json(['ok' => true, 'ignored' => true]);
            }

            foreach ($paymentIds as $paymentId) {
                try {
                    $payment = $mercadoPago->getPayment($paymentId);
                } catch (\Throwable $e) {
                    // En pruebas/simulaciones Mercado Pago puede enviar IDs no consultables (p. ej. 123456).
                    // No rompemos todo el webhook por un ID individual.
                    Log::warning('mercadopago.webhook_payment_lookup_failed', [
                        'payment_id' => $paymentId,
                        'topic' => $topic,
                        'resource_id' => $resourceId,
                        'exception' => $e->getMessage(),
                    ]);

                    continue;
                }

                $status = strtolower((string) ($payment['status'] ?? ''));
                Log::info('mercadopago.webhook_payment_status', [
                    'payment_id' => $paymentId,
                    'status' => $status,
                    'status_detail' => $payment['status_detail'] ?? null,
                    'external_reference' => $payment['external_reference'] ?? null,
                ]);
                if ($status !== 'approved') {
                    continue;
                }

                $externalRef = (string) ($payment['external_reference'] ?? '');
                if ($externalRef === '') {
                    continue;
                }

                $order = Order::query()->where('order_number', $externalRef)->first();
                if (! $order) {
                    continue;
                }

                $user = $order->user;
                if (! $user) {
                    continue;
                }

                $this->finalizeOrderAsPaid(
                    $order,
                    $user,
                    (string) ($payment['id'] ?? $paymentId),
                    'mercadopago',
                    $payment,
                    app(OrderPaidNotifier::class),
                    app(OrderPaidEntitlementProvisioner::class),
                    app(OrderPaidSubscriptionProvisioner::class),
                    app(OrderPaidLicenseProvisioner::class),
                );
                Log::info('mercadopago.webhook_order_finalized', [
                    'payment_id' => $paymentId,
                    'order_number' => $order->order_number,
                    'order_id' => $order->id,
                ]);
            }

            $event->markProcessed();
            app(AuditLogger::class)->log(
                action: 'webhook.processed',
                entityType: 'WebhookEvent',
                entityId: $event->id,
                oldValues: ['processed' => false],
                newValues: ['processed' => true, 'attempts' => $event->attempts],
                request: $request,
            );

            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            Log::warning('mercadopago.webhook_failed', [
                'topic' => $topic,
                'resource_id' => $resourceId,
                'exception' => $e->getMessage(),
            ]);
            $event->markFailed($e->getMessage());
            app(AuditLogger::class)->log(
                action: 'webhook.failed',
                entityType: 'WebhookEvent',
                entityId: $event->id,
                oldValues: ['processed' => false, 'attempts' => max(0, $event->attempts - 1)],
                newValues: ['processed' => false, 'attempts' => $event->attempts, 'error' => $event->error],
                request: $request,
            );

            return response()->json(['ok' => false], 500);
        }
    }

    /**
     * @param  array<string, mixed>  $rawResponse
     */
    private function finalizeOrderAsPaid(
        Order $order,
        User $user,
        string $gatewayPaymentId,
        string $gateway,
        array $rawResponse,
        OrderPaidNotifier $notifier,
        OrderPaidEntitlementProvisioner $entitlementProvisioner,
        OrderPaidSubscriptionProvisioner $subscriptionProvisioner,
        OrderPaidLicenseProvisioner $licenseProvisioner,
    ): void {
        DB::transaction(function () use ($order, $user, $gatewayPaymentId, $gateway, $rawResponse, $notifier, $entitlementProvisioner, $subscriptionProvisioner, $licenseProvisioner) {
            $existing = Payment::query()->where('gateway_payment_id', $gatewayPaymentId)->first();

            if ($existing !== null) {
                if ($order->status === Order::STATUS_PAID) {
                    return;
                }

                $order->update([
                    'status' => Order::STATUS_PAID,
                    'placed_at' => now(),
                ]);
                app(AuditLogger::class)->log(
                    action: 'order.marked_paid_existing_payment',
                    entityType: 'Order',
                    entityId: $order->id,
                    oldValues: ['status' => Order::STATUS_PENDING_PAYMENT],
                    newValues: ['status' => Order::STATUS_PAID, 'gateway_payment_id' => $gatewayPaymentId],
                    userId: $user->id,
                );

                $order->refresh();
                $order->coupon?->increment('used_count');

                $notifier->notifyCustomer($order, $user);
                $notifier->notifyAdmin($order, $user);
                $freshOrder = $order->fresh();
                $subscriptionProvisioner->provision($freshOrder);
                $entitlementProvisioner->provision($freshOrder);
                $licenseProvisioner->provision($freshOrder);

                return;
            }

            $order->update([
                'status' => Order::STATUS_PAID,
                'placed_at' => now(),
            ]);
            app(AuditLogger::class)->log(
                action: 'order.marked_paid',
                entityType: 'Order',
                entityId: $order->id,
                oldValues: ['status' => Order::STATUS_PENDING_PAYMENT],
                newValues: ['status' => Order::STATUS_PAID, 'gateway_payment_id' => $gatewayPaymentId],
                userId: $user->id,
            );

            $payment = Payment::query()->create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'gateway' => $gateway,
                'gateway_payment_id' => $gatewayPaymentId,
                'amount' => $order->grand_total,
                'currency' => $order->currency,
                'status' => 'completed',
                'raw_response' => $rawResponse,
                'paid_at' => now(),
            ]);
            app(AuditLogger::class)->log(
                action: 'payment.created',
                entityType: 'Payment',
                entityId: (string) $payment->id,
                oldValues: null,
                newValues: [
                    'order_id' => $payment->order_id,
                    'gateway' => $payment->gateway,
                    'gateway_payment_id' => $payment->gateway_payment_id,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                ],
                userId: $user->id,
            );

            $order->refresh();
            $order->coupon?->increment('used_count');

            $notifier->notifyCustomer($order, $user);
            $notifier->notifyAdmin($order, $user);
            $freshOrder = $order->fresh();
            $subscriptionProvisioner->provision($freshOrder);
            $entitlementProvisioner->provision($freshOrder);
            $licenseProvisioner->provision($freshOrder);
        });
    }

    /**
     * @return list<string>
     */
    private function resolvePaymentIdsFromWebhook(
        string $topic,
        string $resourceId,
        MercadoPagoClient $mercadoPago,
    ): array {
        if ($resourceId === '') {
            return [];
        }

        if ($topic === 'payment' || $topic === 'topic_payment' || $topic === 'created' || $topic === 'updated') {
            return [$resourceId];
        }

        if ($topic === 'merchant_order' || $topic === 'topic_merchant_order') {
            $merchantOrder = $mercadoPago->getMerchantOrder($resourceId);
            $payments = $merchantOrder['payments'] ?? [];

            if (! is_array($payments)) {
                return [];
            }

            $ids = [];
            foreach ($payments as $p) {
                if (! is_array($p)) {
                    continue;
                }
                $id = $p['id'] ?? null;
                if (is_scalar($id) && (string) $id !== '') {
                    $ids[] = (string) $id;
                }
            }

            return array_values(array_unique($ids));
        }

        return [];
    }
}
