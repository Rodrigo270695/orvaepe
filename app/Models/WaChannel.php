<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WaChannel extends Model
{
    use HasUuids;

    public const PRODUCTO_VETSAAS = 'vetsaas';

    public const PRODUCTO_TALLERSAAS = 'tallersaas';

    public const PROVIDER_CLOUD = 'cloud';

    public const PROVIDER_OPENWA = 'openwa';

    public const ESTADO_ACTIVO = 'activo';

    public const ESTADO_PAUSADO = 'pausado';

    /** Conectado por Embedded Signup; se activa cuando Meta aprueba su primera plantilla. */
    public const ESTADO_PENDIENTE = 'pendiente';

    /**
     * @return list<string>
     */
    public static function productos(): array
    {
        return [self::PRODUCTO_VETSAAS, self::PRODUCTO_TALLERSAAS];
    }

    protected $table = 'wa_channels';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'producto',
        'tenant_id',
        'provider',
        'phone_number_id',
        'waba_id',
        'display_phone_number',
        'verified_name',
        'openwa_session_id',
        'access_token',
        'registration_pin',
        'estado',
    ])]
    protected $fillable = [
        'producto',
        'tenant_id',
        'provider',
        'phone_number_id',
        'waba_id',
        'display_phone_number',
        'verified_name',
        'openwa_session_id',
        'access_token',
        'registration_pin',
        'estado',
    ];

    protected $hidden = [
        'access_token',
        'registration_pin',
    ];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'registration_pin' => 'encrypted',
        ];
    }

    /**
     * @param  Builder<WaChannel>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('estado', self::ESTADO_ACTIVO);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WaMessage::class, 'wa_channel_id');
    }
}
