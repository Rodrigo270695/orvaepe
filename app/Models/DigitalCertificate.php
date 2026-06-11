<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigitalCertificate extends Model
{
    use HasUuids;

    protected $table = 'digital_certificates';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'company_legal_profile_id',
        'label',
        'storage_disk',
        'storage_path',
        'certificate_thumbprint',
        'serial_number',
        'issuer_cn',
        'valid_from',
        'valid_until',
        'is_active',
        'password_enc',
    ])]
    protected $fillable = [
        'company_legal_profile_id',
        'label',
        'storage_disk',
        'storage_path',
        'certificate_thumbprint',
        'serial_number',
        'issuer_cn',
        'valid_from',
        'valid_until',
        'is_active',
        'password_enc',
    ];

    /** Nunca exponer el cifrado al frontend. */
    protected $hidden = ['password_enc'];

    /** Indica si la contraseña del certificado está guardada. */
    protected $appends = ['has_password'];

    public function getHasPasswordAttribute(): bool
    {
        return !empty($this->attributes['password_enc']);
    }

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
        ];
    }

    public function companyLegalProfile(): BelongsTo
    {
        return $this->belongsTo(CompanyLegalProfile::class);
    }
}
