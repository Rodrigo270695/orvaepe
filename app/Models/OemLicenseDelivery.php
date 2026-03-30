<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OemLicenseDelivery extends Model
{
    use HasFactory, HasUuids;

    public const STATUS_PENDING = 'pending';

    public const STATUS_DELIVERED = 'delivered';

    public const STATUS_REVOKED = 'revoked';

    protected $table = 'oem_license_deliveries';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'order_line_id',
        'license_key_id',
        'vendor',
        'license_code',
        'activation_payload',
        'delivered_at',
        'expires_at',
        'status',
        'metadata',
    ])]
    protected $fillable = [
        'order_line_id',
        'vendor',
        'license_code',
        'activation_payload',
        'delivered_at',
        'expires_at',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'delivered_at' => 'datetime',
            'expires_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function orderLine(): BelongsTo
    {
        return $this->belongsTo(OrderLine::class, 'order_line_id');
    }

    public function licenseKey(): BelongsTo
    {
        return $this->belongsTo(LicenseKey::class, 'license_key_id');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isDelivered(): bool
    {
        return $this->status === self::STATUS_DELIVERED;
    }

    public function isRevoked(): bool
    {
        return $this->status === self::STATUS_REVOKED;
    }
}
