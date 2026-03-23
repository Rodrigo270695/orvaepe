<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SoftwareReleaseAsset extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'software_release_assets';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'software_release_id',
        'label',
        'path',
        'sha256',
    ])]
    protected $fillable = [
        'software_release_id',
        'label',
        'path',
        'sha256',
    ];

    public function release(): BelongsTo
    {
        return $this->belongsTo(SoftwareRelease::class, 'software_release_id');
    }
}
