<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OpenWA (WhatsApp gateway self-hosted)
    |--------------------------------------------------------------------------
    |
    | API compartida con VetSaaS: https://wa.vetsaas.orvae.pe/api
    | Admin/dashboard: https://wa-admin.vetsaas.orvae.pe
    |
    | Sesión dedicada para mensajes de plataforma Orvae (órdenes, avisos admin).
    |
    */
    'enabled' => (bool) env('OPENWA_ENABLED', false),

    'api_url' => rtrim((string) env('OPENWA_API_URL', 'https://wa.vetsaas.orvae.pe'), '/'),

    'api_key' => env('OPENWA_API_KEY'),

    'admin_url' => rtrim((string) env('OPENWA_ADMIN_URL', 'https://wa-admin.vetsaas.orvae.pe'), '/'),

    'timeout_seconds' => (int) env('OPENWA_TIMEOUT_SECONDS', 30),

    /*
    | Sesión OpenWA para Orvae. Crear y escanear QR en wa-admin con este nombre.
    */
    'platform_session_name' => env('OPENWA_PLATFORM_SESSION_NAME', 'orvae-platform'),

    /*
    | Número al que llegan alertas admin (nueva compra, vencimientos) si el
    | superadmin no tiene teléfono en BD. Perú: 9 dígitos o 51 + 9 dígitos.
    */
    'admin_notification_number' => env(
        'ORVAE_WHATSAPP_ADMIN_NUMBER',
        env('ULTRAMSG_ADMIN_NUMBER', '976709811'),
    ),

];
