<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SunatEmitterSetting extends Model
{
    use HasUuids;

    protected $table = 'sunat_emitter_settings';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'company_legal_profile_id',
        'emission_mode',
        'ose_provider_code',
        'api_base_url',
        'sunat_username_hint',
        'credentials_secret_ref',
        'default_certificate_id',
        'environment',
        'options',
        'is_active',
    ])]
    protected $fillable = [
        'company_legal_profile_id',
        'emission_mode',
        'ose_provider_code',
        'api_base_url',
        'sunat_username_hint',
        'credentials_secret_ref',
        'default_certificate_id',
        'environment',
        'options',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'options' => 'array',
        ];
    }

    public function companyLegalProfile(): BelongsTo
    {
        return $this->belongsTo(CompanyLegalProfile::class);
    }

    public function defaultCertificate(): BelongsTo
    {
        return $this->belongsTo(DigitalCertificate::class, 'default_certificate_id');
    }
}
