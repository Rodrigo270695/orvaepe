<?php

return [
    'base_url' => env('ULTRAMSG_BASE_URL', 'https://api.ultramsg.com'),
    'instance_id' => env('ULTRAMSG_INSTANCE_ID'),
    'token' => env('ULTRAMSG_TOKEN'),

    // Número de WhatsApp por defecto para avisos administrativos (ej. superadmin).
    'admin_number' => env('ULTRAMSG_ADMIN_NUMBER'),
];

