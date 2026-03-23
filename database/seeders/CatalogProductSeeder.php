<?php

namespace Database\Seeders;

use App\Models\CatalogCategory;
use App\Models\CatalogProduct;
use Illuminate\Database\Seeder;

/**
 * Productos de ejemplo por línea: sistemas propios, OEM y servicios.
 */
class CatalogProductSeeder extends Seeder
{
    public function run(): void
    {
        $catSystem = CatalogCategory::query()
            ->where('revenue_line', 'software_system')
            ->where('slug', 'sistemas')
            ->firstOrFail();

        $catService = CatalogCategory::query()
            ->where('revenue_line', 'service')
            ->where('slug', 'servicios')
            ->firstOrFail();

        $products = [
            // Sistema propio — post-pago: releases + license_keys / entitlements
            [
                'category_id' => $catSystem->id,
                'slug' => 'erp-contable-mini',
                'name' => 'ERP Contable Mini',
                'tagline' => 'Contabilidad esencial para PYME',
                'description' => 'Módulo contable con libro diario, mayor y reportes base. Instalable on-prem o disponible en modo SaaS.',
                'specs' => [
                    'stack' => 'Laravel / PHP',
                    'deployment' => ['on_premise', 'saas'],
                    'modules' => [
                        ['name' => 'Plan de cuentas y libro diario'],
                        ['name' => 'Mayor y balance de comprobación'],
                        ['name' => 'Reportes base y exportación'],
                        ['name' => 'Multi-empresa (según plan)'],
                    ],
                    'how_it_works' => [
                        'Elegís plan: código fuente, alquiler temporal o SaaS mensual/anual.',
                        'Descarga o acceso según SKU; releases documentados en panel.',
                        'Implementación en días con checklist y soporte según plan.',
                    ],
                    'languages' => ['PHP', 'TypeScript'],
                    'frameworks' => ['Laravel', 'React'],
                    'databases' => ['PostgreSQL', 'MySQL'],
                ],
            ],
            [
                'category_id' => $catSystem->id,
                'slug' => 'rrhh-asistencia',
                'name' => 'RRHH Asistencia',
                'tagline' => 'Control de asistencia y turnos',
                'description' => 'Registro de marcaciones, turnos y reportes para recursos humanos.',
                'specs' => [
                    'channels' => ['web', 'api'],
                    'modules' => [
                        ['name' => 'Marcaciones y fichadas'],
                        ['name' => 'Turnos y calendarios'],
                        ['name' => 'Reportes por sede y área'],
                        ['name' => 'API para relojes / integraciones'],
                    ],
                    'how_it_works' => [
                        'Elegís SaaS mensual/anual o licencia on-prem con código.',
                        'Activación de entorno y usuarios según plan.',
                        'Soporte y actualizaciones según SKU contratado.',
                    ],
                    'languages' => ['PHP', 'TypeScript'],
                    'frameworks' => ['Laravel', 'Inertia'],
                    'databases' => ['PostgreSQL'],
                ],
            ],
            // OEM: catálogo en OemLicenseCatalogSeeder (secciones tipo lista de precios).
            // Servicios — subscriptions + entitlements + entitlement_secrets
            [
                'category_id' => $catService->id,
                'slug' => 'sunat-emision-electronica',
                'name' => 'Emisión electrónica SUNAT',
                'tagline' => 'Facturación y envío a SUNAT desde tu operación',
                'description' => 'Configuración de emisor, series y acompañamiento para CPE. Puede ser proyecto inicial + cuota mensual.',
                'specs' => [
                    'domain' => 'fiscal_pe',
                ],
            ],
            [
                'category_id' => $catService->id,
                'slug' => 'correo-corporativo',
                'name' => 'Correo corporativo',
                'tagline' => 'Buzones y colaboración',
                'description' => 'Alta de dominio, buzones y políticas; integración con proveedor de correo.',
                'specs' => [
                    'kind' => 'email_hosting',
                ],
            ],
        ];

        foreach ($products as $row) {
            CatalogProduct::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'category_id' => $row['category_id'],
                    'name' => $row['name'],
                    'tagline' => $row['tagline'],
                    'description' => $row['description'],
                    'specs' => $row['specs'],
                    'is_active' => true,
                ],
            );
        }
    }
}
