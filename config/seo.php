<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Marca y textos por defecto (marketing público)
    |--------------------------------------------------------------------------
    */

    'site_name' => env('SEO_SITE_NAME', env('APP_NAME', 'ORVAE')),

    'default_description' => env(
        'SEO_DEFAULT_DESCRIPTION',
        'ORVAE: software empresarial en Perú — ERP, sistemas listos para operar, licencias y servicios. Implementación ágil, soporte y facturación electrónica.',
    ),

    /** Imagen Open Graph por defecto (ruta bajo public/) */
    'default_og_image' => env('SEO_DEFAULT_OG_IMAGE', '/icons/pwa/icon-512.png'),

    /** Texto alternativo OG/Twitter (accesibilidad + redes) */
    'default_og_image_alt' => env('SEO_DEFAULT_OG_IMAGE_ALT', 'ORVAE — software empresarial para empresas en Perú'),

    /**
     * Dimensiones reales del archivo de default_og_image (los crawlers usan OG recomendado 1200×630;
     * cuando subas una imagen dedicada, ajusta también estas variables).
     */
    'og_image_width' => (int) env('SEO_OG_IMAGE_WIDTH', 512),
    'og_image_height' => (int) env('SEO_OG_IMAGE_HEIGHT', 512),

    /** Logo marca para JSON-LD Organization (ruta bajo public/) */
    'logo_path' => env('SEO_LOGO_PATH', '/icons/pwa/icon-512.png'),

    /** og:locale (formato Facebook) */
    'locale' => 'es_PE',

    /** hreflang (formato BCP47) */
    'hreflang' => 'es-PE',

    'twitter_handle' => env('SEO_TWITTER_HANDLE'),

    /** Región ISO para meta geo (opcional) */
    'geo_region' => env('SEO_GEO_REGION', 'PE'),

    /** Ciudad / país visible (opcional) */
    'geo_placename' => env('SEO_GEO_PLACENAME', 'Perú'),

    /**
     * URL de búsqueda interna (opcional). Si existe, WebSite incluye SearchAction.
     * Ejemplo: https://tudominio.com/software?q=
     */
    'site_search_url_template' => env('SEO_SITE_SEARCH_URL_TEMPLATE'),

    /*
    |--------------------------------------------------------------------------
    | Datos estructurados Organization (JSON-LD)
    |--------------------------------------------------------------------------
    */

    'organization' => [
        'name' => env('SEO_ORG_NAME', env('APP_NAME', 'ORVAE')),
        'legal_name' => env('SEO_ORG_LEGAL_NAME'),
        'description' => env(
            'SEO_ORG_DESCRIPTION',
            'Desarrollo de software empresarial, licenciamiento y servicios tecnológicos para empresas en Perú.',
        ),
        'email' => env('SEO_ORG_EMAIL', env('MAIL_FROM_ADDRESS')),
        'phone' => env('SEO_ORG_PHONE'),
        'same_as' => array_values(array_filter(array_map('trim', explode(',', (string) env('SEO_ORG_SAME_AS', ''))))),
    ],

    /*
    |--------------------------------------------------------------------------
    | Sitemap: rutas estáticas (path => prioridad 0.0–1.0)
    |--------------------------------------------------------------------------
    */

    'sitemap_static' => [
        '/' => ['priority' => '1.0', 'changefreq' => 'weekly'],
        '/software' => ['priority' => '0.95', 'changefreq' => 'weekly'],
        '/servicios' => ['priority' => '0.9', 'changefreq' => 'monthly'],
        '/contacto' => ['priority' => '0.85', 'changefreq' => 'monthly'],
        '/licencias' => ['priority' => '0.85', 'changefreq' => 'monthly'],
        '/software-a-medida' => ['priority' => '0.8', 'changefreq' => 'monthly'],
        '/correos-corporativos' => ['priority' => '0.7', 'changefreq' => 'monthly'],
        '/otros-servicios' => ['priority' => '0.7', 'changefreq' => 'monthly'],
    ],

];
