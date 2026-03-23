<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Tasa IGV (Perú)
    |--------------------------------------------------------------------------
    |
    | Tasa estándar del Impuesto General a las Ventas. SUNAT: base imponible
    | sin IGV; IGV = base × tasa. Si el precio de catálogo ya incluye IGV,
    | la base se obtiene como total_gravado ÷ (1 + tasa).
    |
    | @see https://orientacion.sunat.gob.pe/3109-05-calculo-del-impuesto
    |
    */
    'igv_rate' => (float) env('SALES_IGV_RATE', 0.18),

];
