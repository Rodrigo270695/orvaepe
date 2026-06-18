<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasUuids;

    // ── Tipo de documento SUNAT ──────────────────────────────────────────
    public const TYPE_FACTURA = '01';
    public const TYPE_BOLETA  = '03';
    public const TYPE_NOTA_CREDITO = '07';
    public const TYPE_NOTA_DEBITO  = '08';
    public const TYPE_GUIA    = '09';

    public const DOC_TYPE_LABELS = [
        '01' => 'Factura',
        '03' => 'Boleta de Venta',
        '07' => 'Nota de Crédito',
        '08' => 'Nota de Débito',
        '09' => 'Guía de Remisión',
    ];

    // ── Estado de envío SUNAT ────────────────────────────────────────────
    public const FILING_DRAFT              = 'draft';
    public const FILING_PENDING            = 'pending';
    public const FILING_ACCEPTED           = 'accepted';
    public const FILING_ACCEPTED_WITH_OBS  = 'accepted_obs';
    public const FILING_REJECTED           = 'rejected';
    public const FILING_ERROR              = 'error';

    // ── Estado del documento ─────────────────────────────────────────────
    public const STATUS_DRAFT     = 'draft';
    public const STATUS_ISSUED    = 'issued';
    public const STATUS_CANCELLED = 'cancelled';

    protected $table = 'invoices';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'company_legal_profile_id',
        'invoice_document_sequence_id',
        'invoice_number',
        'sunat_document_type_code',
        'sunat_serie',
        'sunat_correlative',
        'sunat_filing_status',
        'order_id',
        'user_id',
        'client_user_id',
        'status',
        'subtotal',
        'tax_total',
        'grand_total',
        'currency',
        'pdf_path',
        'xml_unsigned_path',
        'xml_signed_path',
        'cdr_path',
        'sunat_response_code',
        'sunat_response_description',
        'issued_at',
        'due_at',
        'paid_at',
        'buyer_snapshot',
        'sunat_metadata',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'        => 'decimal:2',
            'tax_total'       => 'decimal:2',
            'grand_total'     => 'decimal:2',
            'buyer_snapshot'  => 'array',
            'sunat_metadata'  => 'array',
            'issued_at'       => 'datetime',
            'due_at'          => 'datetime',
            'paid_at'         => 'datetime',
        ];
    }

    public function companyLegalProfile(): BelongsTo
    {
        return $this->belongsTo(CompanyLegalProfile::class);
    }

    public function sequence(): BelongsTo
    {
        return $this->belongsTo(InvoiceDocumentSequence::class, 'invoice_document_sequence_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(InvoiceLine::class);
    }

    public function submissionLogs(): HasMany
    {
        return $this->hasMany(SunatSubmissionLog::class);
    }

    public function getDocTypeLabel(): string
    {
        return self::DOC_TYPE_LABELS[$this->sunat_document_type_code] ?? $this->sunat_document_type_code;
    }

    public function getFullNumber(): string
    {
        return $this->sunat_serie . '-' . str_pad($this->sunat_correlative, 8, '0', STR_PAD_LEFT);
    }

    public function isAccepted(): bool
    {
        return in_array($this->sunat_filing_status, [
            self::FILING_ACCEPTED,
            self::FILING_ACCEPTED_WITH_OBS,
        ]);
    }
}
