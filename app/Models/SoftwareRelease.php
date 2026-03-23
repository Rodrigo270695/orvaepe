<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SoftwareRelease extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'software_releases';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'catalog_product_id',
        'version',
        'changelog',
        'artifact_path',
        'artifact_sha256',
        'min_php_version',
        'is_latest',
        'released_at',
    ])]
    protected $fillable = [
        'catalog_product_id',
        'version',
        'changelog',
        'artifact_path',
        'artifact_sha256',
        'min_php_version',
        'is_latest',
        'released_at',
    ];

    protected function casts(): array
    {
        return [
            'is_latest' => 'boolean',
            'released_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(CatalogProduct::class, 'catalog_product_id');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(SoftwareReleaseAsset::class, 'software_release_id');
    }
}
