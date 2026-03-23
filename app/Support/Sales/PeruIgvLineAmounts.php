<?php

namespace App\Support\Sales;

/**
 * Montos de una línea de pedido: base imponible (sin IGV), IGV y total de línea.
 */
final readonly class PeruIgvLineAmounts
{
    public function __construct(
        public float $baseLine,
        public float $taxLine,
        public float $lineTotal,
    ) {}
}
