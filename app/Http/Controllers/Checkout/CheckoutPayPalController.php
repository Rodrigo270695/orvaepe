<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\StorePayPalCheckoutRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\Checkout\OrderFromCartLinesBuilder;
use App\Services\Checkout\OrderPaidEntitlementProvisioner;
use App\Services\Checkout\OrderPaidLicenseProvisioner;
use App\Services\Checkout\OrderPaidSubscriptionProvisioner;
use App\Services\Notifications\OrderPaidNotifier;
use App\Services\Payments\PayPalClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class CheckoutPayPalController extends Controller
{
    public function store(
        StorePayPalCheckoutRequest $request,
        OrderFromCartLinesBuilder $builder,
        PayPalClient $paypal,
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

        $returnUrl = route('checkout.paypal.return', [], true);
        $cancelUrl = route('checkout.paypal.cancel', ['order' => $order->id], true);

        try {
            [$amountStr, $payCurrency] = $this->amountAndCurrencyForPayPal(
                (float) $order->grand_total,
                (string) $order->currency,
            );
        } catch (\InvalidArgumentException $e) {
            $order->delete();

            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        try {
            $paypalOrder = $paypal->createOrder(
                $amountStr,
                $payCurrency,
                $returnUrl,
                $cancelUrl,
                $order->order_number,
            );
        } catch (\Throwable $e) {
            $order->delete();

            return response()->json([
                'message' => 'No se pudo iniciar PayPal: '.$e->getMessage(),
            ], 502);
        }

        $paypalId = $paypalOrder['id'] ?? null;
        if (! is_string($paypalId) || $paypalId === '') {
            $order->delete();

            return response()->json([
                'message' => 'Respuesta inválida de PayPal (sin id de orden).',
            ], 502);
        }

        $order->forceFill(['paypal_checkout_order_id' => $paypalId])->save();

        $approveUrl = $this->extractApproveUrl($paypalOrder);
        if ($approveUrl === null) {
            $order->delete();

            return response()->json([
                'message' => 'PayPal no devolvió el enlace de aprobación.',
            ], 502);
        }

        return response()->json([
            'approval_url' => $approveUrl,
            'order_number' => $order->order_number,
        ]);
    }

    /**
     * Marca el pedido como pagado sin llamar a PayPal (solo local + env).
     * Útil para probar carrito → pedido pagado sin pasar por la pasarela.
     */
    public function simulateStore(
        StorePayPalCheckoutRequest $request,
        OrderFromCartLinesBuilder $builder,
    ): JsonResponse {
        if (! $this->simulateCheckoutEnabled()) {
            abort(404);
        }

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

        $approvalUrl = URL::temporarySignedRoute(
            'checkout.paypal.simulate_return',
            now()->addMinutes(30),
            ['order' => $order->id],
        );

        return response()->json([
            'approval_url' => $approvalUrl,
            'order_number' => $order->order_number,
        ]);
    }

    public function simulateApprove(Request $request, Order $order): RedirectResponse
    {
        if (! $this->simulateCheckoutEnabled()) {
            abort(404);
        }

        $user = $request->user();
        if (! $user->hasRole('client') && ! $user->hasRole('superadmin')) {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'No autorizado para completar este pago de prueba.');
        }

        if ($order->user_id !== $user->id) {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'No se encontró el pedido asociado a tu cuenta.');
        }

        if ($order->status === Order::STATUS_PAID) {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'Este pedido ya estaba registrado como pagado ('.$order->order_number.').');
        }

        if ($order->status !== Order::STATUS_PENDING_PAYMENT) {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'El pedido no está pendiente de pago.');
        }

        $this->finalizeOrderAsPaid(
            $order,
            $user,
            'sim_'.Str::uuid()->toString(),
            'paypal_simulate',
            [
                'simulated' => true,
                'environment' => app()->environment(),
            ],
            app(OrderPaidNotifier::class),
            app(OrderPaidEntitlementProvisioner::class),
            app(OrderPaidSubscriptionProvisioner::class),
            app(OrderPaidLicenseProvisioner::class),
        );

        return redirect()
            ->route('marketing-cart')
            ->with('status', 'Pago confirmado. Pedido '.$order->order_number.'.');
    }

    public function handleReturn(Request $request, PayPalClient $paypal): RedirectResponse
    {
        $token = $request->query('token');
        if (! is_string($token) || $token === '') {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'Respuesta de PayPal incompleta.');
        }

        $order = Order::query()
            ->where('paypal_checkout_order_id', $token)
            ->where('user_id', $request->user()->id)
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

        try {
            $capture = $paypal->captureOrderOrSyncCompleted($token);
        } catch (\Throwable $e) {
            Log::warning('paypal.handle_return_capture_failed', [
                'order_number' => $order->order_number,
                'paypal_order_id' => $token,
                'exception' => $e->getMessage(),
            ]);

            $hint = config('app.debug')
                ? ' Detalle: '.$e->getMessage()
                : '';

            return redirect()
                ->route('marketing-cart')
                ->with(
                    'status',
                    'No se pudo confirmar el pago con PayPal. Pedido '.$order->order_number.'.'
                        .' Puedes reintentar desde el carrito o revisar los logs.'.$hint,
                );
        }

        $captureId = $this->extractCaptureId($capture);
        if ($captureId === null) {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'PayPal devolvió una respuesta sin captura. Pedido '.$order->order_number.'.');
        }

        $status = $capture['status'] ?? '';
        if ($status !== 'COMPLETED') {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'El pago no se completó. Estado: '.(string) $status);
        }

        $this->finalizeOrderAsPaid(
            $order,
            $request->user(),
            $captureId,
            'paypal',
            $capture,
            app(OrderPaidNotifier::class),
            app(OrderPaidEntitlementProvisioner::class),
            app(OrderPaidSubscriptionProvisioner::class),
            app(OrderPaidLicenseProvisioner::class),
        );

        return redirect()
            ->route('marketing-cart')
            ->with('status', 'Pago confirmado. Pedido '.$order->order_number.'.');
    }

    public function cancel(Request $request): RedirectResponse
    {
        $orderId = $request->query('order');
        if (! is_string($orderId) || $orderId === '') {
            return redirect()->route('marketing-cart')->with('status', 'Pago cancelado.');
        }

        $order = Order::query()
            ->whereKey($orderId)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($order !== null && $order->status === Order::STATUS_PENDING_PAYMENT) {
            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'paypal_checkout_order_id' => null,
            ]);
        }

        return redirect()
            ->route('marketing-cart')
            ->with('status', 'Pago cancelado. Puedes volver a intentar cuando quieras.');
    }

    private function simulateCheckoutEnabled(): bool
    {
        if (! config('paypal.simulate_checkout')) {
            return false;
        }

        return app()->environment('local');
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
            $order->update([
                'status' => Order::STATUS_PAID,
                'placed_at' => now(),
            ]);

            Payment::query()->create([
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
     * Convierte el total del pedido a la moneda que acepta PayPal (p. ej. PEN → USD).
     *
     * @return array{0: string, 1: string} [monto "12.34", código ISO]
     */
    private function amountAndCurrencyForPayPal(float $grandTotal, string $orderCurrency): array
    {
        $orderCurrency = strtoupper(trim($orderCurrency));
        $target = (string) config('paypal.checkout_currency', 'USD');

        if ($grandTotal <= 0) {
            throw new \InvalidArgumentException('El total del pedido debe ser mayor a cero.');
        }

        if ($orderCurrency === $target) {
            return [
                number_format($grandTotal, 2, '.', ''),
                $target,
            ];
        }

        if ($orderCurrency === 'PEN' && $target === 'USD') {
            $rate = (float) config('paypal.pen_to_usd_rate', 0.27);
            if ($rate <= 0) {
                throw new \InvalidArgumentException(
                    'Configura PAYPAL_PEN_TO_USD_RATE en .env (valor mayor que 0) para convertir PEN a USD en PayPal.',
                );
            }
            $usd = round($grandTotal * $rate, 2);
            if ($usd < 0.01) {
                throw new \InvalidArgumentException('El monto en USD es demasiado bajo para PayPal.');
            }

            return [number_format($usd, 2, '.', ''), 'USD'];
        }

        throw new \InvalidArgumentException(
            "No hay conversión de {$orderCurrency} a {$target}. Revisa PAYPAL_CHECKOUT_CURRENCY y PAYPAL_PEN_TO_USD_RATE en .env.",
        );
    }

    /**
     * @param  array<string, mixed>  $paypalOrder
     */
    private function extractApproveUrl(array $paypalOrder): ?string
    {
        foreach ($paypalOrder['links'] ?? [] as $link) {
            if (($link['rel'] ?? '') === 'approve') {
                $href = $link['href'] ?? null;

                return is_string($href) && $href !== '' ? $href : null;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $capture
     */
    private function extractCaptureId(array $capture): ?string
    {
        $units = $capture['purchase_units'] ?? [];
        if (! is_array($units) || $units === []) {
            return null;
        }
        $first = $units[0];
        if (! is_array($first)) {
            return null;
        }
        $payments = $first['payments'] ?? [];
        if (! is_array($payments)) {
            return null;
        }
        $captures = $payments['captures'] ?? [];
        if (! is_array($captures) || $captures === []) {
            return null;
        }
        $c = $captures[0];
        if (! is_array($c)) {
            return null;
        }
        $id = $c['id'] ?? null;

        return is_string($id) && $id !== '' ? $id : null;
    }
}
