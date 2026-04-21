<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteLine extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'quote_lines';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'quote_id',
        'catalog_sku_id',
        'catalog_product_id',
        'product_name_snapshot',
        'sku_name_snapshot',
        'quantity',
        'unit_price',
        'tax_included',
        'igv_applies',
        'tax_rate',
        'line_discount',
        'line_discount_percent',
        'tax_amount',
        'line_total',
        'sort_order',
        'metadata',
    ])]
    protected $fillable = [
        'quote_id',
        'catalog_sku_id',
        'catalog_product_id',
        'product_name_snapshot',
        'sku_name_snapshot',
        'quantity',
        'unit_price',
        'tax_included',
        'igv_applies',
        'tax_rate',
        'line_discount',
        'line_discount_percent',
        'tax_amount',
        'line_total',
        'sort_order',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'tax_included' => 'boolean',
            'igv_applies' => 'boolean',
            'tax_rate' => 'decimal:4',
            'line_discount' => 'decimal:2',
            'line_discount_percent' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'line_total' => 'decimal:2',
            'sort_order' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class, 'quote_id');
    }

    public function sku(): BelongsTo
    {
        return $this->belongsTo(CatalogSku::class, 'catalog_sku_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(CatalogProduct::class, 'catalog_product_id');
    }
}
