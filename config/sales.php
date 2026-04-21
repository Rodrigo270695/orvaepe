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

    /*
    |--------------------------------------------------------------------------
    | PDF de cotización (cabecera / firma)
    |--------------------------------------------------------------------------
    |
    | Nombre y firma usan al usuario creador: `user_profiles.legal_name` o
    | nombre + apellidos. Cargo: `user_profiles.metadata.job_title` si existe.
    | Estas claves solo aplican si no hay creador o falta nombre (respaldo).
    |
    */
    'quote_pdf' => [
        'signatory_name' => env('QUOTE_PDF_SIGNATORY_NAME', 'Rodrigo Granja Requejo'),
        'signatory_title' => env('QUOTE_PDF_SIGNATORY_TITLE', 'Gerente General'),
        'payment_terms' => env('QUOTE_PDF_PAYMENT_TERMS', 'Transferencia, Yape o PLIN'),
    ],

];
