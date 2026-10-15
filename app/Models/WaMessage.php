<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WaMessage extends Model
{
    use HasUuids;

    public const DIRECCION_OUT = 'out';

    public const DIRECCION_IN = 'in';

    public const ESTADO_QUEUED = 'queued';

    public const ESTADO_ACCEPTED = 'accepted';

    public const ESTADO_SENT = 'sent';

    public const ESTADO_DELIVERED = 'delivered';

    public const ESTADO_READ = 'read';

    public const ESTADO_FAILED = 'failed';

    public const ESTADO_RECEIVED = 'received';

    /** Estados que Meta informa en value.statuses[]. */
    public const PROVIDER_STATUSES = [
        self::ESTADO_SENT,
        self::ESTADO_DELIVERED,
        self::ESTADO_READ,
        self::ESTADO_FAILED,
    ];

    /** Meta puede entregar los estados desordenados: nunca retrocedemos (read no vuelve a delivered). */
    private const STATUS_RANK = [
        self::ESTADO_QUEUED => 0,
        self::ESTADO_ACCEPTED => 1,
        self::ESTADO_SENT => 2,
        self::ESTADO_DELIVERED => 3,
        self::ESTADO_READ => 4,
        self::ESTADO_FAILED => 5,
    ];

    protected $table = 'wa_messages';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'wa_channel_id',
        'producto',
        'tenant_id',
        'reminder_id',
        'provider_msg_id',
        'telefono',
        'direccion',
        'categoria',
        'plantilla',
        'idioma',
        'estado',
        'error_code',
        'error_msg',
        'texto',
        'sent_at',
        'delivered_at',
        'read_at',
        'failed_at',
    ])]
    protected $fillable = [
        'wa_channel_id',
        'producto',
        'tenant_id',
        'reminder_id',
        'provider_msg_id',
        'telefono',
        'direccion',
        'categoria',
        'plantilla',
        'idioma',
        'estado',
        'error_code',
        'error_msg',
        'texto',
        'sent_at',
        'delivered_at',
        'read_at',
        'failed_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'read_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(WaChannel::class, 'wa_channel_id');
    }

    public function applyProviderStatus(
        string $estado,
        \DateTimeInterface $at,
        ?string $errorCode = null,
        ?string $errorMsg = null,
    ): void {
        $this->{$estado.'_at'} = $at;

        if ($estado === self::ESTADO_FAILED) {
            $this->estado = self::ESTADO_FAILED;
            $this->error_code = $errorCode !== null ? Str::limit($errorCode, 32, '') : null;
            $this->error_msg = $errorMsg !== null ? Str::limit($errorMsg, 500, '') : null;
        } elseif ((self::STATUS_RANK[$estado] ?? 0) > (self::STATUS_RANK[$this->estado] ?? 0)) {
            $this->estado = $estado;
        }

        $this->save();
    }
}
