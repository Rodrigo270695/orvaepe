<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
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
     * Plantilla aprobada que puede usar el canal: la propia del tenant antes que la global.
     * En canales Cloud la plantilla debe existir en la WABA del canal (Meta envía por nombre).
     */
    public static function usableBy(WaChannel $channel, string $nombre): ?self
    {
        return self::query()
            ->where('nombre', $nombre)
            ->where('estado', self::ESTADO_APROBADA)
            ->where(fn (Builder $q) => $q
                ->where(fn (Builder $own) => $own->where('producto', $channel->producto)->where('tenant_id', $channel->tenant_id))
                ->orWhere(fn (Builder $global) => $global->whereNull('tenant_id')
                    ->where(fn (Builder $p) => $p->whereNull('producto')->orWhere('producto', $channel->producto))))
            ->when($channel->provider === WaChannel::PROVIDER_CLOUD, fn (Builder $q) => $q
                ->where(fn (Builder $waba) => $waba->whereNull('waba_id')->orWhere('waba_id', $channel->waba_id)))
            ->orderByRaw('case when tenant_id is null then 1 else 0 end')
            ->first();
    }

    /**
     * Plantillas propias del tenant en la WABA de su canal (cualquier estado), para mostrar su avance.
     *
     * @return Collection<int, WaTemplate>
     */
    public static function ownTemplatesFor(WaChannel $channel): Collection
    {
        return self::query()
            ->where('producto', $channel->producto)
            ->where('tenant_id', $channel->tenant_id)
            ->when($channel->waba_id !== null, fn (Builder $q) => $q->where('waba_id', $channel->waba_id))
            ->orderBy('nombre')
            ->get();
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
