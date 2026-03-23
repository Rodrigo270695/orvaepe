<?php

namespace Database\Seeders;

use App\Models\CatalogProduct;
use App\Models\SoftwareRelease;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Versiones de software propio (solo productos con categoría revenue_line = software_system).
 */
class SoftwareReleaseSeeder extends Seeder
{
    public function run(): void
    {
        $erp = CatalogProduct::query()->where('slug', 'erp-contable-mini')->first();
        $rrhh = CatalogProduct::query()->where('slug', 'rrhh-asistencia')->first();

        if ($erp === null || $rrhh === null) {
            return;
        }

        $fakeSha = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

        $this->seedProductReleases($erp->id, [
            [
                'version' => '1.0.0',
                'changelog' => "Primera versión estable.\n- Libro mayor y balance de comprobación.\n- Exportación CSV.",
                'artifact_path' => 'releases/erp-contable-mini/erp-mini-1.0.0.zip',
                'artifact_sha256' => $fakeSha,
                'min_php_version' => '8.2',
                'released_at' => Carbon::now()->subMonths(3),
            ],
            [
                'version' => '1.1.0',
                'changelog' => "- Reportes SUNAT preliminares.\n- Mejoras de rendimiento en mayor.\n- Correcciones menores.",
                'artifact_path' => 'releases/erp-contable-mini/erp-mini-1.1.0.zip',
                'artifact_sha256' => $fakeSha,
                'min_php_version' => '8.2',
                'released_at' => Carbon::now()->subWeeks(2),
            ],
        ]);

        $this->seedProductReleases($rrhh->id, [
            [
                'version' => '2.0.0',
                'changelog' => "- API de marcaciones.\n- Panel de turnos.\n- Soporte multi-sede.",
                'artifact_path' => 'releases/rrhh-asistencia/rrhh-2.0.0.zip',
                'artifact_sha256' => $fakeSha,
                'min_php_version' => '8.2',
                'released_at' => Carbon::now()->subMonth(),
            ],
        ]);
    }

    /**
     * @param  list<array{version: string, changelog: string, artifact_path: string, artifact_sha256: string, min_php_version: string, released_at: \Carbon\Carbon}>  $releases
     */
    private function seedProductReleases(string $productId, array $releases): void
    {
        foreach ($releases as $row) {
            SoftwareRelease::query()->firstOrCreate(
                [
                    'catalog_product_id' => $productId,
                    'version' => $row['version'],
                ],
                [
                    'changelog' => $row['changelog'],
                    'artifact_path' => $row['artifact_path'],
                    'artifact_sha256' => $row['artifact_sha256'],
                    'min_php_version' => $row['min_php_version'],
                    'is_latest' => false,
                    'released_at' => $row['released_at'],
                ],
            );
        }

        SoftwareRelease::query()
            ->where('catalog_product_id', $productId)
            ->update(['is_latest' => false]);

        $latest = SoftwareRelease::query()
            ->where('catalog_product_id', $productId)
            ->orderByDesc('released_at')
            ->orderByDesc('version')
            ->first();

        if ($latest !== null) {
            $latest->forceFill(['is_latest' => true])->save();
        }
    }
}
