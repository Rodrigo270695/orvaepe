<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Chat de un prospecto con una línea de ventas de ORVAE (Centro de Ventas).
 */
class SalesHubConversation extends Model
{
    use HasUuids;

    public const PAUSA_MANUAL = 'manual';

    public const PAUSA_AUTO = 'auto';

    protected $fillable = [
        'openwa_line_id',
        'wa_chat_id',
        'phone',
        'nombre',
        'producto',
        'bot_activo',
        'pausa',
        'pausa_motivo',
        'pausado_at',
        'bot_engaged_at',
        'no_leidos',
        'last_inbound_at',
        'last_outbound_at',
    ];

    protected $attributes = [
        'bot_activo' => true,
        'no_leidos' => 0,
    ];

    protected function casts(): array
    {
        return [
            'bot_activo' => 'boolean',
            'no_leidos' => 'integer',
            'pausado_at' => 'datetime',
            'bot_engaged_at' => 'datetime',
            'last_inbound_at' => 'datetime',
            'last_outbound_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<OpenWaLine, $this>
     */
    public function line(): BelongsTo
    {
        return $this->belongsTo(OpenWaLine::class, 'openwa_line_id');
    }

    /**
     * @return HasMany<SalesHubMessage, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(SalesHubMessage::class);
    }

    /**
     * @return HasOne<SalesHubMessage, $this>
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(SalesHubMessage::class)->latestOfMany('id');
    }

    public function pause(string $tipo, string $motivo): void
    {
        $this->forceFill([
            'bot_activo' => false,
            'pausa' => $tipo,
            'pausa_motivo' => mb_substr($motivo, 0, 60),
            'pausado_at' => now(),
        ])->save();
    }

    public function resume(): void
    {
        $this->forceFill([
            'bot_activo' => true,
            'pausa' => null,
            'pausa_motivo' => null,
            'pausado_at' => null,
        ])->save();
    }

    /**
     * Levanta la pausa automática vencida; la manual solo se quita a mano.
     */
    public function resumeIfAutoPauseExpired(): void
    {
        $hours = max(1, (int) config('saleshub.auto_pause_hours', 12));

        if (! $this->bot_activo
            && $this->pausa === self::PAUSA_AUTO
            && $this->pausado_at !== null
            && $this->pausado_at->lte(now()->subHours($hours))) {
            $this->resume();
        }
    }

    public function isManuallyPaused(): bool
    {
        return ! $this->bot_activo && $this->pausa === self::PAUSA_MANUAL;
    }
}
