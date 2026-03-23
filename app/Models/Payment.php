<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'payments';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'order_id',
        'user_id',
        'gateway',
        'gateway_payment_id',
        'amount',
        'currency',
        'status',
        'raw_request',
        'raw_response',
        'failure_message',
        'paid_at',
        'approved_by_user_id',
        'transfer_proof_path',
    ])]
    protected $fillable = [
        'order_id',
        'user_id',
        'gateway',
        'gateway_payment_id',
        'amount',
        'currency',
        'status',
        'raw_request',
        'raw_response',
        'failure_message',
        'paid_at',
        'approved_by_user_id',
        'transfer_proof_path',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'raw_request' => 'array',
            'raw_response' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
