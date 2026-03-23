<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatalogCategory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'catalog_categories';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'parent_id',
        'slug',
        'name',
        'description',
        'revenue_line',
        'sort_order',
        'is_active',
    ])]
    protected $fillable = [
        'parent_id',
        'slug',
        'name',
        'description',
        'revenue_line',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(CatalogProduct::class, 'category_id');
    }
}

