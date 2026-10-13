<?php

return [

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Cloud API (Meta) — módulo paralelo a OpenWA
    |--------------------------------------------------------------------------
    |
    | Meta llama a /webhooks/whatsapp. Orvae resuelve el canal por phone_number_id
    | (tabla wa_channels) y reenvía el evento normalizado al producto dueño
    | (VetSaaS, TallerSaaS) por su API interna firmada con HMAC.
    | No depende de config/openwa.php ni de App\Services\OpenWa.
    |
    */
    'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),

    'app_secret' => env('WHATSAPP_APP_SECRET'),

    'graph_url' => rtrim((string) env('WHATSAPP_GRAPH_URL', 'https://graph.facebook.com'), '/'),

    'graph_version' => env('WHATSAPP_GRAPH_VERSION', 'v21.0'),

    'template_language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'es'),

    'send_timeout_seconds' => (int) env('WHATSAPP_SEND_TIMEOUT_SECONDS', 15),

    /*
    | Productos que pueden usar POST /internal/whatsapp/send y recibir eventos.
    | Cada producto tiene su propia API key: un producto no puede enviar como otro.
    | events_url: endpoint interno del producto, firmado con services.{producto}.hmac_secret.
    */
    'products' => [
        'vetsaas' => [
            'internal_api_key' => env('WHATSAPP_INTERNAL_KEY_VETSAAS'),
            'events_url' => env('VETSAAS_WHATSAPP_EVENTS_URL'),
        ],
        'tallersaas' => [
            'internal_api_key' => env('WHATSAPP_INTERNAL_KEY_TALLERSAAS'),
            'events_url' => env('TALLERSAAS_WHATSAPP_EVENTS_URL'),
        ],
    ],

];
