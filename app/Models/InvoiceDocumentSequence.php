<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceDocumentSequence extends Model
{
    use HasUuids;

    protected $table = 'invoice_document_sequences';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'company_legal_profile_id',
        'document_type_code',
        'serie',
        'establishment_code',
        'next_correlative',
        'correlative_from',
        'correlative_to',
        'authorization_metadata',
        'is_active',
    ])]
    protected $fillable = [
        'company_legal_profile_id',
        'document_type_code',
        'serie',
        'establishment_code',
        'next_correlative',
        'correlative_from',
        'correlative_to',
        'authorization_metadata',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'authorization_metadata' => 'array',
        ];
    }

    public function companyLegalProfile(): BelongsTo
    {
        return $this->belongsTo(CompanyLegalProfile::class);
    }
}
