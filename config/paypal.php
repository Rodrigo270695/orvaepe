<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Modo
    |--------------------------------------------------------------------------
    |
    | sandbox — pruebas (https://developer.paypal.com/dashboard/)
    | live    — producción (tras revisión de la cuenta comercial)
    |
    */

    'mode' => env('PAYPAL_MODE', 'sandbox'),

    /*
    |--------------------------------------------------------------------------
    | Credenciales REST (aplicación en el dashboard de desarrolladores PayPal)
    |--------------------------------------------------------------------------
    */

    'client_id' => env('PAYPAL_CLIENT_ID'),

    'secret' => env('PAYPAL_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Moneda enviada a la API de PayPal (Checkout)
    |--------------------------------------------------------------------------
    |
    | Muchas cuentas sandbox / integraciones devuelven CURRENCY_NOT_SUPPORTED con PEN.
    | Por defecto se cobra en USD y se convierte desde PEN usando pen_to_usd_rate.
    | Si tu cuenta acepta PEN, puedes poner PAYPAL_CHECKOUT_CURRENCY=PEN y tasa no aplica.
    |
    */

    'checkout_currency' => strtoupper((string) env('PAYPAL_CHECKOUT_CURRENCY', 'USD')),

    /*
    | PEN → USD solo cuando el pedido está en PEN y checkout_currency es USD.
    | Actualiza el tipo según el día (referencia orientativa).
    |
    */

    'pen_to_usd_rate' => (float) env('PAYPAL_PEN_TO_USD_RATE', 0.27),

    /*
    |--------------------------------------------------------------------------
    | Simular checkout (solo desarrollo local)
    |--------------------------------------------------------------------------
    |
    | Si PAYPAL_SIMULATE_CHECKOUT=true y APP_ENV=local, puedes usar POST
    | /checkout/paypal/simulate para marcar el pedido como pagado sin PayPal.
    | No uses esto en producción.
    |
    */

    'simulate_checkout' => filter_var(env('PAYPAL_SIMULATE_CHECKOUT', false), FILTER_VALIDATE_BOOLEAN),

];
