<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OpenWA compartido con VetSaaS (wa.vetsaas.orvae.pe)
    |--------------------------------------------------------------------------
    |
    | Solo para canales de tenants con provider=openwa (/internal/whatsapp/send).
    | Las notificaciones de ORVAE usan su propio gateway: config/openwa_lines.php.
    | OPENWA_API_KEY debe coincidir con la del gateway (misma que VetSaaS).
    |
    */
    'api_url' => rtrim((string) env('OPENWA_API_URL', 'https://wa.vetsaas.orvae.pe'), '/'),

    'api_key' => env('OPENWA_API_KEY'),

    'timeout_seconds' => (int) env('OPENWA_TIMEOUT_SECONDS', 30),

];
