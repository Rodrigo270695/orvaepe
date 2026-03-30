<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

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

    /**
     * Descifra el valor almacenado o null si no existe o falla el descifrado.
     */
    public function decryptPlainOrNull(): ?string
    {
        $raw = $this->getRawOriginal('secret_ciphertext');
        if (! is_string($raw) || $raw === '') {
            return null;
        }

        try {
            return Crypt::decryptString($raw);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function kindOptionsForAdmin(): array
    {
        return [
            ['value' => self::KIND_API_KEY, 'label' => 'API key'],
            ['value' => self::KIND_HMAC_SECRET, 'label' => 'HMAC secret'],
            ['value' => self::KIND_OAUTH_REFRESH, 'label' => 'OAuth refresh'],
            ['value' => self::KIND_CERTIFICATE, 'label' => 'Certificado'],
            ['value' => self::KIND_CUSTOM, 'label' => 'Personalizado (URL, usuario, token, …)'],
        ];
    }
}
