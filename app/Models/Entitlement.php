<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Entitlement extends Model
{
    use HasFactory, HasUuids;

    public const STATUS_PENDING = 'pending';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_SUSPENDED = 'suspended';

    public const STATUS_REVOKED = 'revoked';

    protected $table = 'entitlements';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'user_id',
        'catalog_product_id',
        'catalog_sku_id',
        'order_id',
        'order_line_id',
        'subscription_id',
        'status',
        'starts_at',
        'ends_at',
        'suspended_at',
        'revoked_at',
        'revoke_reason',
        'feature_flags',
        'metadata',
    ])]
    protected $fillable = [
        'user_id',
        'catalog_product_id',
        'catalog_sku_id',
        'order_id',
        'order_line_id',
        'subscription_id',
        'status',
        'starts_at',
        'ends_at',
        'suspended_at',
        'revoked_at',
        'revoke_reason',
        'feature_flags',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'suspended_at' => 'datetime',
            'revoked_at' => 'datetime',
            'feature_flags' => 'array',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function catalogProduct(): BelongsTo
    {
        return $this->belongsTo(CatalogProduct::class, 'catalog_product_id');
    }

    public function catalogSku(): BelongsTo
    {
        return $this->belongsTo(CatalogSku::class, 'catalog_sku_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function orderLine(): BelongsTo
    {
        return $this->belongsTo(OrderLine::class, 'order_line_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_id');
    }

    public function secrets(): HasMany
    {
        return $this->hasMany(EntitlementSecret::class);
    }

    public function licenseKeys(): HasMany
    {
        return $this->hasMany(LicenseKey::class, 'entitlement_id');
    }
}
