<?php

declare(strict_types=1);

namespace App\Support\Marketing;

/**
 * Features comerciales VetSaaS por plan (fallback si la API no responde).
 * Alineado con PlansAndFeaturesSeeder de VetSaaS.
 */
final class VetSaaSPlanFeaturesCatalog
{
    /**
     * @return array<string, array{nombre: string, descripcion: string, badge: ?string, highlights: list<string>}>
     */
    public static function byCodigo(): array
    {
        return [
            'free' => [
                'nombre' => 'Free',
                'descripcion' => 'Para conocer el sistema sin compromiso',
                'badge' => null,
                'highlights' => [
                    'Actívate gratis en minutos',
                    '1 usuario',
                    'Hasta 50 pacientes',
                    '100 citas / mes',
                    'Historia clínica SOAP',
                    'Documentación de ayuda',
                ],
            ],
            'starter' => [
                'nombre' => 'Starter',
                'descripcion' => 'Para clínicas pequeñas que inician su digitalización',
                'badge' => null,
                'highlights' => [
                    '2 usuarios',
                    'Hasta 300 pacientes',
                    '500 citas / mes',
                    'Historia clínica SOAP',
                    'Inventario y stock',
                    'WhatsApp (50/mes)',
                    'Soporte por correo',
                ],
            ],
            'pro' => [
                'nombre' => 'Pro',
                'descripcion' => 'Para clínicas en crecimiento con operación activa',
                'badge' => 'Más popular',
                'highlights' => [
                    '5 usuarios',
                    'Pacientes ilimitados',
                    'Citas ilimitadas',
                    'Inventario + grooming + laboratorio',
                    'WhatsApp ilimitado',
                    'Reportes avanzados',
                    'Soporte por WhatsApp',
                ],
            ],
            'clinica' => [
                'nombre' => 'Clínica',
                'descripcion' => 'Para clínicas grandes con múltiples sedes y equipo',
                'badge' => 'Mejor valor',
                'highlights' => [
                    'Usuarios ilimitados',
                    'Multi-sede (hasta 3)',
                    'Facturación electrónica SUNAT',
                    'Grooming + hotel + laboratorio',
                    'WhatsApp ilimitado',
                    'API de acceso',
                    'Soporte WhatsApp prioritario',
                ],
            ],
        ];
    }

    /**
     * @return list<array{key: string, label: string, free: string, starter: string, pro: string, clinica: string}>
     */
    public static function comparisonRows(): array
    {
        return [
            ['key' => 'usuarios', 'label' => 'Usuarios', 'free' => '1', 'starter' => '2', 'pro' => '5', 'clinica' => 'Ilimitados'],
            ['key' => 'pacientes', 'label' => 'Pacientes', 'free' => '50', 'starter' => '300', 'pro' => 'Ilimitados', 'clinica' => 'Ilimitados'],
            ['key' => 'citas', 'label' => 'Citas / mes', 'free' => '100', 'starter' => '500', 'pro' => 'Ilimitadas', 'clinica' => 'Ilimitadas'],
            ['key' => 'hc', 'label' => 'Historia clínica', 'free' => 'Sí', 'starter' => 'Sí', 'pro' => 'Sí', 'clinica' => 'Sí'],
            ['key' => 'stock', 'label' => 'Inventario', 'free' => '—', 'starter' => 'Sí', 'pro' => 'Sí', 'clinica' => 'Sí'],
            ['key' => 'grooming', 'label' => 'Grooming', 'free' => '—', 'starter' => '—', 'pro' => 'Sí', 'clinica' => 'Sí'],
            ['key' => 'lab', 'label' => 'Laboratorio', 'free' => '—', 'starter' => '—', 'pro' => 'Sí', 'clinica' => 'Sí'],
            ['key' => 'hotel', 'label' => 'Hotel / guardería', 'free' => '—', 'starter' => '—', 'pro' => '—', 'clinica' => 'Sí'],
            ['key' => 'fel', 'label' => 'Facturación SUNAT', 'free' => '—', 'starter' => '—', 'pro' => '—', 'clinica' => 'Sí'],
            ['key' => 'wa', 'label' => 'WhatsApp', 'free' => '—', 'starter' => '50/mes', 'pro' => 'Ilimitado', 'clinica' => 'Ilimitado'],
            ['key' => 'sedes', 'label' => 'Sedes', 'free' => '1', 'starter' => '1', 'pro' => '1', 'clinica' => 'Hasta 3'],
            ['key' => 'soporte', 'label' => 'Soporte', 'free' => 'Docs', 'starter' => 'Email', 'pro' => 'WhatsApp', 'clinica' => 'Prioritario'],
        ];
    }
}
