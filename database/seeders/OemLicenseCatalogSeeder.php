<?php

namespace Database\Seeders;

use App\Models\CatalogCategory;
use App\Models\CatalogProduct;
use App\Models\CatalogSku;
use Illuminate\Database\Seeder;

/**
 * Catálogo OEM (Windows, Office, antivirus, Canva, etc.) alineado a
 * orvae-database-migrations.md — revenue_line oem_license, SKUs oem_*.
 *
 * Imágenes: usar metadata.image_url (ruta pública) o metadata.icon_key para icono de marca.
 *
 * @see MarketingOemLicensesPresenter
 */
class OemLicenseCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $legacy = CatalogProduct::query()->where('slug', 'oem-windows-11-pro')->first();
        if ($legacy) {
            CatalogSku::query()->where('catalog_product_id', $legacy->id)->delete();
            $legacy->forceDelete();
        }

        $catOem = CatalogCategory::query()
            ->where('revenue_line', 'oem_license')
            ->where('slug', 'licencias-oem')
            ->firstOrFail();

        $products = [
            [
                'slug' => 'oem-mas-vendidos',
                'name' => 'Productos más vendidos',
                'tagline' => 'Licencias originales al 100%',
                'description' => 'Office, Windows y productos frecuentes. Precios de referencia en PEN; confirman al pedir.',
            ],
            [
                'slug' => 'oem-antivirus-principales',
                'name' => 'Antivirus más vendidos',
                'tagline' => 'ESET, Kaspersky, McAfee',
                'description' => 'Licencias con distintas vigencias. Entrega según stock.',
            ],
            [
                'slug' => 'oem-antivirus-otros',
                'name' => 'Otros antivirus',
                'tagline' => 'Bitdefender, Norton, AVG, ESET File Security',
                'description' => 'Catálogo ampliado de seguridad.',
            ],
            [
                'slug' => 'oem-otros-productos',
                'name' => 'Otros productos',
                'tagline' => 'Visio, Project, Office blindado, Microsoft 365 Familia',
                'description' => 'Productividad Microsoft y licencias especiales.',
            ],
            [
                'slug' => 'oem-office-mac',
                'name' => 'Office para Mac',
                'tagline' => 'Home & Business',
                'description' => 'Versiones para macOS. Consultar stock en blindados.',
            ],
            [
                'slug' => 'oem-nuevos-ingresos',
                'name' => 'Nuevos ingresos',
                'tagline' => 'Windows Home, Windows Server, Canva Pro',
                'description' => 'Novedades y combinaciones de vigencia Canva.',
            ],
        ];

        foreach ($products as $row) {
            CatalogProduct::query()->updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'category_id' => $catOem->id,
                    'name' => $row['name'],
                    'tagline' => $row['tagline'],
                    'description' => $row['description'],
                    'specs' => ['channel' => 'oem', 'price_list' => 'feb-2026'],
                    'is_active' => true,
                ],
            );
        }

        $this->seedSkusMasVendidos();
        $this->seedSkusAntivirusPrincipales();
        $this->seedSkusAntivirusOtros();
        $this->seedSkusOtrosProductos();
        $this->seedSkusOfficeMac();
        $this->seedSkusNuevosIngresos();
    }

    private function seedSkusMasVendidos(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'oem-mas-vendidos')->value('id');
        $rows = [
            $this->oemSku(1, 'Office 2019 Professional Plus', 20.0, 'oem_mv_office2019', '(NO CADUCA) Entrega inmediata', 'microsoftoffice'),
            $this->oemSku(2, 'Office 2021 Professional Plus', 23.0, 'oem_mv_office2021', '(NO CADUCA) Entrega inmediata', 'microsoftoffice'),
            $this->oemSku(3, 'Windows 10 Pro', 20.0, 'oem_mv_win10pro', '(NO CADUCA) Entrega inmediata', 'windows'),
            $this->oemSku(4, 'Windows 11 Pro', 20.0, 'oem_mv_win11pro', '(NO CADUCA) Entrega inmediata', 'windows'),
            $this->oemSku(5, 'Office 2024 Professional Plus', 40.0, 'oem_mv_office2024', '(NO CADUCA) Entrega inmediata', 'microsoftoffice'),
            $this->oemSku(6, 'Office 2016 Professional Plus', 17.0, 'oem_mv_office2016', '(NO CADUCA) Entrega inmediata', 'microsoftoffice'),
            $this->oemSku(7, 'Office 365 correo genérico', 17.0, 'oem_mv_o365_generico', '(NO CADUCA) Entrega inmediata', 'microsoft'),
            $this->oemSku(8, 'Office 365 correo personal', 55.0, 'oem_mv_o365_personal', '(1 AÑO) Entrega inmediata', 'microsoft', 'oem_license_subscription', 'annual'),
            $this->oemSku(9, 'Suscripción Autodesk (aleatorio)', 25.0, 'oem_mv_autodesk_rand', '(1 AÑO) Entrega inmediata', 'autodesk', 'oem_license_subscription', 'annual'),
            $this->oemSku(10, 'Suscripción Autodesk (personal)', 35.0, 'oem_mv_autodesk_pers', '(1 AÑO) Entrega inmediata', 'autodesk', 'oem_license_subscription', 'annual'),
        ];

        $this->upsertSkus($pid, $rows);
    }

    private function seedSkusAntivirusPrincipales(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'oem-antivirus-principales')->value('id');
        $rows = [
            $this->oemSku(11, 'ESET Nod32 — 6 meses', 15.0, 'oem_av_nod32_6m', 'Entrega inmediata', 'eset'),
            $this->oemSku(12, 'ESET Nod32 — 1 año', 20.0, 'oem_av_nod32_1y', 'Entrega inmediata', 'eset', 'oem_license_subscription', 'annual'),
            $this->oemSku(13, 'ESET Internet Security — 6 meses', 20.0, 'oem_av_eis_6m', 'Entrega inmediata', 'eset'),
            $this->oemSku(14, 'ESET Internet Security — 1 año', 25.0, 'oem_av_eis_1y', 'Entrega inmediata', 'eset', 'oem_license_subscription', 'annual'),
            $this->oemSku(15, 'ESET Internet Security — 2 años', 35.0, 'oem_av_eis_2y', 'Entrega inmediata', 'eset', 'oem_license_subscription', 'annual'),
            $this->oemSku(16, 'ESET Smart Security Premium — 1 año', 35.0, 'oem_av_essp_1y', 'Entrega inmediata', 'eset', 'oem_license_subscription', 'annual'),
            $this->oemSku(17, 'Kaspersky Standard — 1 año', 40.0, 'oem_av_kasp_std', 'Entrega inmediata', 'kaspersky', 'oem_license_subscription', 'annual'),
            $this->oemSku(18, 'Kaspersky Plus — 1 año', 50.0, 'oem_av_kasp_plus', 'Entrega inmediata', 'kaspersky', 'oem_license_subscription', 'annual'),
            $this->oemSku(19, 'McAfee Total Protection — 1 año', 50.0, 'oem_av_mcafee_1y', 'Entrega inmediata', 'mcafee', 'oem_license_subscription', 'annual'),
            $this->oemSku(20, 'McAfee Total Protection — 2 años', 65.0, 'oem_av_mcafee_2y', 'Entrega inmediata', 'mcafee', 'oem_license_subscription', 'annual'),
        ];

        $this->upsertSkus($pid, $rows);
    }

    private function seedSkusAntivirusOtros(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'oem-antivirus-otros')->value('id');
        $rows = [
            $this->oemSku(18, 'Bitdefender Antivirus Plus — 1 año', 39.0, 'oem_av2_bitdef_ap', '(1 AÑO) Entrega inmediata', 'bitdefender', 'oem_license_subscription', 'annual'),
            $this->oemSku(19, 'Bitdefender Total Security — 1 año', 49.0, 'oem_av2_bitdef_ts', '(1 AÑO) Entrega inmediata', 'bitdefender', 'oem_license_subscription', 'annual'),
            $this->oemSku(20, 'Norton Antivirus Plus — 1 año', 53.0, 'oem_av2_norton', '(1 AÑO) Entrega inmediata', 'norton', 'oem_license_subscription', 'annual'),
            $this->oemSku(21, 'AVG Internet Security — 1 año', 47.0, 'oem_av2_avg', '(1 AÑO) Entrega inmediata', 'avg', 'oem_license_subscription', 'annual'),
            $this->oemSku(22, 'ESET File Security — 1 año', 195.0, 'oem_av2_eset_fs', '(1 AÑO) Entrega inmediata', 'eset', 'oem_license_subscription', 'annual'),
        ];

        $this->upsertSkus($pid, $rows);
    }

    private function seedSkusOtrosProductos(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'oem-otros-productos')->value('id');
        $rows = [
            $this->oemSku(23, 'Visio 2019 Professional', 18.0, 'oem_op_visio2019', '(NO CADUCA) Entrega inmediata', 'microsoftoffice'),
            $this->oemSku(24, 'Visio 2021 Professional', 20.0, 'oem_op_visio2021', '(NO CADUCA) Entrega inmediata', 'microsoftoffice'),
            $this->oemSku(25, 'Microsoft Project 2019 Professional', 18.0, 'oem_op_proj2019', '(NO CADUCA) Entrega inmediata', 'microsoftoffice'),
            $this->oemSku(26, 'Microsoft Project 2021 Professional', 20.0, 'oem_op_proj2021', '(NO CADUCA) Entrega inmediata', 'microsoftoffice'),
            $this->oemSku(27, 'Office 2016 blindado', 130.0, 'oem_op_off2016_blind', '(NO CADUCA) Consultar stock', 'microsoftoffice'),
            $this->oemSku(28, 'Office 2019 blindado', 260.0, 'oem_op_off2019_blind', '(NO CADUCA) Consultar stock', 'microsoftoffice'),
            $this->oemSku(29, 'Office 2021 blindado', 370.0, 'oem_op_off2021_blind', '(NO CADUCA) Consultar stock', 'microsoftoffice'),
            $this->oemSku(30, 'Microsoft 365 Familia — 1 año', 220.0, 'oem_op_m365_fam', '(1 AÑO) Entrega inmediata', 'microsoft', 'oem_license_subscription', 'annual'),
        ];

        $this->upsertSkus($pid, $rows);
    }

    private function seedSkusOfficeMac(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'oem-office-mac')->value('id');
        $rows = [
            $this->oemSku(31, 'Office 2016 Home & Business (Mac)', 85.0, 'oem_mac_off2016_hb', '(NO CADUCA) Consultar stock', 'microsoftoffice'),
            $this->oemSku(32, 'Office 2019 Home & Business (Mac)', 230.0, 'oem_mac_off2019_hb', '(NO CADUCA) Consultar stock', 'microsoftoffice'),
            $this->oemSku(33, 'Office 2021 Home & Business (Mac)', 380.0, 'oem_mac_off2021_hb', '(NO CADUCA) Consultar stock', 'microsoftoffice'),
        ];

        $this->upsertSkus($pid, $rows);
    }

    private function seedSkusNuevosIngresos(): void
    {
        $pid = CatalogProduct::query()->where('slug', 'oem-nuevos-ingresos')->value('id');
        $rows = [
            $this->oemSku(34, 'Windows 10 Home', 20.0, 'oem_ni_win10h', '(NO CADUCA) Entrega inmediata', 'windows'),
            $this->oemSku(35, 'Windows 11 Home', 20.0, 'oem_ni_win11h', '(NO CADUCA) Entrega inmediata', 'windows'),
            $this->oemSku(36, 'Windows Server 2012', 36.0, 'oem_ni_ws2012', '(NO CADUCA) Entrega inmediata', 'windows'),
            $this->oemSku(37, 'Windows Server 2016', 40.0, 'oem_ni_ws2016', '(NO CADUCA) Entrega inmediata', 'windows'),
            $this->oemSku(38, 'Windows Server 2019', 43.0, 'oem_ni_ws2019', '(NO CADUCA) Entrega inmediata', 'windows'),
            $this->oemSku(39, 'Windows Server 2022', 47.0, 'oem_ni_ws2022', '(NO CADUCA) Entrega inmediata', 'windows'),
            $this->oemSku(40, 'Canva Pro — 1 mes', 4.0, 'oem_ni_canva_1m', 'Entrega inmediata', 'canva', 'oem_license_subscription', 'monthly'),
            $this->oemSku(41, 'Canva Pro — 6 meses', 18.0, 'oem_ni_canva_6m', 'Entrega inmediata', 'canva', 'oem_license_subscription', 'custom', 180),
            $this->oemSku(42, 'Canva Pro — 1 año', 30.0, 'oem_ni_canva_1y', 'Entrega inmediata', 'canva', 'oem_license_subscription', 'annual'),
            $this->oemSku(43, 'Canva Pro — permanente', 70.0, 'oem_ni_canva_perm', 'Entrega inmediata', 'canva'),
        ];

        $this->upsertSkus($pid, $rows);
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
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
                    'fulfillment_type' => 'external_vendor',
                    'is_active' => true,
                ]),
            );
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function oemSku(
        int $listNumber,
        string $name,
        float $price,
        string $code,
        string $detail,
        string $iconKey,
        string $saleModel = 'oem_license_one_time',
        ?string $billing = 'one_time',
        ?int $rentalDays = null,
    ): array {
        return [
            'code' => $code,
            'name' => $name,
            'list_price' => $price,
            'sale_model' => $saleModel,
            'billing_interval' => $billing,
            'rental_days' => $rentalDays,
            'sort_order' => $listNumber * 10,
            'metadata' => [
                'sku_line' => 'oem',
                'list_number' => $listNumber,
                'detail' => $detail,
                'icon_key' => $iconKey,
                'image_url' => null,
            ],
        ];
    }
}
