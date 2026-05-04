<?php

return [

    /*
    |--------------------------------------------------------------------------
    | WhatsApp (catálogo marketing: consultas sin precio, botón flotante, etc.)
    | Formato internacional sin +: Perú 51 + 9 dígitos móvil (ej. 51976809804).
    |--------------------------------------------------------------------------
    */

    'whatsapp_e164' => (static function (): string {
        $digits = preg_replace('/\D+/', '', (string) env('CONTACT_WHATSAPP_E164', '51976809804'));

        return $digits !== '' ? $digits : '51976809804';
    })(),

    /*
    |--------------------------------------------------------------------------
    | Domicilio fiscal (SUNAT) — visible en web para clientes y pasarelas de pago
    |--------------------------------------------------------------------------
    */

    'fiscal_address' => (string) env(
        'ORVAE_FISCAL_ADDRESS',
        'MZA. D LOTE. 19 P.J. SANTA TRINIDAD LAMBAYEQUE - CHICLAYO - CHICLAYO',
    ),

    /*
    |--------------------------------------------------------------------------
    | Teléfono legible (ej. +51 976 809 804). Si vacío, se deduce del WhatsApp.
    |--------------------------------------------------------------------------
    */

    'public_phone_display' => (static function (): string {
        $custom = trim((string) env('ORVAE_PUBLIC_PHONE_DISPLAY', ''));
        if ($custom !== '') {
            return $custom;
        }

        $digits = preg_replace('/\D+/', '', (string) env('CONTACT_WHATSAPP_E164', '51976809804'));
        if (str_starts_with($digits, '51') && strlen($digits) >= 11) {
            $n = substr($digits, 2);

            return '+51 '.substr($n, 0, 3).' '.substr($n, 3, 3).' '.substr($n, 6);
        }

        return $digits !== '' ? '+'.$digits : '';
    })(),

    /*
    |--------------------------------------------------------------------------
    | Destino de los mensajes del formulario /contacto
    |--------------------------------------------------------------------------
    */

    'mail_to' => env('CONTACT_MAIL_TO', env('MAIL_FROM_ADDRESS', 'hello@example.com')),

    /*
    |--------------------------------------------------------------------------
    | Opciones del campo «¿Qué te interesa?»
    |--------------------------------------------------------------------------
    */

    'product_interest_options' => [
        ['value' => 'software', 'label' => 'Software ORVAE (ERP, RRHH, inventario, etc.)'],
        ['value' => 'licencias', 'label' => 'Licencias OEM / retail'],
        ['value' => 'servicios', 'label' => 'Servicios (correo, integración, despliegue)'],
        ['value' => 'sunat', 'label' => 'Facturación / SUNAT / emisión electrónica'],
        ['value' => 'custom', 'label' => 'Desarrollo a medida'],
        ['value' => 'other', 'label' => 'Otro / aún no decido'],
    ],

];
