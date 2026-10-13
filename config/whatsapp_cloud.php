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
    | No modifica config/openwa.php ni App\Services\OpenWa.
    |
    */
    'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),

    'app_secret' => env('WHATSAPP_APP_SECRET'),

    'graph_url' => rtrim((string) env('WHATSAPP_GRAPH_URL', 'https://graph.facebook.com'), '/'),

    'graph_version' => env('WHATSAPP_GRAPH_VERSION', 'v25.0'),

    'template_language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'es_PE'),

    'send_timeout_seconds' => (int) env('WHATSAPP_SEND_TIMEOUT_SECONDS', 15),

    /*
    | Límite de envíos por segundo por canal (cola). Meta permite ~80/s por número;
    | dejamos margen para no gatillar 130429.
    */
    'send_per_second' => (int) env('WHATSAPP_SEND_PER_SECOND', 20),

    /*
    | Productos que pueden usar /internal/whatsapp/*. La clave (header X-Internal-Key)
    | identifica al producto. events_url: endpoint interno del producto, firmado con
    | services.{producto}.hmac_secret.
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

    /*
    | Plantillas permitidas. "variables": cantidad exacta que debe enviar el producto.
    | "texto": versión armada para canales OpenWA (en Cloud API el texto vive en la
    | plantilla aprobada en Meta). {{n}} se reemplaza por la variable n.
    */
    'templates' => [
        'recordatorio_vacuna' => [
            // 1 dueño, 2 mascota, 3 tipo de atención, 4 fecha, 5 hora, 6 clínica
            'variables' => 6,
            'texto' => 'Hola {{1}}, te recordamos que {{2}} tiene {{3}} el {{4}} a las {{5}} en {{6}}. Responde CONFIRMO o REPROGRAMAR.',
        ],
    ],

];
