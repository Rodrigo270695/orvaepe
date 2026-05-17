<?php

declare(strict_types=1);

namespace App\Services\Checkout;

use App\Models\Order;
use App\Models\User;
use App\Support\Checkout\SaasCatalogSku;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/**
 * Confirma pedidos SaaS con total cero sin pasarela de pago.
 */
final class FreeSaasCheckoutHandler
{
    public function __construct(
        private readonly OrderCheckoutFinalizer $finalizer,
    ) {}

    public function isFreeOrder(Order $order): bool
    {
        return (float) $order->grand_total <= 0;
    }

    public function finalize(Order $order, User $user): void
    {
        $order->loadMissing(['lines.sku']);

        if (! $this->isFreeOrder($order)) {
            throw ValidationException::withMessages([
                'lines' => 'Este pedido requiere pago por pasarela.',
            ]);
        }

        $skus = $order->lines
            ->map(fn ($line) => $line->sku)
            ->filter()
            ->values();

        if (! SaasCatalogSku::collectionQualifiesForZeroTotalCheckout($skus)) {
            throw ValidationException::withMessages([
                'lines' => 'El checkout gratuito solo aplica a planes SaaS (VetSaaS o Aula Virtual).',
            ]);
        }

        $this->finalizer->finalizeAsPaid(
            $order,
            $user,
            'free',
            'free:'.$order->id,
            ['source' => 'marketing_cart', 'grand_total' => 0],
            ['completed' => true],
        );
    }

    public function completedJson(Order $order): JsonResponse
    {
        return response()->json([
            'free_checkout' => true,
            'completed' => true,
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'message' => 'Pedido confirmado. Revisa tu correo con el acceso a tu plataforma.',
        ]);
    }

    public function tryFinalizeAndRespond(Order $order, User $user): ?JsonResponse
    {
        if (! $this->isFreeOrder($order)) {
            return null;
        }

        $this->finalize($order, $user);

        return $this->completedJson($order->fresh());
    }
}
