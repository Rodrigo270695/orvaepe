<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SunatSubmissionLog extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'sunat_submission_logs';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'invoice_id',
        'attempt',
        'channel',
        'request_hash',
        'http_status',
        'sunat_ticket',
        'response_code',
        'response_message',
        'cdr_storage_path',
        'xml_signed_storage_path',
        'raw_request_ref',
        'raw_response_ref',
        'success',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'success'    => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
