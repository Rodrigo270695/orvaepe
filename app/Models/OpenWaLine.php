<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Número de WhatsApp de ORVAE vinculado al OpenWA propio (config/openwa_lines.php).
 *
 * @property list<string> $productos
 */
class OpenWaLine extends Model
{
    use HasUuids;

    protected $table = 'openwa_lines';

    public const STATUS_READY = 'ready';

    protected $fillable = [
        'nombre',
        'session_name',
        'openwa_session_id',
        'status',
        'phone',
        'push_name',
        'productos',
        'envia_notificaciones',
        'bot_activo',
        'webhook_id',
        'connected_at',
        'last_synced_at',
        'last_error',
    ];

    protected $attributes = [
        'status' => 'created',
        'productos' => '[]',
        'envia_notificaciones' => false,
        'bot_activo' => false,
    ];

    protected function casts(): array
    {
        return [
            'productos' => 'array',
            'envia_notificaciones' => 'boolean',
            'bot_activo' => 'boolean',
            'connected_at' => 'datetime',
            'last_synced_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<SalesHubConversation, $this>
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(SalesHubConversation::class, 'openwa_line_id');
    }

    public function isReady(): bool
    {
        return $this->status === self::STATUS_READY;
    }
}
