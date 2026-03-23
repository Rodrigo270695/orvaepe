<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LicenseActivation extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'license_activations';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'license_key_id',
        'domain',
        'server_fingerprint',
        'ip_address',
        'last_ping_at',
        'is_active',
    ])]
    protected $fillable = [
        'license_key_id',
        'domain',
        'server_fingerprint',
        'ip_address',
        'last_ping_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'last_ping_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function licenseKey(): BelongsTo
    {
        return $this->belongsTo(LicenseKey::class, 'license_key_id');
    }

    public function deactivate(): void
    {
        $this->forceFill(['is_active' => false])->save();
    }
}
