<?php

namespace App\Services\Checkout;

use App\Models\CatalogSku;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\User;
use App\Support\Checkout\SaasCatalogSku;
use App\Support\Sales\PeruIgvLineCalculator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Crea un pedido en pending_payment a partir de líneas tipo carrito marketing (plan_id = catalog_sku id).
 */
final class OrderFromCartLinesBuilder
{
    public function __construct(
        private readonly SaasDuplicateCheckoutGuard $duplicateCheckoutGuard,
        private readonly VetSaaSComprobantesOverageClient $comprobantesOverageClient,
        private readonly VetSaaSRenewalBillingClient $renewalBillingClient,
    ) {}

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

        $this->duplicateCheckoutGuard->assertCanCheckout($user, $skus->values());

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

        $renewTenantSlug = session('vetsaas_renew_tenant_slug');
        $renewTenantSlug = is_string($renewTenantSlug) ? trim($renewTenantSlug) : '';
        $hasVetsaasRenewal = $renewTenantSlug !== ''
            && $skus->contains(fn (CatalogSku $sku): bool => SaasCatalogSku::isVetsaas($sku));

        $renewalBilling = $hasVetsaasRenewal
            ? $this->renewalBillingClient->forTenantSlug($renewTenantSlug)
            : null;
        $renewalPlanAmount = is_array($renewalBilling) && ($renewalBilling['applies'] ?? false)
            ? round((float) ($renewalBilling['plan_amount'] ?? 0), 2)
            : 0.0;

        $resolveUnitPrice = function (CatalogSku $sku) use ($renewalPlanAmount): float {
            if ($renewalPlanAmount > 0 && SaasCatalogSku::isVetsaas($sku)) {
                return $renewalPlanAmount;
            }

            return (float) $sku->list_price;
        };

        $subtotal = 0.0;
        $taxTotal = 0.0;
        $lineTotalSum = 0.0;
        $lineRows = [];

        foreach ($merged as $skuId => $qty) {
            $sku = $skus->get($skuId);
            $unit = $resolveUnitPrice($sku);
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
                $eligibleSubtotal += $resolveUnitPrice($sku) * $qty;
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

        $comprobantesOverageMeta = null;
        if ($hasVetsaasRenewal) {
            if (is_array($renewalBilling) && is_array($renewalBilling['addons'] ?? null)) {
                foreach ($renewalBilling['addons'] as $addon) {
                    if (! is_array($addon)) {
                        continue;
                    }
                    $addonAmount = round((float) ($addon['amount'] ?? 0), 2);
                    if ($addonAmount <= 0) {
                        continue;
                    }
                    $lineRows[] = [
                        'catalog_sku_id' => null,
                        'product_name_snapshot' => 'VetSaaS',
                        'sku_name_snapshot' => (string) ($addon['label'] ?? 'Add-on VetSaaS'),
                        'quantity' => 1,
                        'unit_price' => $addonAmount,
                        'line_discount' => 0.0,
                        'tax_amount' => 0.0,
                        'line_total' => $addonAmount,
                        'metadata' => [
                            'type' => 'vetsaas_renewal_addon',
                            'addon_key' => (string) ($addon['key'] ?? 'addon'),
                            'tenant_slug' => $renewTenantSlug,
                            'igv_applies' => false,
                        ],
                    ];
                    $subtotal = round($subtotal + $addonAmount, 2);
                    $lineTotalSum = round($lineTotalSum + $addonAmount, 2);
                }
            }

            $overageResponse = $this->comprobantesOverageClient->forTenantSlug($renewTenantSlug);
            if (is_array($overageResponse) && ($overageResponse['applies'] ?? false)) {
                $overageAmount = round((float) ($overageResponse['overage_cost'] ?? 0), 2);
                if ($overageAmount > 0) {
                    $comprobantesOverageMeta = $overageResponse;
                    $lineRows[] = [
                        'catalog_sku_id' => null,
                        'product_name_snapshot' => 'VetSaaS',
                        'sku_name_snapshot' => (string) ($overageResponse['description'] ?? 'Comprobantes electrónicos adicionales'),
                        'quantity' => 1,
                        'unit_price' => $overageAmount,
                        'line_discount' => 0.0,
                        'tax_amount' => 0.0,
                        'line_total' => $overageAmount,
                        'metadata' => [
                            'type' => 'vetsaas_comprobantes_overage',
                            'tenant_slug' => $renewTenantSlug,
                            'used' => $overageResponse['used'] ?? null,
                            'included' => $overageResponse['included'] ?? null,
                            'overage_blocks' => $overageResponse['overage_blocks'] ?? null,
                            'igv_applies' => false,
                        ],
                    ];
                    $subtotal = round($subtotal + $overageAmount, 2);
                    $lineTotalSum = round($lineTotalSum + $overageAmount, 2);
                }
            }
        }

        $grandTotal = round(max(0.0, $lineTotalSum - $discountTotal), 2);

        $renewalBillableTotal = is_array($renewalBilling)
            ? round((float) ($renewalBilling['total_amount'] ?? 0), 2)
            : 0.0;

        if (
            $grandTotal <= 0
            && $renewalBillableTotal <= 0
            && ! SaasCatalogSku::collectionQualifiesForZeroTotalCheckout($skus->values())
        ) {
            throw ValidationException::withMessages([
                'lines' => 'El total a pagar debe ser mayor a cero.',
            ]);
        }

        $notesInternal = $grandTotal <= 0
            ? 'Checkout marketing (plan SaaS gratuito)'
            : 'Checkout marketing (carrito)';

        $billingSnapshot = null;
        if ($renewTenantSlug !== '') {
            $billingSnapshot = [
                'vetsaas_renew_tenant_slug' => $renewTenantSlug,
            ];
            if ($comprobantesOverageMeta !== null) {
                $billingSnapshot['vetsaas_comprobantes_overage'] = $comprobantesOverageMeta;
            }
            $notesInternal .= ' | Renovación VetSaaS: '.$renewTenantSlug;
        }

        return DB::transaction(function () use ($user, $lineRows, $subtotal, $taxTotal, $discountTotal, $grandTotal, $currency, $coupon, $notesInternal, $billingSnapshot) {
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
                'billing_snapshot' => $billingSnapshot,
                'notes_internal' => $notesInternal,
                'placed_at' => null,
            ]);

            foreach ($lineRows as $row) {
                OrderLine::create(array_merge($row, ['order_id' => $order->id]));
            }

            return $order->fresh(['lines']);
        });
    }
}
