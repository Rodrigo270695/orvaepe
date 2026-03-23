<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatalogSku extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'catalog_skus';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'catalog_product_id',
        'code',
        'name',
        'sale_model',
        'billing_interval',
        'rental_days',
        'list_price',
        'currency',
        'tax_included',
        'igv_applies',
        'limits',
        'fulfillment_type',
        'metadata',
        'is_active',
        'sort_order',
    ])]
    protected $fillable = [
        'catalog_product_id',
        'code',
        'name',
        'sale_model',
        'billing_interval',
        'rental_days',
        'list_price',
        'currency',
        'tax_included',
        'igv_applies',
        'limits',
        'fulfillment_type',
        'metadata',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'list_price' => 'decimal:2',
            'tax_included' => 'boolean',
            'igv_applies' => 'boolean',
            'limits' => 'array',
            'metadata' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'rental_days' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(CatalogProduct::class, 'catalog_product_id');
    }

    public function orderLines(): HasMany
    {
        return $this->hasMany(OrderLine::class, 'catalog_sku_id');
    }

    public function subscriptionItems(): HasMany
    {
        return $this->hasMany(SubscriptionItem::class, 'catalog_sku_id');
    }

    public function entitlements(): HasMany
    {
        return $this->hasMany(Entitlement::class, 'catalog_sku_id');
    }

    public function licenseKeys(): HasMany
    {
        return $this->hasMany(LicenseKey::class, 'catalog_sku_id');
    }
}

