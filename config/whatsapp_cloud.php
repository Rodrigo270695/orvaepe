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
    | Solo red interna: IPs (separadas por coma) que pueden llamar /internal/whatsapp/*.
    | Vacío = sin restricción por IP (solo X-Internal-Key).
    */
    'internal_allowed_ips' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('WHATSAPP_INTERNAL_ALLOWED_IPS', '')),
    ))),

    /*
    | Canal inicial de ORVAE (número de prueba de Meta). Lo crea WhatsAppCloudSeeder;
    | el token solo se lee del .env y se guarda cifrado en wa_channels.
    */
    'default_channel' => [
        'producto' => env('WHATSAPP_DEFAULT_PRODUCTO', 'vetsaas'),
        'tenant_id' => env('WHATSAPP_DEFAULT_TENANT_ID'),
        'phone_number_id' => env('WHATSAPP_DEFAULT_PHONE_NUMBER_ID', '1091510804035130'),
        'waba_id' => env('WHATSAPP_DEFAULT_WABA_ID', '1891985734771702'),
        'access_token' => env('WHATSAPP_ACCESS_TOKEN_DEFAULT'),
    ],

    /*
    | Embedded Signup: cada clínica conecta su propio número desde el producto.
    | ORVAE canjea el code (con app_secret), registra el número, guarda el canal y
    | crea las plantillas en su WABA. app_id y config_id los usa el botón del producto
    | (los recibe de GET /internal/whatsapp/channel). Apagado hasta que Meta apruebe.
    */
    'embedded_signup' => [
        'enabled' => (bool) env('WHATSAPP_EMBEDDED_SIGNUP_ENABLED', false),
        'app_id' => env('WHATSAPP_APP_ID'),
        'config_id' => env('WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID'),
    ],

    /*
    | Definición de las plantillas. WhatsAppCloudSeeder las registra en wa_templates
    | (globales, ya aprobadas en la WABA de ORVAE) y TemplateProvisioner las crea en
    | la WABA de cada clínica. "cuerpo" usa {{n}}; "ejemplos" los pide Meta al crearla.
    */
    'templates' => [
        'recordatorio_vacuna' => [
            'tipo' => 'vacuna',
            'categoria' => 'utility',
            // 1 dueño, 2 mascota, 3 tipo de atención, 4 fecha, 5 hora, 6 clínica
            'variables' => 6,
            'cuerpo' => 'Hola {{1}}, te recordamos que {{2}} tiene {{3}} el {{4}} a las {{5}} en {{6}}. Responde CONFIRMO o REPROGRAMAR.',
            'ejemplos' => ['Ana', 'Rocky', 'vacuna antirrábica', '15/10/2026', '4:00 pm', 'Clínica Demo'],
        ],
    ],

];
