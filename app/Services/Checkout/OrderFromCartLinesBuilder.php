<?php

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\User;
use App\Support\Sales\PeruIgvLineCalculator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Crea un pedido en pending_payment a partir de líneas tipo carrito marketing (plan_id = catalog_sku id).
 */
final class OrderFromCartLinesBuilder
{
    /**
     * @param  list<array{plan_id: string, qty: int}>  $lines
     */
    public function createPendingOrder(User $user, array $lines, ?string $couponCode): Order
    {
        if ($lines === []) {
            throw ValidationException::withMessages(['lines' => 'El carrito está vacío.']);
        }

        $merged = [];
        foreach ($lines as $line) {
            $skuId = $line['plan_id'];
            $qty = (int) $line['qty'];
            if ($qty < 1) {
                continue;
            }
            if (! isset($merged[$skuId])) {
                $merged[$skuId] = 0;
            }
            $merged[$skuId] += $qty;
        }

        if ($merged === []) {
            throw ValidationException::withMessages(['lines' => 'Cantidades inválidas.']);
        }

        $skuIds = array_keys($merged);
        $skus = CatalogSku::query()
            ->with('product:id,name')
            ->whereIn('id', $skuIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        foreach ($merged as $skuId => $qty) {
            if (! $skus->has($skuId)) {
                throw ValidationException::withMessages([
                    'lines' => 'Uno o más productos no están disponibles en el catálogo.',
                ]);
            }
        }

        $currency = null;
        foreach ($merged as $skuId => $qty) {
            $sku = $skus->get($skuId);
            $c = strtoupper((string) $sku->currency);
            if ($currency === null) {
                $currency = $c;
            }
            if ($c !== $currency) {
                throw ValidationException::withMessages([
                    'lines' => 'Todos los ítems deben usar la misma moneda.',
                ]);
            }
        }

        $currency = (string) $currency;

        $subtotal = 0.0;
        $taxTotal = 0.0;
        $lineTotalSum = 0.0;
        $lineRows = [];

        foreach ($merged as $skuId => $qty) {
            $sku = $skus->get($skuId);
            $unit = (float) $sku->list_price;
            $amounts = PeruIgvLineCalculator::forLine(
                $qty,
                $unit,
                (bool) $sku->tax_included,
                null,
                (bool) ($sku->igv_applies ?? true),
            );

            $subtotal += $amounts->baseLine;
            $taxTotal += $amounts->taxLine;
            $lineTotalSum += $amounts->lineTotal;

            $productName = $sku->product?->name ?? '—';
            $lineRows[] = [
                'catalog_sku_id' => $sku->id,
                'product_name_snapshot' => $productName,
                'sku_name_snapshot' => $sku->name,
                'quantity' => $qty,
                'unit_price' => round($unit, 2),
                'line_discount' => 0.0,
                'tax_amount' => $amounts->taxLine,
                'line_total' => round($amounts->lineTotal, 2),
                'metadata' => [
                    'tax_included' => (bool) $sku->tax_included,
                    'igv_applies' => (bool) ($sku->igv_applies ?? true),
                    'igv_rate' => (float) config('sales.igv_rate', 0.18),
                ],
            ];
        }

        $subtotal = round($subtotal, 2);
        $taxTotal = round($taxTotal, 2);
        $lineTotalSum = round($lineTotalSum, 2);

        $coupon = null;
        $discountTotal = 0.0;
        $trimCode = $couponCode !== null ? trim($couponCode) : '';

        if ($trimCode !== '') {
            $coupon = Coupon::query()
                ->whereRaw('LOWER(code) = ?', [mb_strtolower($trimCode)])
                ->where('is_active', true)
                ->first();

            if (! $coupon) {
                throw ValidationException::withMessages([
                    'coupon_code' => 'Cupón no válido o inactivo.',
                ]);
            }

            if ($coupon->starts_at && now()->lt($coupon->starts_at)) {
                throw ValidationException::withMessages(['coupon_code' => 'Este cupón aún no está vigente.']);
            }
            if ($coupon->expires_at && now()->gt($coupon->expires_at)) {
                throw ValidationException::withMessages(['coupon_code' => 'Este cupón ha expirado.']);
            }
            if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
                throw ValidationException::withMessages(['coupon_code' => 'Este cupón ya no tiene usos disponibles.']);
            }

            $eligibleSubtotal = 0.0;
            foreach ($merged as $skuId => $qty) {
                $sku = $skus->get($skuId);
                if (! $coupon->appliesToSkuId($sku->id)) {
                    continue;
                }
                $eligibleSubtotal += (float) $sku->list_price * $qty;
            }

            if ($eligibleSubtotal <= 0) {
                throw ValidationException::withMessages([
                    'coupon_code' => 'Este cupón no aplica a los productos del carrito.',
                ]);
            }

            if ($coupon->discount_type === Coupon::DISCOUNT_PERCENT) {
                $discountTotal = round($eligibleSubtotal * ((float) $coupon->discount_value / 100), 2);
            } else {
                $discountTotal = min((float) $coupon->discount_value, $eligibleSubtotal);
            }
        }

        $discountTotal = round($discountTotal, 2);
        $grandTotal = round(max(0.0, $lineTotalSum - $discountTotal), 2);

        if ($grandTotal <= 0) {
            throw ValidationException::withMessages([
                'lines' => 'El total a pagar debe ser mayor a cero.',
            ]);
        }

        return DB::transaction(function () use ($user, $lineRows, $subtotal, $taxTotal, $discountTotal, $grandTotal, $currency, $coupon) {
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user->id,
                'status' => Order::STATUS_PENDING_PAYMENT,
                'currency' => $currency,
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'grand_total' => $grandTotal,
                'coupon_id' => $coupon?->id,
                'billing_snapshot' => null,
                'notes_internal' => 'Checkout PayPal (marketing)',
                'placed_at' => null,
            ]);

            foreach ($lineRows as $row) {
                OrderLine::create(array_merge($row, ['order_id' => $order->id]));
            }

            return $order->fresh(['lines']);
        });
    }
}
