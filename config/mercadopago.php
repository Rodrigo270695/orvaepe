<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Credenciales
    |--------------------------------------------------------------------------
    */
    'access_token' => env('MP_ACCESS_TOKEN'),
    'public_key' => env('MP_PUBLIC_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Moneda checkout
    |--------------------------------------------------------------------------
    |
    | Mercado Pago Perú suele operar con PEN. Si tus pedidos usan otra moneda,
    | puedes fijar la enviada al checkout con MP_CHECKOUT_CURRENCY.
    |
    */
    'checkout_currency' => strtoupper((string) env('MP_CHECKOUT_CURRENCY', 'PEN')),

    /*
    |--------------------------------------------------------------------------
    | Webhook
    |--------------------------------------------------------------------------
    */
    'webhook_url' => env('MP_WEBHOOK_URL'),
];

