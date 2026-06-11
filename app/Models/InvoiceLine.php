<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceLine extends Model
{
    use HasUuids;

    protected $table = 'invoice_lines';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'unit_price',
        'tax_rate',
        'line_total',
        'sunat_product_code',
        'igv_affectation_code',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'quantity'   => 'decimal:4',
            'unit_price' => 'decimal:2',
            'tax_rate'   => 'decimal:4',
            'line_total' => 'decimal:2',
            'metadata'   => 'array',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
