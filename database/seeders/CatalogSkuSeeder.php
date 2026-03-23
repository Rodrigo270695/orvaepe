<?php

namespace Database\Seeders;

use App\Models\CatalogProduct;
use App\Models\CatalogSku;
use Illuminate\Database\Seeder;

/**
 * SKUs con prefijos alineados al flujo: source_*, saas_*, oem_*, service_*.
 *
 * Valores de sale_model / fulfillment_type acotados a CatalogSkuStoreRequest.
 */
class CatalogSkuSeeder extends Seeder
{
    public function run(): void
    {
        $skuRows = [
            // —— Sistema propio: ERP Contable Mini ——
            $this->row(
                'erp-contable-mini',
                'source_erp_mini_perpetual',
                'Licencia perpetua (código / instalador)',
                [
                    'sale_model' => 'source_perpetual',
                    'billing_interval' => 'one_time',
                    'rental_days' => null,
                    'list_price' => 2490.00,
                    'fulfillment_type' => 'download',
                    'sort_order' => 10,
                    'metadata' => ['sku_line' => 'source'],
                ],
            ),
            $this->row(
                'erp-contable-mini',
                'source_erp_mini_rental_90',
                'Alquiler 90 días (código fuente / binario)',
                [
                    'sale_model' => 'source_rental',
                    'billing_interval' => 'custom',
                    'rental_days' => 90,
                    'list_price' => 590.00,
                    'fulfillment_type' => 'download',
                    'sort_order' => 20,
                    'metadata' => ['sku_line' => 'source', 'rental_days' => 90],
                ],
            ),
            $this->row(
                'erp-contable-mini',
                'saas_erp_mini_monthly',
                'SaaS — servicio mensual (hosting y actualizaciones)',
                [
                    'sale_model' => 'saas_subscription',
                    'billing_interval' => 'monthly',
                    'rental_days' => null,
                    'list_price' => 20.00,
                    'fulfillment_type' => 'saas_url',
                    'sort_order' => 30,
                    'metadata' => ['sku_line' => 'saas', 'billing' => 'monthly'],
                ],
            ),
            $this->row(
                'erp-contable-mini',
                'saas_erp_mini_annual',
                'SaaS — servicio anual (hosting y actualizaciones)',
                [
                    'sale_model' => 'saas_subscription',
                    'billing_interval' => 'annual',
                    'rental_days' => null,
                    'list_price' => 200.00,
                    'fulfillment_type' => 'saas_url',
                    'sort_order' => 40,
                    'metadata' => ['sku_line' => 'saas', 'billing' => 'annual'],
                ],
            ),
            // —— Sistema propio: RRHH ——
            $this->row(
                'rrhh-asistencia',
                'source_rrhh_perpetual',
                'Código fuente — licencia perpetua on-prem',
                [
                    'sale_model' => 'source_perpetual',
                    'billing_interval' => 'one_time',
                    'rental_days' => null,
                    'list_price' => 1890.00,
                    'fulfillment_type' => 'download',
                    'sort_order' => 10,
                    'metadata' => ['sku_line' => 'source'],
                ],
            ),
            $this->row(
                'rrhh-asistencia',
                'saas_rrhh_monthly',
                'SaaS — servicio mensual por sede',
                [
                    'sale_model' => 'saas_subscription',
                    'billing_interval' => 'monthly',
                    'rental_days' => null,
                    'list_price' => 20.00,
                    'fulfillment_type' => 'saas_url',
                    'sort_order' => 20,
                    'metadata' => ['sku_line' => 'saas', 'billing' => 'monthly'],
                ],
            ),
            $this->row(
                'rrhh-asistencia',
                'saas_rrhh_annual',
                'SaaS — servicio anual por sede',
                [
                    'sale_model' => 'saas_subscription',
                    'billing_interval' => 'annual',
                    'rental_days' => null,
                    'list_price' => 200.00,
                    'fulfillment_type' => 'saas_url',
                    'sort_order' => 30,
                    'metadata' => ['sku_line' => 'saas', 'billing' => 'annual'],
                ],
            ),
            // —— OEM: ver OemLicenseCatalogSeeder ——
            // —— Servicios ——
            $this->row(
                'sunat-emision-electronica',
                'service_sunat_setup_once',
                'Proyecto — puesta en marcha emisor (configuración inicial)',
                [
                    'sale_model' => 'service_project',
                    'billing_interval' => 'one_time',
                    'rental_days' => null,
                    'list_price' => 3500.00,
                    'fulfillment_type' => 'manual_provision',
                    'sort_order' => 10,
                    'metadata' => ['sku_line' => 'service'],
                ],
            ),
            $this->row(
                'sunat-emision-electronica',
                'service_sunat_ops_monthly',
                'Suscripción — monitoreo y ajustes mensuales',
                [
                    'sale_model' => 'service_subscription',
                    'billing_interval' => 'monthly',
                    'rental_days' => null,
                    'list_price' => 120.00,
                    'fulfillment_type' => 'manual_provision',
                    'sort_order' => 20,
                    'metadata' => ['sku_line' => 'service'],
                ],
            ),
            $this->row(
                'correo-corporativo',
                'service_mailbox_monthly',
                'Buzón corporativo — por usuario / mes',
                [
                    'sale_model' => 'service_subscription',
                    'billing_interval' => 'monthly',
                    'rental_days' => null,
                    'list_price' => 25.00,
                    'fulfillment_type' => 'manual_provision',
                    'sort_order' => 10,
                    'metadata' => ['sku_line' => 'service'],
                ],
            ),
        ];

        foreach ($skuRows as $attrs) {
            $productSlug = $attrs['_product_slug'];
            unset($attrs['_product_slug']);

            $product = CatalogProduct::query()->where('slug', $productSlug)->firstOrFail();

            CatalogSku::query()->updateOrCreate(
                ['code' => $attrs['code']],
                array_merge($attrs, [
                    'catalog_product_id' => $product->id,
                    'currency' => 'PEN',
                    'tax_included' => false,
                    'limits' => null,
                    'is_active' => true,
                ]),
            );
        }
    }

    /**
     * @param  array<string, mixed>  $rest
     * @return array<string, mixed>
     */
    private function row(string $productSlug, string $code, string $name, array $rest): array
    {
        return array_merge(
            [
                '_product_slug' => $productSlug,
                'code' => $code,
                'name' => $name,
            ],
            $rest,
        );
    }
}
