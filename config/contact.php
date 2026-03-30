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
