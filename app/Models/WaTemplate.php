<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class WaTemplate extends Model
{
    use HasUuids;

    public const TIPO_VACUNA = 'vacuna';

    public const TIPO_CITA = 'cita';

    public const TIPO_CONTROL = 'control';

    public const ESTADO_PENDIENTE = 'pendiente';

    public const ESTADO_APROBADA = 'aprobada';

    public const ESTADO_RECHAZADA = 'rechazada';

    public const ESTADO_PAUSADA = 'pausada';

    /** Eventos de Meta (message_template_status_update y respuesta al crear) => estado local. */
    private const META_STATUS = [
        'APPROVED' => self::ESTADO_APROBADA,
        'PENDING' => self::ESTADO_PENDIENTE,
        'IN_APPEAL' => self::ESTADO_PENDIENTE,
        'REJECTED' => self::ESTADO_RECHAZADA,
        'DISABLED' => self::ESTADO_RECHAZADA,
        'PAUSED' => self::ESTADO_PAUSADA,
    ];

    protected $table = 'wa_templates';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'producto',
        'tenant_id',
        'waba_id',
        'meta_template_id',
        'nombre',
        'idioma',
        'tipo',
        'estado',
        'categoria',
        'num_variables',
        'cuerpo',
        'motivo',
    ])]
    protected $fillable = [
        'producto',
        'tenant_id',
        'waba_id',
        'meta_template_id',
        'nombre',
        'idioma',
        'tipo',
        'estado',
        'categoria',
        'num_variables',
        'cuerpo',
        'motivo',
    ];

    protected function casts(): array
    {
        return [
            'num_variables' => 'integer',
        ];
    }

    public static function estadoFromMeta(string $metaStatus): ?string
    {
        return self::META_STATUS[strtoupper(trim($metaStatus))] ?? null;
    }

    /**
     * Plantilla aprobada que puede usar el tenant: la propia antes que la global.
     */
    public static function usableBy(string $producto, string $tenantId, string $nombre): ?self
    {
        return self::query()
            ->where('nombre', $nombre)
            ->where('estado', self::ESTADO_APROBADA)
            ->where(fn (Builder $q) => $q
                ->where(fn (Builder $own) => $own->where('producto', $producto)->where('tenant_id', $tenantId))
                ->orWhere(fn (Builder $global) => $global->whereNull('tenant_id')
                    ->where(fn (Builder $p) => $p->whereNull('producto')->orWhere('producto', $producto))))
            ->orderByRaw('case when tenant_id is null then 1 else 0 end')
            ->first();
    }

    /**
     * Texto armado reemplazando {{n}} por la variable n (para canales OpenWA).
     *
     * @param  list<string>  $variables
     */
    public function render(array $variables): ?string
    {
        if (! is_string($this->cuerpo) || $this->cuerpo === '') {
            return null;
        }

        return preg_replace_callback(
            '/\{\{(\d+)\}\}/',
            fn (array $m): string => $variables[(int) $m[1] - 1] ?? '',
            $this->cuerpo,
        );
    }
}
