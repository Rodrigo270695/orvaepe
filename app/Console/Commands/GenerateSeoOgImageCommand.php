<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Genera la imagen Open Graph 1200×630 sin Node/sharp (útil en VPS con CPU sin x86-64-v2).
 */
class GenerateSeoOgImageCommand extends Command
{
    protected $signature = 'orvae:seo-og-image';

    protected $description = 'Genera public/images/og/orvae-og-default.png (1200×630) usando la extensión PHP GD';

    public function handle(): int
    {
        if (! extension_loaded('gd')) {
            $this->error('PHP no tiene la extensión gd. En Ubuntu/Debian: sudo apt install php-gd && sudo systemctl reload php*-fpm');
            $this->line('Alternativa: genera en tu PC con pnpm run seo:og-image y sube el PNG.');

            return self::FAILURE;
        }

        if (! (imagetypes() & IMG_PNG)) {
            $this->error('GD debe estar compilado con soporte PNG.');

            return self::FAILURE;
        }

        $public = public_path();
        $candidates = [
            $public.'/logo/orvae-logo-h-transparent-light.png',
            $public.'/logo/orvae-logo-h-transparent-dark.png',
            $public.'/icons/pwa/icon-512.png',
        ];

        $logoPath = null;
        foreach ($candidates as $path) {
            if (File::isFile($path)) {
                $logoPath = $path;
                break;
            }
        }

        if ($logoPath === null) {
            $this->error('No se encontró ningún logo candidato en public/logo ni public/icons/pwa.');

            return self::FAILURE;
        }

        $logo = @imagecreatefrompng($logoPath);
        if ($logo === false) {
            $this->error('No se pudo leer el PNG: '.$logoPath);

            return self::FAILURE;
        }

        $W = 1200;
        $H = 630;
        $bg = imagecreatetruecolor($W, $H);
        if ($bg === false) {
            imagedestroy($logo);
            $this->error('No se pudo crear el lienzo.');

            return self::FAILURE;
        }

        $fill = imagecolorallocate($bg, 15, 23, 42);
        imagefill($bg, 0, 0, $fill);

        imagesavealpha($logo, true);
        imagealphablending($logo, true);
        $lw = imagesx($logo);
        $lh = imagesy($logo);
        $maxW = str_contains($logoPath, 'icon-512') ? 280 : 720;
        $scale = min(1.0, $maxW / max(1, $lw));
        $tw = max(1, (int) round($lw * $scale));
        $th = max(1, (int) round($lh * $scale));

        $resized = imagecreatetruecolor($tw, $th);
        if ($resized === false) {
            imagedestroy($logo);
            imagedestroy($bg);
            $this->error('No se pudo crear el lienzo intermedio.');

            return self::FAILURE;
        }

        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
        imagefill($resized, 0, 0, $transparent);
        imagealphablending($resized, true);
        imagecopyresampled($resized, $logo, 0, 0, 0, 0, $tw, $th, $lw, $lh);
        imagedestroy($logo);

        $left = (int) round(($W - $tw) / 2);
        $top = (int) round(($H - $th) / 2);
        imagealphablending($bg, true);
        imagecopy($bg, $resized, $left, $top, 0, 0, $tw, $th);
        imagedestroy($resized);

        $outDir = $public.'/images/og';
        if (! File::isDirectory($outDir)) {
            File::makeDirectory($outDir, 0755, true);
        }

        $outFile = $outDir.'/orvae-og-default.png';
        if (! imagepng($bg, $outFile, 6)) {
            imagedestroy($bg);
            $this->error('No se pudo escribir: '.$outFile);

            return self::FAILURE;
        }

        imagedestroy($bg);

        $this->info("OK {$outFile} ({$W}×{$H}) desde ".str_replace($public.DIRECTORY_SEPARATOR, 'public/', $logoPath));

        return self::SUCCESS;
    }
}
