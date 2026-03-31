<?php

namespace App\Services\Catalog;

use App\Models\Coupon;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CouponsExcelExport
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
    ];

    /**
     * @var array<string, float>
     */
    private const COLUMN_WIDTHS = [
        'A' => 12,
        'B' => 18,
        'C' => 14,
        'D' => 12,
        'E' => 12,
        'F' => 12,
        'G' => 18,
        'H' => 18,
        'I' => 22,
    ];

    private const LAST_COL = 'I';

    public static function skuScopeLabel(?array $ids): string
    {
        if ($ids === null) {
            return 'Todos';
        }
        if ($ids === []) {
            return 'Ninguno';
        }

        return count($ids).' SKU(s)';
    }

    /**
     * @param  Collection<int, Coupon>  $coupons
     */
    public static function buildSpreadsheet(Collection $coupons): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Cupones');

        $headers = [
            'A1' => 'Estado',
            'B1' => 'Código',
            'C1' => 'Tipo',
            'D1' => 'Valor',
            'E1' => 'Usos',
            'F1' => 'Máx. usos',
            'G1' => 'Inicia',
            'H1' => 'Vence',
            'I1' => 'Alcance SKU',
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
        foreach ($coupons as $c) {
            self::applyDataRow($sheet, $row, $c);
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

    private static function applyDataRow(Worksheet $sheet, int $row, Coupon $c): void
    {
        $sheet->setCellValue('A'.$row, $c->is_active ? 'Activo' : 'Inactivo');
        $sheet->setCellValue('B'.$row, (string) $c->code);
        $sheet->setCellValue(
            'C'.$row,
            $c->discount_type === Coupon::DISCOUNT_PERCENT ? 'Porcentaje' : 'Monto fijo',
        );
        $sheet->setCellValue('D'.$row, (string) $c->discount_value);
        $sheet->setCellValue('E'.$row, (string) (int) $c->used_count);
        $sheet->setCellValue(
            'F'.$row,
            $c->max_uses !== null ? (string) (int) $c->max_uses : '—',
        );
        $sheet->setCellValue(
            'G'.$row,
            $c->starts_at !== null ? $c->starts_at->format('Y-m-d H:i') : '—',
        );
        $sheet->setCellValue(
            'H'.$row,
            $c->expires_at !== null ? $c->expires_at->format('Y-m-d H:i') : '—',
        );
        $sheet->setCellValue('I'.$row, self::skuScopeLabel($c->applicable_sku_ids));

        $sheet->getStyle('A'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('B'.$row)->getFont()->setName('Courier New');
        $sheet->getStyle('D'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle('E'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle('F'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
    }
}
