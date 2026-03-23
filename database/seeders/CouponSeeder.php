<?php

namespace Database\Seeders;

use App\Models\CatalogSku;
use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Cupones de ejemplo: descuento global, fijo y restringido a SKUs SaaS.
 */
class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $saasErpId = CatalogSku::query()->where('code', 'saas_erp_mini_monthly')->value('id');
        $saasRrhhId = CatalogSku::query()->where('code', 'saas_rrhh_monthly')->value('id');
        $saasSkuIds = array_values(array_filter([$saasErpId, $saasRrhhId]));

        $rows = [
            [
                'code' => 'ORVAE10',
                'discount_type' => Coupon::DISCOUNT_PERCENT,
                'discount_value' => 10,
                'max_uses' => null,
                'used_count' => 0,
                'applicable_sku_ids' => null,
                'starts_at' => Carbon::now()->subDay(),
                'expires_at' => Carbon::now()->addYear(),
                'is_active' => true,
            ],
            [
                'code' => 'PRIMER50',
                'discount_type' => Coupon::DISCOUNT_FIXED,
                'discount_value' => 50,
                'max_uses' => 100,
                'used_count' => 0,
                'applicable_sku_ids' => null,
                'starts_at' => Carbon::now()->subWeek(),
                'expires_at' => Carbon::now()->addMonths(6),
                'is_active' => true,
            ],
        ];

        if ($saasSkuIds !== []) {
            $rows[] = [
                'code' => 'SAAS15',
                'discount_type' => Coupon::DISCOUNT_PERCENT,
                'discount_value' => 15,
                'max_uses' => null,
                'used_count' => 0,
                'applicable_sku_ids' => $saasSkuIds,
                'starts_at' => Carbon::now()->subDay(),
                'expires_at' => null,
                'is_active' => true,
            ];
        }

        foreach ($rows as $data) {
            Coupon::query()->firstOrCreate(
                ['code' => $data['code']],
                $data,
            );
        }
    }
}
