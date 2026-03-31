<?php

namespace App\Services\Catalog;

use App\Models\CatalogSku;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CatalogSkusExcelExport
{
    /**
     * @var array<string, string>
     */
    private const HEADER_COLORS = [
        'A' => '2E6BA8',
        'B' => '4A80B8',
        'C' => '3D7199',
        'D' => '5A8FC4',
        'E' => '4A7A9E',
        'F' => '3D6FA8',
        'G' => '2E6BA8',
        'H' => '4A80B8',
        'I' => '3D7199',
        'J' => '5A8FC4',
        'K' => '4A7A9E',
    ];

    /**
     * @var array<string, float>
     */
    private const COLUMN_WIDTHS = [
        'A' => 12,
        'B' => 18,
        'C' => 28,
        'D' => 28,
        'E' => 22,
        'F' => 18,
        'G' => 12,
        'H' => 10,
        'I' => 22,
        'J' => 18,
        'K' => 10,
    ];

    private const LAST_COL = 'K';

    public static function saleModelLabel(string $value): string
    {
        return match ($value) {
            'source_perpetual' => 'Código perpetuo',
            'source_rental' => 'Código alquiler',
            'saas_subscription' => 'SaaS',
            'oem_license_one_time' => 'OEM único',
            'oem_license_subscription' => 'OEM suscripción',
            'service_project' => 'Servicio proyecto',
            'service_subscription' => 'Servicio recurrente',
            default => $value,
        };
    }

    /**
     * @param  Collection<int, CatalogSku>  $skus
     */
    public static function buildSpreadsheet(Collection $skus): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('SKUs');

        $headers = [
            'A1' => 'Estado',
            'B1' => 'Código',
            'C1' => 'Nombre',
            'D1' => 'Producto',
            'E1' => 'Categoría',
            'F1' => 'Línea de ingreso',
            'G1' => 'Precio lista',
            'H1' => 'Moneda',
            'I1' => 'Modelo de venta',
            'J1' => 'Entrega',
            'K1' => 'Orden',
        ];

        foreach ($headers as $cell => $label) {
            $sheet->setCellValue($cell, $label);
        }

        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
        ];

        foreach (array_keys(self::HEADER_COLORS) as $col) {
            $sheet->getStyle($col.'1')->applyFromArray(array_merge($headerStyle, [
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => self::HEADER_COLORS[$col]],
                ],
                'borders' => self::thinBorder(),
            ]));
        }

        $sheet->getRowDimension(1)->setRowHeight(28);

        foreach (self::COLUMN_WIDTHS as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        $row = 2;
        foreach ($skus as $s) {
            self::applyDataRow($sheet, $row, $s);
            $row++;
        }

        $lastRow = $row - 1;

        if ($lastRow >= 2) {
            $range = 'A2:'.self::LAST_COL.$lastRow;
            $sheet->getStyle($range)->applyFromArray([
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_TOP,
                    'wrapText' => true,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'CBD5E1'],
                    ],
                ],
            ]);

            for ($r = 2; $r <= $lastRow; $r++) {
                if ($r % 2 === 0) {
                    $sheet->getStyle('A'.$r.':'.self::LAST_COL.$r)->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F1F5F9'],
                        ],
                    ]);
                }
            }
        }

        $sheet->freezePane('A2');
        $sheet->setAutoFilter('A1:'.self::LAST_COL.$lastRow);

        return $spreadsheet;
    }

    private static function thinBorder(): array
    {
        return [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => 'E2E8F0'],
            ],
        ];
    }

    private static function applyDataRow(Worksheet $sheet, int $row, CatalogSku $s): void
    {
        $sheet->setCellValue('A'.$row, $s->is_active ? 'Activo' : 'Inactivo');
        $sheet->setCellValue('B'.$row, (string) $s->code);
        $sheet->setCellValue('C'.$row, (string) $s->name);
        $sheet->setCellValue('D'.$row, (string) ($s->product?->name ?? '—'));
        $sheet->setCellValue('E'.$row, (string) ($s->product?->category?->name ?? '—'));
        $sheet->setCellValue('F'.$row, CatalogProductsExcelExport::revenueLineLabel($s->product?->category?->revenue_line));
        $sheet->setCellValue('G'.$row, (string) $s->list_price);
        $sheet->setCellValue('H'.$row, (string) $s->currency);
        $sheet->setCellValue('I'.$row, self::saleModelLabel((string) $s->sale_model));
        $sheet->setCellValue('J'.$row, (string) $s->fulfillment_type);
        $sheet->setCellValue('K'.$row, (string) (int) $s->sort_order);

        $sheet->getStyle('A'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('B'.$row)->getFont()->setName('Courier New');
        $sheet->getStyle('G'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle('K'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    }
}
