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
    | Número al que llegan alertas admin (nueva compra, vencimientos) si el
    | superadmin no tiene teléfono en BD. Perú: 9 dígitos o 51 + 9 dígitos.
    */
    'admin_notification_number' => env(
        'ORVAE_WHATSAPP_ADMIN_NUMBER',
        env('ULTRAMSG_ADMIN_NUMBER', '976709811'),
    ),

];
