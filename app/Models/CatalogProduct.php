<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CatalogProduct extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'catalog_products';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'category_id',
        'slug',
        'name',
        'tagline',
        'description',
        'specs',
        'is_active',
    ])]
    protected $fillable = [
        'category_id',
        'slug',
        'name',
        'tagline',
        'description',
        'specs',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'specs' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CatalogCategory::class, 'category_id');
    }

    public function skus(): HasMany
    {
        return $this->hasMany(CatalogSku::class, 'catalog_product_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(CatalogMedia::class, 'catalog_product_id');
    }

    public function softwareReleases(): HasMany
    {
        return $this->hasMany(SoftwareRelease::class, 'catalog_product_id');
    }
}

