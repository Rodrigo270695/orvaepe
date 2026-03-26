<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'notifications';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'user_id',
        'type',
        'channel',
        'subject',
        'message',
        'data',
        'status',
        'error',
        'read_at',
        'sent_at',
    ])]
    protected $fillable = [
        'user_id',
        'type',
        'channel',
        'subject',
        'message',
        'data',
        'status',
        'error',
        'read_at',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'read_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): bool
    {
        if ($this->read_at !== null) {
            return true;
        }

        return $this->forceFill(['read_at' => now()])->save();
    }
}
