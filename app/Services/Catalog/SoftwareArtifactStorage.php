<?php

namespace App\Services\Catalog;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SoftwareArtifactStorage
{
    public const DISK = 'software_artifacts';

    /**
     * Artefacto principal de un release (aún sin id de release en el alta).
     *
     * @return array{path: string, sha256: string}
     */
    public function storeReleaseMain(UploadedFile $file, string $catalogProductId): array
    {
        $safe = $this->safeBasename($file);
        $dir = $catalogProductId.'/releases/main';
        $name = Str::uuid()->toString().'_'.$safe;

        $path = $file->storeAs($dir, $name, self::DISK);

        $full = Storage::disk(self::DISK)->path($path);
        $sha256 = hash_file('sha256', $full);

        return [
            'path' => $path,
            'sha256' => $sha256,
        ];
    }

    /**
     * Archivo adicional ligado a un release concreto.
     *
     * @return array{path: string, sha256: string}
     */
    public function storeReleaseAsset(
        UploadedFile $file,
        string $catalogProductId,
        string $releaseId,
    ): array {
        $safe = $this->safeBasename($file);
        $dir = $catalogProductId.'/releases/'.$releaseId.'/assets';
        $name = Str::uuid()->toString().'_'.$safe;

        $path = $file->storeAs($dir, $name, self::DISK);

        $full = Storage::disk(self::DISK)->path($path);
        $sha256 = hash_file('sha256', $full);

        return [
            'path' => $path,
            'sha256' => $sha256,
        ];
    }

    public function isLocalManagedPath(?string $path): bool
    {
        if ($path === null || $path === '') {
            return false;
        }

        return ! str_contains($path, '://');
    }

    public function deleteIfManaged(?string $path): void
    {
        if (! $this->isLocalManagedPath($path)) {
            return;
        }

        if (Storage::disk(self::DISK)->exists($path)) {
            Storage::disk(self::DISK)->delete($path);
        }
    }

    private function safeBasename(UploadedFile $file): string
    {
        $original = $file->getClientOriginalName();
        $base = pathinfo($original, PATHINFO_FILENAME);
        $ext = strtolower((string) $file->getClientOriginalExtension());
        $slug = Str::slug($base) ?: 'archivo';
        if ($ext !== '') {
            return $slug.'.'.$ext;
        }

        return $slug;
    }
}
