<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Empresas mostradas en la vitrina pública (confían en ORVAE / casos de uso).
 */
class ShowcaseClient extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'showcase_clients';

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * @var list<string>
     */
    protected $appends = [
        'logo_public_url',
    ];

    #[Fillable([
        'legal_name',
        'display_name',
        'slug',
        'logo_path',
        'website_url',
        'sector',
        'is_published',
        'sort_order',
        'admin_notes',
        'authorized_at',
    ])]
    protected $fillable = [
        'legal_name',
        'display_name',
        'slug',
        'logo_path',
        'website_url',
        'sector',
        'is_published',
        'sort_order',
        'admin_notes',
        'authorized_at',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'sort_order' => 'integer',
            'authorized_at' => 'datetime',
        ];
    }

    public function publicName(): string
    {
        return $this->display_name ?: $this->legal_name;
    }

    /**
     * Ruta relativa al mismo host (evita fallos si APP_URL no coincide con el host del navegador).
     */
    public function getLogoPublicUrlAttribute(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        return '/storage/'.ltrim($this->logo_path, '/');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('legal_name');
    }
}
