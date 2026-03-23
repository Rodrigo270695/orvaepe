<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'subscription_items';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'subscription_id',
        'catalog_sku_id',
        'quantity',
        'unit_price',
        'metadata',
    ])]
    protected $fillable = [
        'subscription_id',
        'catalog_sku_id',
        'quantity',
        'unit_price',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function catalogSku(): BelongsTo
    {
        return $this->belongsTo(CatalogSku::class, 'catalog_sku_id');
    }
}
