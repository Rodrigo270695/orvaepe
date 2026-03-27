<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LicenseKey extends Model
{
    use HasFactory, HasUuids;

    /** Alta manual: editable y eliminable hasta activar. */
    public const STATUS_DRAFT = 'draft';

    /** Pago confirmado; clave real pendiente de cargar por el admin. */
    public const STATUS_PENDING = 'pending';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_REVOKED = 'revoked';

    /** metadata.created_via — licencia alta manual desde el panel admin. */
    public const CREATED_VIA_ADMIN_MANUAL = 'admin_manual';

    /** metadata.created_via — generada al marcar el pedido como pagado (checkout). */
    public const CREATED_VIA_ORDER_PAYMENT = 'order_payment';

    protected $table = 'license_keys';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'key',
        'user_id',
        'order_id',
        'catalog_sku_id',
        'software_release_id',
        'entitlement_id',
        'status',
        'max_activations',
        'activation_count',
        'expires_at',
        'revoked_at',
        'revoke_reason',
        'metadata',
    ])]
    protected $fillable = [
        'key',
        'user_id',
        'order_id',
        'catalog_sku_id',
        'software_release_id',
        'entitlement_id',
        'status',
        'max_activations',
        'activation_count',
        'expires_at',
        'revoked_at',
        'revoke_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function catalogSku(): BelongsTo
    {
        return $this->belongsTo(CatalogSku::class, 'catalog_sku_id');
    }

    public function softwareRelease(): BelongsTo
    {
        return $this->belongsTo(SoftwareRelease::class, 'software_release_id');
    }

    public function entitlement(): BelongsTo
    {
        return $this->belongsTo(Entitlement::class, 'entitlement_id');
    }

    public function activations(): HasMany
    {
        return $this->hasMany(LicenseActivation::class, 'license_key_id');
    }

    public function revoke(?string $reason = null): void
    {
        $this->forceFill([
            'status' => self::STATUS_REVOKED,
            'revoked_at' => now(),
            'revoke_reason' => $reason,
        ])->save();
    }

    public function isRevoked(): bool
    {
        return $this->status === self::STATUS_REVOKED;
    }

    public function isCreatedViaAdminManual(): bool
    {
        if (($this->metadata['created_via'] ?? null) === self::CREATED_VIA_ADMIN_MANUAL) {
            return true;
        }

        // Legacy: filas sin pedido y sin metadata (antes de guardar created_via).
        return $this->order_id === null && empty($this->metadata);
    }

    public function isPendingOrderFulfillment(): bool
    {
        return $this->status === self::STATUS_PENDING
            && ($this->metadata['created_via'] ?? null) === self::CREATED_VIA_ORDER_PAYMENT;
    }

    public function isFromOrderPayment(): bool
    {
        return ($this->metadata['created_via'] ?? null) === self::CREATED_VIA_ORDER_PAYMENT;
    }
}
