<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI')
            ?: rtrim((string) env('APP_URL', 'http://localhost'), '/').'/auth/google/callback',
    ],

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    | Pasarela (PayPal, Culqi, etc.): cuando sea true, la UI puede mostrar el botón de pago.
    | Sin pasarela activa, el cliente solo ve el estado de sus pedidos.
    */
    'payments' => [
        'gateway_enabled' => env('PAYMENTS_GATEWAY_ENABLED', false),
    ],

    /*
    | Consulta RUC SUNAT vía apiperu.dev (cotizaciones / datos fiscales).
    */
    'apiperu' => [
        'base_url' => env('APIPERU_BASE_URL', 'https://apiperu.dev/api'),
        'token' => env('APIPERU_TOKEN'),
    ],

    /*
    | Integración SaaS ORVAE -> Aula Virtual (provisión de tenant/plan tras pago).
    */
    'aulavirtual' => [
        'enabled' => env('AULAVIRTUAL_PROVISIONING_ENABLED', false),
        'provision_url' => env('AULAVIRTUAL_PROVISION_URL'),
        'renew_url' => env('AULAVIRTUAL_RENEW_URL'),
        'hmac_secret' => env('AULAVIRTUAL_PROVISION_HMAC_SECRET'),
        'tenant_domain' => env('AULAVIRTUAL_TENANT_DOMAIN', 'aulavirtual.orvae.pe'),
        'tenant_scheme' => env('AULAVIRTUAL_TENANT_SCHEME', 'https'),
    ],

    /*
    | Integración ORVAE -> VetSaaS (provisión de clínica tras pago).
    */
    'vetsaas' => [
        'enabled' => env('VETSAAS_PROVISIONING_ENABLED', false),
        'provision_url' => env('VETSAAS_PROVISION_URL'),
        'renew_url' => env('VETSAAS_RENEW_URL'),
        'hmac_secret' => env('VETSAAS_PROVISION_HMAC_SECRET', env('ORVAE_PROVISION_HMAC_SECRET')),
        'tenant_domain' => env('VETSAAS_TENANT_DOMAIN', 'vetsaas.orvae.pe'),
        'tenant_scheme' => env('VETSAAS_TENANT_SCHEME', 'https'),
    ],

];
