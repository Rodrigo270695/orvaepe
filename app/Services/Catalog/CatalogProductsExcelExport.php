<?php

namespace App\Services\Catalog;

use App\Models\CatalogProduct;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CatalogProductsExcelExport
{
    /**
     * Colores de cabecera por columna (paleta coherente con el panel ORVAE).
     *
     * @var array<string, string> letra columna => hex sin #
     */
    private const HEADER_COLORS = [
        'A' => '2E6BA8',
        'B' => '4A80B8',
        'C' => '3D7199',
        'D' => '5A8FC4',
        'E' => '4A7A9E',
        'F' => '3D6FA8',
    ];

    /**
     * Anchos de columna (caracteres aproximados).
     *
     * @var array<string, float>
     */
    private const COLUMN_WIDTHS = [
        'A' => 14,
        'B' => 34,
        'C' => 42,
        'D' => 26,
        'E' => 24,
        'F' => 20,
    ];

    public static function revenueLineLabel(?string $value): string
    {
        return match ($value) {
            'software_system' => 'Sistemas',
            'oem_license' => 'Licencias OEM',
            'service' => 'Servicios',
            default => '—',
        };
    }

    /**
     * @param  Collection<int, CatalogProduct>  $products
     */
    public static function buildSpreadsheet(Collection $products): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Productos');

        $headers = [
            'A1' => 'Estado',
            'B1' => 'Nombre del producto',
            'C1' => 'Tagline / descripción corta',
            'D1' => 'Slug',
            'E1' => 'Categoría',
            'F1' => 'Línea de ingreso',
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
        foreach ($products as $p) {
            self::applyDataRow($sheet, $row, $p);
            $row++;
        }

        $lastRow = $row - 1;

        if ($lastRow >= 2) {
            $sheet->getStyle('A2:F'.$lastRow)->applyFromArray([
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
                    $sheet->getStyle('A'.$r.':F'.$r)->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F1F5F9'],
                        ],
                    ]);
                }
            }
        }

        $sheet->freezePane('A2');
        $sheet->setAutoFilter('A1:F'.$lastRow);

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

    private static function applyDataRow(Worksheet $sheet, int $row, CatalogProduct $p): void
    {
        $sheet->setCellValue('A'.$row, $p->is_active ? 'Activo' : 'Inactivo');
        $sheet->setCellValue('B'.$row, (string) $p->name);
        $tagline = $p->tagline !== null && $p->tagline !== ''
            ? (string) $p->tagline
            : (string) ($p->category?->name ?? '');
        $sheet->setCellValue('C'.$row, $tagline);
        $sheet->setCellValue('D'.$row, (string) $p->slug);
        $sheet->setCellValue('E'.$row, (string) ($p->category?->name ?? '—'));
        $sheet->setCellValue('F'.$row, self::revenueLineLabel($p->category?->revenue_line));

        $sheet->getStyle('A'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('D'.$row)->getFont()->setName('Courier New');
    }
}
