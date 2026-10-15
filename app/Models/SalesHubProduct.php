<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Conocimiento comercial de un SaaS editado en ORVAE (Centro de Ventas).
 * Los planes y precios no viven aquí: siempre se leen del SaaS.
 */
class SalesHubProduct extends Model
{
    protected $fillable = [
        'producto',
        'nombre',
        'resumen',
        'publico',
        'palabras_clave',
        'demo_url',
        'demo_usuario',
        'demo_password',
        'registro_url',
        'instrucciones',
    ];

    protected function casts(): array
    {
        return [
            'palabras_clave' => 'array',
        ];
    }

    /**
     * @return HasMany<SalesHubSection, $this>
     */
    public function sections(): HasMany
    {
        return $this->hasMany(SalesHubSection::class, 'producto', 'producto');
    }
}
