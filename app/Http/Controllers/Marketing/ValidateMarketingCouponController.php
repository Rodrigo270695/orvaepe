<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\CatalogSku;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ValidateMarketingCouponController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:120'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.plan_id' => ['required', 'uuid'],
            'lines.*.qty' => ['required', 'integer', 'min:1'],
        ]);

        $code = trim($data['code']);

        $coupon = Coupon::query()
            ->whereRaw('LOWER(code) = ?', [mb_strtolower($code)])
            ->where('is_active', true)
            ->first();

        if (! $coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Código de cupón no válido o inactivo.',
            ], 422);
        }

        if ($coupon->starts_at && now()->lt($coupon->starts_at)) {
            return response()->json([
                'valid' => false,
                'message' => 'Este cupón aún no está vigente.',
            ], 422);
        }

        if ($coupon->expires_at && now()->gt($coupon->expires_at)) {
            return response()->json([
                'valid' => false,
                'message' => 'Este cupón ha expirado.',
            ], 422);
        }

        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            return response()->json([
                'valid' => false,
                'message' => 'Este cupón ya no tiene usos disponibles.',
            ], 422);
        }

        $eligibleSubtotal = 0.0;

        foreach ($data['lines'] as $line) {
            $sku = CatalogSku::query()->whereKey($line['plan_id'])->first();
            if (! $sku) {
                continue;
            }

            if (! $coupon->appliesToSkuId($sku->id)) {
                continue;
            }

            $eligibleSubtotal += (float) $sku->list_price * (int) $line['qty'];
        }

        if ($eligibleSubtotal <= 0) {
            return response()->json([
                'valid' => false,
                'message' => 'Este cupón no aplica a los productos del carrito.',
            ], 422);
        }

        $discount = 0.0;
        if ($coupon->discount_type === Coupon::DISCOUNT_PERCENT) {
            $discount = round($eligibleSubtotal * ((float) $coupon->discount_value / 100), 2);
        } else {
            $discount = min((float) $coupon->discount_value, $eligibleSubtotal);
        }

        return response()->json([
            'valid' => true,
            'discount_pen' => $discount,
            'eligible_subtotal_pen' => round($eligibleSubtotal, 2),
            'coupon_code' => $coupon->code,
            'discount_type' => $coupon->discount_type,
            'discount_value' => (float) $coupon->discount_value,
        ]);
    }
}
