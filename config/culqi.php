<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Credenciales
    |--------------------------------------------------------------------------
    */
    'public_key' => env('CULQI_PUBLIC_KEY'),
    'secret_key' => env('CULQI_SECRET_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Endpoints
    |--------------------------------------------------------------------------
    */
    'base_url' => env('CULQI_BASE_URL', 'https://api.culqi.com/v2'),
    'checkout_script_url' => env('CULQI_CHECKOUT_SCRIPT_URL', 'https://js.culqi.com/checkout-js'),

    /*
    |--------------------------------------------------------------------------
    | Seguridad webhook (opcional)
    |--------------------------------------------------------------------------
    |
    | Si configuras autenticación en CulqiPanel, usa los mismos valores aquí.
    | Si quedan vacíos, el endpoint acepta webhook sin basic auth.
    |
    */
    'webhook_basic_user' => env('CULQI_WEBHOOK_BASIC_USER'),
    'webhook_basic_password' => env('CULQI_WEBHOOK_BASIC_PASSWORD'),
];

