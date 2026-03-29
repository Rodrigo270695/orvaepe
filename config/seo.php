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

    /** Imagen Open Graph por defecto (ruta bajo public/). Generar: pnpm run seo:og-image */
    'default_og_image' => env('SEO_DEFAULT_OG_IMAGE', '/images/og/orvae-og-default.png'),

    /** Texto alternativo OG/Twitter (accesibilidad + redes) */
    'default_og_image_alt' => env('SEO_DEFAULT_OG_IMAGE_ALT', 'ORVAE — software empresarial para empresas en Perú'),

    /** Dimensiones reales del archivo default_og_image (recomendado 1200×630) */
    'og_image_width' => (int) env('SEO_OG_IMAGE_WIDTH', 1200),
    'og_image_height' => (int) env('SEO_OG_IMAGE_HEIGHT', 630),

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
     * Plantilla para JSON-LD SearchAction (debe contener el literal {search_term_string}).
     * Si SEO_SITE_SEARCH_URL_TEMPLATE está vacío en .env, no se emite SearchAction.
     * Si no está definida, se usa APP_URL + /software?q={search_term_string}.
     */
    'site_search_url_template' => (static function (): ?string {
        $raw = env('SEO_SITE_SEARCH_URL_TEMPLATE');
        if ($raw === '') {
            return null;
        }
        if (is_string($raw) && trim($raw) !== '') {
            return trim($raw);
        }

        $base = rtrim((string) env('APP_URL', ''), '/');
        if ($base === '') {
            return null;
        }

        return $base.'/software?q={search_term_string}';
    })(),

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
        /**
         * Nombres alternativos (JSON-LD alternateName) para desambiguar la marca en buscadores
         * frente a otros usos de la palabra «ORVAE». Lista separada por comas.
         */
        'alternate_names' => array_values(array_filter(array_map('trim', explode(',', (string) env(
            'SEO_ORG_ALTERNATE_NAMES',
            'ORVAE Software,ORVAE Perú',
        ))))),
        'email' => env('SEO_ORG_EMAIL', env('MAIL_FROM_ADDRESS')),
        'phone' => env('SEO_ORG_PHONE'),
        'same_as' => array_values(array_filter(array_map('trim', explode(',', (string) env('SEO_ORG_SAME_AS', ''))))),
        /**
         * Temas que la organización cubre (JSON-LD knowsAbout). Lista separada por comas.
         */
        'knows_about' => array_values(array_filter(array_map('trim', explode(',', (string) env(
            'SEO_ORG_KNOWS_ABOUT',
            'Software empresarial,ERP,Facturación electrónica,Licencias de software,Soporte técnico,SaaS',
        ))))),
        /**
         * Tipos Schema.org además de Organization (p. ej. SoftwareCompany). Separados por comas.
         */
        'schema_types' => array_values(array_filter(array_map('trim', explode(',', (string) env(
            'SEO_ORG_SCHEMA_TYPES',
            'SoftwareCompany',
        ))))),
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
    ],

];
