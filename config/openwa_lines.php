<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OpenWA propio de ORVAE (líneas de venta por SaaS)
    |--------------------------------------------------------------------------
    |
    | Gateway independiente del OpenWA compartido con VetSaaS (config/openwa.php).
    | Aquí se vinculan los números de ORVAE desde el panel (QR) y se asigna a
    | qué SaaS atiende cada línea.
    |
    */
    'enabled' => (bool) env('ORVAE_OPENWA_ENABLED', false),

    'api_url' => rtrim((string) env('ORVAE_OPENWA_URL', 'https://wa.orvae.pe'), '/'),

    'api_key' => env('ORVAE_OPENWA_API_KEY'),

    'timeout_seconds' => (int) env('ORVAE_OPENWA_TIMEOUT_SECONDS', 30),

    /*
    | SaaS que una línea puede atender (clave => nombre visible).
    */
    'products' => [
        'vetsaas' => 'VetSaaS',
        'tallersaas' => 'TallerSaaS',
        'foodsaas' => 'FoodSaaS',
    ],

];
