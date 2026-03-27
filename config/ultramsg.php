<?php

return [
    /**
     * Solo el origen de la API (sin /instance.../ ). Si pones la URL completa con instancia
     * en .env, se normaliza igual a https://api.ultramsg.com para no duplicar la ruta.
     */
    'base_url' => env('ULTRAMSG_BASE_URL', 'https://api.ultramsg.com'),
    'instance_id' => env('ULTRAMSG_INSTANCE_ID'),
    'token' => env('ULTRAMSG_TOKEN'),

    /** Opcional: si el usuario superadmin no tiene celular en BD, usa este número (con o sin +51). */
    'admin_number' => env('ULTRAMSG_ADMIN_NUMBER'),
];
