<?php

declare(strict_types=1);

namespace App\Support\Marketing;

/**
 * Features comerciales VetSaaS: todos los módulos en todos los planes;
 * la diferencia es cantidad (sedes, usuarios, pacientes, propietarios, productos, comprobantes).
 */
final class VetSaaSPlanFeaturesCatalog
{
    /**
     * @return array<string, array{nombre: string, descripcion: string, badge: ?string, highlights: list<string>, limits: array<string, int>}>
     */
    public static function byCodigo(): array
    {
        return [
            'free' => [
                'nombre' => 'Free',
                'descripcion' => 'Para conocer el sistema sin compromiso',
                'badge' => null,
                'limits' => [
                    'max_sedes' => 1,
                    'max_usuarios' => 1,
                    'max_pacientes' => 30,
                    'max_propietarios' => 30,
                    'max_productos' => 30,
                    'max_comprobantes_mes' => 0,
                ],
                'highlights' => [
                    'Todos los módulos incluidos',
                    '1 sede · 1 usuario',
                    '30 pacientes y propietarios',
                    '30 productos',
                    'Comprobantes SUNAT: 0 / mes',
                    'Actívate gratis en minutos',
                ],
            ],
            'starter' => [
                'nombre' => 'Starter',
                'descripcion' => 'Para clínicas pequeñas que empiezan a digitalizarse',
                'badge' => null,
                'limits' => [
                    'max_sedes' => 1,
                    'max_usuarios' => 2,
                    'max_pacientes' => 300,
                    'max_propietarios' => 300,
                    'max_productos' => 200,
                    'max_comprobantes_mes' => 50,
                ],
                'highlights' => [
                    'Todos los módulos incluidos',
                    '1 sede · 2 usuarios',
                    '300 pacientes y propietarios',
                    '200 productos',
                    '50 comprobantes SUNAT / mes',
                ],
            ],
            'pro' => [
                'nombre' => 'Pro',
                'descripcion' => 'Para clínicas en crecimiento con más volumen',
                'badge' => 'Más popular',
                'limits' => [
                    'max_sedes' => 1,
                    'max_usuarios' => 5,
                    'max_pacientes' => -1,
                    'max_propietarios' => -1,
                    'max_productos' => 500,
                    'max_comprobantes_mes' => 300,
                ],
                'highlights' => [
                    'Todos los módulos incluidos',
                    '1 sede · 5 usuarios',
                    'Pacientes y propietarios ilimitados',
                    '500 productos',
                    '300 comprobantes SUNAT / mes',
                ],
            ],
            'clinica' => [
                'nombre' => 'Clínica',
                'descripcion' => 'Para equipos grandes y varias sedes',
                'badge' => 'Mejor valor',
                'limits' => [
                    'max_sedes' => 3,
                    'max_usuarios' => -1,
                    'max_pacientes' => -1,
                    'max_propietarios' => -1,
                    'max_productos' => -1,
                    'max_comprobantes_mes' => -1,
                ],
                'highlights' => [
                    'Todos los módulos incluidos',
                    'Hasta 3 sedes · usuarios ilimitados',
                    'Pacientes, propietarios y productos ilimitados',
                    'Comprobantes SUNAT ilimitados',
                ],
            ],
        ];
    }

    /**
     * @return list<array{key: string, label: string, free: string, starter: string, pro: string, clinica: string}>
     */
    public static function comparisonRows(): array
    {
        $catalog = self::byCodigo();

        $keys = [
            'max_sedes' => 'Sedes',
            'max_usuarios' => 'Usuarios',
            'max_pacientes' => 'Pacientes',
            'max_propietarios' => 'Propietarios',
            'max_productos' => 'Productos',
            'max_comprobantes_mes' => 'Comprobantes SUNAT / mes',
        ];

        $rows = [];
        foreach ($keys as $feature => $label) {
            $row = ['key' => $feature, 'label' => $label];
            foreach (['free', 'starter', 'pro', 'clinica'] as $codigo) {
                $row[$codigo] = self::formatLimit($catalog[$codigo]['limits'][$feature] ?? 0);
            }
            $rows[] = $row;
        }

        return $rows;
    }

    public static function formatLimit(int $value): string
    {
        if ($value === -1) {
            return 'Ilimitado';
        }

        if ($value === 0) {
            return '0';
        }

        return number_format($value, 0, '.', ',');
    }
}
