<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Order extends Model
{
    use HasFactory, HasUuids;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_PENDING_PAYMENT = 'pending_payment';

    public const STATUS_PAID = 'paid';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_REFUNDED = 'refunded';

    protected $table = 'orders';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'order_number',
        'user_id',
        'status',
        'currency',
        'subtotal',
        'discount_total',
        'tax_total',
        'grand_total',
        'coupon_id',
        'billing_snapshot',
        'notes_internal',
        'placed_at',
        'paypal_checkout_order_id',
    ])]
    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'currency',
        'subtotal',
        'discount_total',
        'tax_total',
        'grand_total',
        'coupon_id',
        'billing_snapshot',
        'notes_internal',
        'placed_at',
        'paypal_checkout_order_id',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'billing_snapshot' => 'array',
            'placed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(OrderLine::class, 'order_id');
    }

    public function licenseKeys(): HasMany
    {
        return $this->hasMany(LicenseKey::class, 'order_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'order_id');
    }

    /**
     * Número legible tipo ORV-2026-00001 (secuencia por año, con bloqueo en transacción).
     */
    public static function generateOrderNumber(): string
    {
        return DB::transaction(function () {
            $year = now()->year;
            $prefix = 'ORV-'.$year.'-';

            $last = Order::query()
                ->where('order_number', 'like', $prefix.'%')
                ->orderByDesc('order_number')
                ->lockForUpdate()
                ->first();

            $next = 1;
            if ($last !== null) {
                $suffix = substr($last->order_number, strlen($prefix));
                $next = (int) $suffix + 1;
            }

            return $prefix.str_pad((string) $next, 5, '0', STR_PAD_LEFT);
        });
    }
}
