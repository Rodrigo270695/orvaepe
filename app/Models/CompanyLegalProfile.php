<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CompanyLegalProfile extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'company_legal_profiles';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'slug',
        'legal_name',
        'trade_name',
        'ruc',
        'tax_regime',
        'address_line',
        'district',
        'province',
        'department',
        'ubigeo',
        'country',
        'phone',
        'support_email',
        'website',
        'logo_path',
        'is_default_issuer',
        'metadata',
    ])]
    protected $fillable = [
        'slug',
        'legal_name',
        'trade_name',
        'ruc',
        'tax_regime',
        'address_line',
        'district',
        'province',
        'department',
        'ubigeo',
        'country',
        'phone',
        'support_email',
        'website',
        'logo_path',
        'is_default_issuer',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'is_default_issuer' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function digitalCertificates(): HasMany
    {
        return $this->hasMany(DigitalCertificate::class);
    }

    public function sunatEmitterSetting(): HasOne
    {
        return $this->hasOne(SunatEmitterSetting::class);
    }

    public function invoiceDocumentSequences(): HasMany
    {
        return $this->hasMany(InvoiceDocumentSequence::class);
    }
}

