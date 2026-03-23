<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasUuids;

    protected $table = 'user_profiles';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'user_id',
        'company_name',
        'legal_name',
        'ruc',
        'tax_status',
        'billing_email',
        'phone',
        'country',
        'city',
        'address',
        'metadata',
    ])]
    protected $fillable = [
        'user_id',
        'company_name',
        'legal_name',
        'ruc',
        'tax_status',
        'billing_email',
        'phone',
        'country',
        'city',
        'address',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
