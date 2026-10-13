<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class WaOptin extends Model
{
    use HasUuids;

    protected $table = 'wa_optins';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'producto',
        'tenant_id',
        'telefono',
        'fecha',
        'origen',
    ])]
    protected $fillable = [
        'producto',
        'tenant_id',
        'telefono',
        'fecha',
        'origen',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'datetime',
        ];
    }
}
