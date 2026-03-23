<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory, HasUuids;

    public const DISCOUNT_PERCENT = 'percent';

    public const DISCOUNT_FIXED = 'fixed';

    protected $table = 'coupons';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'code',
        'discount_type',
        'discount_value',
        'max_uses',
        'used_count',
        'applicable_sku_ids',
        'starts_at',
        'expires_at',
        'is_active',
    ])]
    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'max_uses',
        'used_count',
        'applicable_sku_ids',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'max_uses' => 'integer',
            'used_count' => 'integer',
            'applicable_sku_ids' => 'array',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function appliesToSkuId(?string $catalogSkuId): bool
    {
        if ($catalogSkuId === null) {
            return false;
        }

        $ids = $this->applicable_sku_ids;

        if ($ids === null) {
            return true;
        }

        if ($ids === []) {
            return false;
        }

        return in_array($catalogSkuId, $ids, true);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
