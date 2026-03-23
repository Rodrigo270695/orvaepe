<?php

namespace Database\Seeders;

use App\Models\CatalogCategory;
use Illuminate\Database\Seeder;

/**
 * Tres líneas de ingreso vía categorías (revenue_line): software propio, OEM, servicios.
 *
 * @see orvae-database-migrations.md — Resumen de flujo por tipo de ingreso
 */
class CatalogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'slug' => 'sistemas',
                'name' => 'Sistemas ORVAE',
                'description' => 'Software propio: descarga por release, licencias on-prem o acceso SaaS.',
                'revenue_line' => 'software_system',
                'sort_order' => 10,
            ],
            [
                'slug' => 'licencias-oem',
                'name' => 'Licencias OEM',
                'description' => 'Licencias de terceros (OEM/retail); entrega y soporte según proveedor.',
                'revenue_line' => 'oem_license',
                'sort_order' => 20,
            ],
            [
                'slug' => 'servicios',
                'name' => 'Servicios',
                'description' => 'Proyectos, suscripciones (SUNAT, correo, hosting, integraciones).',
                'revenue_line' => 'service',
                'sort_order' => 30,
            ],
        ];

        foreach ($rows as $data) {
            CatalogCategory::query()->firstOrCreate(
                [
                    'slug' => $data['slug'],
                    'revenue_line' => $data['revenue_line'],
                ],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'sort_order' => $data['sort_order'],
                    'is_active' => true,
                ],
            );
        }
    }
}
