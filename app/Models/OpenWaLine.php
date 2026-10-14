<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

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
        'connected_at',
        'last_synced_at',
        'last_error',
    ];

    protected $attributes = [
        'status' => 'created',
        'productos' => '[]',
    ];

    protected function casts(): array
    {
        return [
            'productos' => 'array',
            'connected_at' => 'datetime',
            'last_synced_at' => 'datetime',
        ];
    }

    public function isReady(): bool
    {
        return $this->status === self::STATUS_READY;
    }
}
