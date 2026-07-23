<?php

namespace App\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\StorePayPalCheckoutRequest;
use App\Models\Order;
use App\Models\User;
use App\Services\Checkout\FreeSaasCheckoutHandler;
use App\Services\Checkout\OrderCheckoutFinalizer;
use App\Services\Checkout\OrderFromCartLinesBuilder;
use App\Services\Payments\CulqiClient;
use App\Services\Payments\CulqiRememberCardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutCulqiController extends Controller
{
    public function store(
        StorePayPalCheckoutRequest $request,
        OrderFromCartLinesBuilder $builder,
        FreeSaasCheckoutHandler $freeSaasCheckout,
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

        if ($response = $freeSaasCheckout->tryFinalizeAndRespond($order, $user)) {
            return $response;
        }

        if (! $this->culqiEnabled()) {
            $order->delete();

            return response()->json([
                'message' => 'Culqi no está configurado todavía. Revisa llaves en .env.',
            ], 422);
        }

        return response()->json([
            'approval_url' => route('checkout.culqi.show', ['order' => $order->id], true),
            'order_number' => $order->order_number,
            'inline_checkout' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'amount_cents' => (int) round(((float) $order->grand_total) * 100),
                'currency' => (string) $order->currency,
                'email' => (string) $user->email,
                'public_key' => (string) config('culqi.public_key'),
                'checkout_script_url' => (string) config('culqi.checkout_script_url', 'https://js.culqi.com/checkout-js'),
                'commerce_name' => (string) config('app.name', 'ORVAE'),
            ],
        ]);
    }

    public function show(Request $request, Order $order): Response|RedirectResponse
    {
        $user = $request->user();
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

        return Inertia::render('checkout/culqi', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'grand_total' => (float) $order->grand_total,
                'currency' => $order->currency,
                'email' => (string) $user->email,
            ],
            'culqi' => [
                'enabled' => $this->culqiEnabled(),
                'publicKey' => (string) config('culqi.public_key'),
                'checkoutScriptUrl' => (string) config('culqi.checkout_script_url', 'https://checkout.culqi.com/js/v4'),
                'commerceName' => (string) config('app.name', 'ORVAE'),
            ],
        ]);
    }

    public function charge(
        Request $request,
        Order $order,
        CulqiClient $culqi,
        CulqiRememberCardService $rememberCard,
        OrderCheckoutFinalizer $checkoutFinalizer,
    ): RedirectResponse {
        $user = $request->user();
        if ($order->user_id !== $user->id) {
            return redirect()
                ->route('marketing-cart')
                ->with('status', 'No autorizado para completar este pago.');
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

        $validated = $request->validate([
            'token_id' => ['required', 'string', 'max:200'],
            'remember_card' => ['nullable', 'boolean'],
        ]);

        $tokenId = trim((string) $validated['token_id']);
        if ($tokenId === '') {
            return redirect()
                ->route('checkout.culqi.show', ['order' => $order->id])
                ->with('status', 'Token de Culqi inválido.');
        }

        $amountCents = (int) round(((float) $order->grand_total) * 100);
        if ($amountCents <= 0) {
            return redirect()
                ->route('checkout.culqi.show', ['order' => $order->id])
                ->with('status', 'El monto del pedido no es válido para Culqi.');
        }

        // Default ON: si no viene el campo, se intenta recordar (solo aplica a tarjeta).
        $wantRemember = array_key_exists('remember_card', $validated)
            ? (bool) $validated['remember_card']
            : true;

        $vault = $rememberCard->resolveChargeSource($user, $tokenId, $wantRemember);

        $payload = [
            'amount' => $amountCents,
            'currency_code' => strtoupper((string) $order->currency),
            'email' => (string) $user->email,
            'source_id' => $vault['source_id'],
            'description' => 'Pedido '.$order->order_number,
            'capture' => true,
            'metadata' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'remember_card' => $vault['remembered'] ? '1' : '0',
                'remember_skipped' => $vault['skipped_reason'] ?? '',
            ],
        ];

        try {
            $charge = $culqi->createCharge($payload);
        } catch (\Throwable $e) {
            return redirect()
                ->route('checkout.culqi.show', ['order' => $order->id])
                ->with('status', 'No se pudo procesar el cobro con Culqi: '.$e->getMessage());
        }

        $gatewayPaymentId = (string) ($charge['id'] ?? '');
        if ($gatewayPaymentId === '') {
            return redirect()
                ->route('checkout.culqi.show', ['order' => $order->id])
                ->with('status', 'Culqi no devolvió identificador de cobro.');
        }

        if (! $this->isChargeApproved($charge)) {
            $message = (string) data_get($charge, 'outcome.user_message', '');
            if ($message === '') {
                $message = (string) data_get($charge, 'outcome.merchant_message', '');
            }
            if ($message === '') {
                $message = 'El cobro fue rechazado por Culqi.';
            }

            return redirect()
                ->route('checkout.culqi.show', ['order' => $order->id])
                ->with('status', $message);
        }

        $checkoutFinalizer->finalizeAsPaid(
            $order,
            $user,
            'culqi',
            $gatewayPaymentId,
            $payload,
            $charge,
            $vault['remembered'] ? [
                'customer_id' => $vault['customer_id'],
                'card_id' => $vault['card_id'],
            ] : null,
        );

        $status = 'Pago confirmado con Culqi. Pedido '.$order->order_number.'.';
        if ($vault['remembered']) {
            $status .= ' Guardamos tu tarjeta para renovaciones automáticas.';
        } elseif ($wantRemember && ($vault['skipped_reason'] ?? null) === 'not_card') {
            $status .= ' Yape/billetera no se puede guardar; la próxima renovación será manual.';
        }

        return redirect()
            ->route('marketing-cart')
            ->with('status', $status);
    }

    private function culqiEnabled(): bool
    {
        return trim((string) config('culqi.public_key')) !== ''
            && trim((string) config('culqi.secret_key')) !== '';
    }

    /**
     * @param  array<string, mixed>  $charge
     */
    private function isChargeApproved(array $charge): bool
    {
        if (($charge['paid'] ?? false) === true) {
            return true;
        }

        $status = strtolower((string) ($charge['status'] ?? ''));
        if (in_array($status, ['paid', 'captured', 'succeeded'], true)) {
            return true;
        }

        $outcomeType = strtolower((string) data_get($charge, 'outcome.type', ''));

        return $outcomeType === 'venta_exitosa';
    }

}
