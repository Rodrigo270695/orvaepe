<?php

namespace App\Support\Sales;

/**
 * Calcula base imponible, IGV y total por línea según el flag del SKU
 * {@see \App\Models\CatalogSku::$tax_included}, {@see \App\Models\CatalogSku::$igv_applies}
 * y la tasa configurada.
 *
 * Criterio alineado a la práctica tributaria peruana (base sin IGV; IGV 18 %):
 * - Precio **sin** IGV en catálogo: base = cantidad × precio; IGV = base × tasa.
 * - Precio **con** IGV en catálogo: total línea = cantidad × precio; base = total ÷ (1+tasa);
 *   IGV = total − base (redondeo a 2 decimales).
 *
 * Si {@see CatalogSku::$igv_applies} es false: no se calcula IGV; el importe de catálogo es el total
 * (base = total, impuesto 0).
 *
 * @see https://orientacion.sunat.gob.pe/3109-05-calculo-del-impuesto
 */
final class PeruIgvLineCalculator
{
    public static function forLine(
        int $qty,
        float $listPriceUnit,
        bool $taxIncluded,
        ?float $igvRate = null,
        bool $igvApplies = true,
    ): PeruIgvLineAmounts {
        if (! $igvApplies) {
            $lineTotal = round($qty * $listPriceUnit, 2);

            return new PeruIgvLineAmounts($lineTotal, 0.0, $lineTotal);
        }

        $rate = $igvRate ?? (float) config('sales.igv_rate', 0.18);
        if ($rate < 0 || $rate > 1) {
            throw new \InvalidArgumentException('La tasa IGV debe estar entre 0 y 1.');
        }

        if ($taxIncluded) {
            $lineTotal = round($qty * $listPriceUnit, 2);
            $baseLine = round($lineTotal / (1 + $rate), 2);
            $taxLine = round($lineTotal - $baseLine, 2);

            return new PeruIgvLineAmounts($baseLine, $taxLine, $lineTotal);
        }

        $baseLine = round($qty * $listPriceUnit, 2);
        $taxLine = round($baseLine * $rate, 2);
        $lineTotal = round($baseLine + $taxLine, 2);

        return new PeruIgvLineAmounts($baseLine, $taxLine, $lineTotal);
    }

    /**
     * Totales de una línea de CPE.
     *
     * Si hay un total bruto anclado (precio de catálogo/orden con IGV, p. ej. 399.00),
     * el IGV es total − base. Así no aparece el céntimo de 338.14 × 18 % = 60.87 → 399.01.
     */
    public static function forInvoiceLine(
        float $qty,
        float $netUnitPrice,
        float $taxRate,
        bool $igvApplies,
        ?float $anchoredLineTotal = null,
    ): PeruIgvLineAmounts {
        if ($anchoredLineTotal !== null) {
            $lineTotal = round($anchoredLineTotal, 2);

            if (! $igvApplies) {
                return new PeruIgvLineAmounts($lineTotal, 0.0, $lineTotal);
            }

            $baseLine = round($lineTotal / (1 + $taxRate), 2);
            $taxLine = round($lineTotal - $baseLine, 2);

            return new PeruIgvLineAmounts($baseLine, $taxLine, $lineTotal);
        }

        $baseLine = round($qty * $netUnitPrice, 2);

        if (! $igvApplies) {
            return new PeruIgvLineAmounts($baseLine, 0.0, $baseLine);
        }

        $taxLine = round($baseLine * $taxRate, 2);

        return new PeruIgvLineAmounts($baseLine, $taxLine, round($baseLine + $taxLine, 2));
    }

    /**
     * Valor unitario SUNAT (6 decimales) a partir del total de línea con IGV.
     * API SUNAT recomienda no redondear a 2 decimales antes de emitir.
     */
    public static function sunatUnitValue(
        float $qty,
        float $lineTotal,
        float $taxRate,
        bool $igvApplies,
    ): string {
        if ($qty <= 0.0) {
            return number_format(0, 6, '.', '');
        }

        $unit = $igvApplies
            ? $lineTotal / $qty / (1 + $taxRate)
            : $lineTotal / $qty;

        return number_format($unit, 6, '.', '');
    }
}
