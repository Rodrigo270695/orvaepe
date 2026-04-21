<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Quote extends Model
{
    use HasFactory, HasUuids;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SENT = 'sent';

    public const STATUS_VIEWED = 'viewed';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_CONVERTED = 'converted';

    protected $table = 'quotes';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'quote_number',
        'user_id',
        'created_by',
        'status',
        'currency',
        'subtotal',
        'discount_total',
        'tax_total',
        'grand_total',
        'title',
        'customer_legal_name',
        'customer_document_type',
        'customer_document_number',
        'customer_email',
        'customer_phone',
        'customer_address',
        'customer_snapshot',
        'billing_snapshot',
        'notes_customer',
        'notes_internal',
        'valid_until',
        'sent_at',
        'responded_at',
        'converted_order_id',
        'public_share_token',
        'metadata',
    ])]
    protected $fillable = [
        'quote_number',
        'user_id',
        'created_by',
        'status',
        'currency',
        'subtotal',
        'discount_total',
        'tax_total',
        'grand_total',
        'title',
        'customer_legal_name',
        'customer_document_type',
        'customer_document_number',
        'customer_email',
        'customer_phone',
        'customer_address',
        'customer_snapshot',
        'billing_snapshot',
        'notes_customer',
        'notes_internal',
        'valid_until',
        'sent_at',
        'responded_at',
        'converted_order_id',
        'public_share_token',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'customer_snapshot' => 'array',
            'billing_snapshot' => 'array',
            'metadata' => 'array',
            'valid_until' => 'date',
            'sent_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function convertedOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'converted_order_id');
    }

    /**
     * @return HasMany<QuoteLine, $this>
     */
    public function lines(): HasMany
    {
        return $this->hasMany(QuoteLine::class, 'quote_id')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * Número legible tipo COT-2026-00001 (secuencia por año, con bloqueo en transacción).
     */
    public static function generateQuoteNumber(): string
    {
        return DB::transaction(function () {
            $year = now()->year;
            $prefix = 'COT-'.$year.'-';

            $last = Quote::query()
                ->where('quote_number', 'like', $prefix.'%')
                ->orderByDesc('quote_number')
                ->lockForUpdate()
                ->first();

            $next = 1;
            if ($last !== null) {
                $suffix = substr($last->quote_number, strlen($prefix));
                $next = (int) $suffix + 1;
            }

            return $prefix.str_pad((string) $next, 5, '0', STR_PAD_LEFT);
        });
    }
}
