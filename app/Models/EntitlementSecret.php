<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EntitlementSecret extends Model
{
    use HasFactory, HasUuids;

    public const KIND_API_KEY = 'api_key';

    public const KIND_HMAC_SECRET = 'hmac_secret';

    public const KIND_OAUTH_REFRESH = 'oauth_refresh';

    public const KIND_CERTIFICATE = 'certificate';

    public const KIND_CUSTOM = 'custom';

    protected $table = 'entitlement_secrets';

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * @var list<string>
     */
    protected $hidden = [
        'secret_ciphertext',
    ];

    #[Fillable([
        'entitlement_id',
        'kind',
        'label',
        'public_ref',
        'secret_ciphertext',
        'expires_at',
        'rotated_at',
        'revoked_at',
        'last_used_at',
        'metadata',
    ])]
    protected $fillable = [
        'entitlement_id',
        'kind',
        'label',
        'public_ref',
        'secret_ciphertext',
        'expires_at',
        'rotated_at',
        'revoked_at',
        'last_used_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'rotated_at' => 'datetime',
            'revoked_at' => 'datetime',
            'last_used_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function entitlement(): BelongsTo
    {
        return $this->belongsTo(Entitlement::class, 'entitlement_id');
    }
}
