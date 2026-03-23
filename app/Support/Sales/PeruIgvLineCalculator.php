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
}
