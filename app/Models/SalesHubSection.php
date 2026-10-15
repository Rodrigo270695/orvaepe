<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Bloque de conocimiento de un SaaS (módulo, FAQ, objeción, novedad o general) editado en ORVAE.
 */
class SalesHubSection extends Model
{
    public const TIPOS = ['modulo', 'faq', 'objecion', 'novedad', 'general'];

    protected $fillable = [
        'producto',
        'tipo',
        'titulo',
        'contenido',
        'orden',
        'activo',
    ];

    protected $attributes = [
        'tipo' => 'general',
        'orden' => 0,
        'activo' => true,
    ];

    protected function casts(): array
    {
        return [
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }
}
