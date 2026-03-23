<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebhookEvent extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'webhook_events';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'gateway',
        'gateway_event_id',
        'event_type',
        'payload',
        'processed',
        'processed_at',
        'error',
        'attempts',
    ])]
    protected $fillable = [
        'gateway',
        'gateway_event_id',
        'event_type',
        'payload',
        'processed',
        'processed_at',
        'error',
        'attempts',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'processed' => 'boolean',
            'processed_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function markProcessed(): void
    {
        $this->forceFill([
            'processed' => true,
            'processed_at' => now(),
            'error' => null,
        ])->save();
    }

    public function markFailed(string $message): void
    {
        $this->forceFill([
            'processed' => false,
            'error' => $message,
            'attempts' => $this->attempts + 1,
        ])->save();
    }
}
