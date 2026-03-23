<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderLine extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'order_lines';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'order_id',
        'catalog_sku_id',
        'product_name_snapshot',
        'sku_name_snapshot',
        'quantity',
        'unit_price',
        'line_discount',
        'tax_amount',
        'line_total',
        'metadata',
    ])]
    protected $fillable = [
        'order_id',
        'catalog_sku_id',
        'product_name_snapshot',
        'sku_name_snapshot',
        'quantity',
        'unit_price',
        'line_discount',
        'tax_amount',
        'line_total',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'line_discount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'line_total' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function sku(): BelongsTo
    {
        return $this->belongsTo(CatalogSku::class, 'catalog_sku_id');
    }

    /**
     * @return HasMany<OemLicenseDelivery, $this>
     */
    public function oemLicenseDeliveries(): HasMany
    {
        return $this->hasMany(OemLicenseDelivery::class, 'order_line_id');
    }
}
