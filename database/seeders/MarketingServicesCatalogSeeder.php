<?php

namespace Database\Seeders;

use App\Models\CatalogCategory;
use App\Models\CatalogProduct;
use App\Models\CatalogSku;
use Illuminate\Database\Seeder;

/**
 * Secciones tipo flyer para /servicios (revenue_line service, slugs svc-*).
 *
 * @see MarketingOemLicensesPresenter
 */
class MarketingServicesCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $cat = CatalogCategory::query()
            ->where('revenue_line', 'service')
            ->where('slug', 'servicios')
            ->firstOrFail();

        $products = [
            [
                'slug' => 'svc-correos-corporativos',
                'name' => 'Correos corporativos',
                'tagline' => 'Dominios, buzones y políticas',
                'description' => 'Alta de dominio, buzones y configuración segura con documentación y guía de uso.',
            ],
            [
                'slug' => 'svc-integraciones',
                'name' => 'Integraciones',
                'tagline' => 'Datos entre sistemas',
                'description' => 'Conexión a procesos internos para automatizar el flujo de datos.',
            ],
            [
                'slug' => 'svc-despliegue-onboarding',
                'name' => 'Despliegue y onboarding',
                'tagline' => 'Checklist y trazabilidad',
                'description' => 'Implementación en días o semanas con entregables claros.',
            ],
            [
                'slug' => 'svc-capacitacion',
                'name' => 'Capacitación',
                'tagline' => 'Equipos alineados',
                'description' => 'Onboarding para equipos: roles, flujos y buenas prácticas operativas.',
            ],
        ];

        foreach ($products as $row) {
            CatalogProduct::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'category_id' => $cat->id,
                    'name' => $row['name'],
                    'tagline' => $row['tagline'],
                    'description' => $row['description'],
                    'specs' => ['channel' => 'service_marketing', 'price_list' => 'mar-2026'],
                    'is_active' => true,
                ],
            );
        }

        $this->seedSkusCorreos();
        $this->seedSkusIntegraciones();
        $this->seedSkusDespliegue();
        $this->seedSkusCapacitacion();
    }

    private function seedSkusCorreos(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'svc-correos-corporativos')->value('id');
        $rows = [
            $this->svcSku(1, 'Paquete inicial — hasta 5 buzones', 890.0, 'svc_mail_pack_5', 'Incluye dominio, DNS y guía de uso', 'generic'),
            $this->svcSku(2, 'Paquete empresa — hasta 25 buzones', 2490.0, 'svc_mail_pack_25', 'Políticas, grupos y soporte de puesta en marcha', 'generic'),
        ];
        $this->upsertSkus($pid, $rows);
    }

    private function seedSkusIntegraciones(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'svc-integraciones')->value('id');
        $rows = [
            $this->svcSku(1, 'Integración estándar (API / webhook)', 1800.0, 'svc_int_std', 'Un flujo documentado y pruebas en staging', 'generic'),
            $this->svcSku(2, 'Integración avanzada (varios sistemas)', 4200.0, 'svc_int_adv', 'Diseño, mapeo de datos y monitoreo básico', 'generic'),
        ];
        $this->upsertSkus($pid, $rows);
    }

    private function seedSkusDespliegue(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'svc-despliegue-onboarding')->value('id');
        $rows = [
            $this->svcSku(1, 'Despliegue express (hasta 2 semanas)', 3200.0, 'svc_dep_exp', 'Checklist, entorno productivo y handover', 'generic'),
            $this->svcSku(2, 'Onboarding guiado (4 sesiones)', 1500.0, 'svc_dep_onb', 'Sesiones en vivo con tu equipo', 'generic'),
        ];
        $this->upsertSkus($pid, $rows);
    }

    private function seedSkusCapacitacion(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'svc-capacitacion')->value('id');
        $rows = [
            $this->svcSku(1, 'Taller de roles y permisos (1 día)', 950.0, 'svc_cap_roles', 'Material y grabación opcional', 'generic'),
            $this->svcSku(2, 'Capacitación continua — 3 meses', 2200.0, 'svc_cap_3m', 'Soporte formativo y Q&A quincenal', 'generic'),
        ];
        $this->upsertSkus($pid, $rows);
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     */
    private function upsertSkus(?string $productId, array $rows): void
    {
        if (! $productId) {
            return;
        }

        foreach ($rows as $attrs) {
            CatalogSku::query()->updateOrCreate(
                ['code' => $attrs['code']],
                array_merge($attrs, [
                    'catalog_product_id' => $productId,
                    'currency' => 'PEN',
                    'tax_included' => false,
                    'limits' => null,
                    'fulfillment_type' => 'manual_provision',
                    'is_active' => true,
                ]),
            );
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function svcSku(
        int $listNumber,
        string $name,
        float $price,
        string $code,
        string $detail,
        string $iconKey,
    ): array {
        return [
            'code' => $code,
            'name' => $name,
            'list_price' => $price,
            'sale_model' => 'service_project',
            'billing_interval' => 'one_time',
            'rental_days' => null,
            'sort_order' => $listNumber * 10,
            'metadata' => [
                'sku_line' => 'service',
                'list_number' => $listNumber,
                'detail' => $detail,
                'icon_key' => $iconKey,
                'image_url' => null,
            ],
        ];
    }
}
