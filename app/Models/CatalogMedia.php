<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CatalogMedia extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'catalog_media';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'catalog_product_id',
        'kind',
        'storage_path',
        'original_filename',
        'mime_type',
        'size_bytes',
        'sort_order',
    ])]
    protected $fillable = [
        'catalog_product_id',
        'kind',
        'storage_path',
        'original_filename',
        'mime_type',
        'size_bytes',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(function (CatalogMedia $media): void {
            if ($media->storage_path !== '') {
                Storage::disk('public')->delete($media->storage_path);
            }
        });
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(CatalogProduct::class, 'catalog_product_id');
    }
}
