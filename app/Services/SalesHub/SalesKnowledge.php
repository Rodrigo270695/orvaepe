<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use App\Models\SalesHubProduct;
use App\Models\SalesHubSection;
use App\Services\OpenWaLines\SaasDirectory;
use Illuminate\Support\Str;

/**
 * Conocimiento con el que vende el bot: lo editado en ORVAE manda y los planes y precios
 * siempre vienen del SaaS (para no desfasarse de lo que se cobra).
 * Si ORVAE aún no tiene nada de un SaaS, se usa lo que publica el propio SaaS.
 */
final class SalesKnowledge
{
    public function __construct(
        private readonly SaasKnowledgeClient $saas,
        private readonly SaasDirectory $directory,
    ) {}

    /**
     * @return array<string, mixed>|null
     */
    public function get(string $producto): ?array
    {
        if (! array_key_exists($producto, $this->directory->connected())) {
            return null;
        }

        $remote = $this->saas->get($producto);
        $local = SalesHubProduct::query()->where('producto', $producto)->first();

        if ($remote === null && $local === null) {
            return null;
        }

        $base = $remote ?? [
            'producto' => $producto,
            'nombre' => $this->directory->connected()[$producto],
            'resumen' => null,
            'publico' => null,
            'palabras_clave' => [],
            'planes' => [],
            'secciones' => [],
            'demo' => null,
            'registro_url' => null,
        ];

        $base['instrucciones'] = null;
        $base['fuente'] = ['planes' => $remote !== null ? 'saas' : null, 'conocimiento' => 'saas'];

        if ($local === null) {
            return $base;
        }

        $sections = $this->localSections($producto);

        return array_merge($base, array_filter([
            'nombre' => $local->nombre,
            'resumen' => $local->resumen,
            'publico' => $local->publico,
            'registro_url' => $local->registro_url,
            'instrucciones' => $local->instrucciones,
        ], filled(...)), [
            'palabras_clave' => filled($local->palabras_clave) ? array_values($local->palabras_clave) : ($base['palabras_clave'] ?? []),
            'demo' => filled($local->demo_url)
                ? ['url' => $local->demo_url, 'usuario' => $local->demo_usuario, 'password' => $local->demo_password]
                : ($base['demo'] ?? null),
            'secciones' => $sections !== [] ? $sections : ($base['secciones'] ?? []),
            'fuente' => ['planes' => $base['fuente']['planes'], 'conocimiento' => 'orvae'],
        ]);
    }

    /**
     * Copia a ORVAE lo que hoy publica el SaaS (sin planes). Solo crea lo que falta:
     * no pisa campos ni bloques ya editados en ORVAE.
     *
     * @return array{campos: int, secciones: int}|null null si el SaaS no respondió
     */
    public function importFromSaas(string $producto): ?array
    {
        $this->saas->forget($producto);
        $remote = $this->saas->get($producto);

        if ($remote === null) {
            return null;
        }

        $local = SalesHubProduct::query()->firstOrNew(['producto' => $producto]);
        $campos = 0;

        $fill = [
            'nombre' => $remote['nombre'] ?? null,
            'resumen' => $remote['resumen'] ?? null,
            'publico' => $remote['publico'] ?? null,
            'registro_url' => $remote['registro_url'] ?? null,
            'demo_url' => $remote['demo']['url'] ?? null,
            'demo_usuario' => $remote['demo']['usuario'] ?? null,
            'demo_password' => $remote['demo']['password'] ?? null,
        ];

        foreach ($fill as $field => $value) {
            if (blank($local->{$field}) && filled($value)) {
                $local->{$field} = $value;
                $campos++;
            }
        }

        if (blank($local->palabras_clave) && filled($remote['palabras_clave'] ?? null)) {
            $local->palabras_clave = $remote['palabras_clave'];
            $campos++;
        }

        $local->save();

        $existing = SalesHubSection::query()->where('producto', $producto)->get()
            ->map(fn (SalesHubSection $s): string => $s->tipo.'|'.Str::lower($s->titulo))
            ->all();
        $orden = (int) SalesHubSection::query()->where('producto', $producto)->max('orden');
        $secciones = 0;

        foreach ($remote['secciones'] ?? [] as $seccion) {
            $key = $seccion['tipo'].'|'.Str::lower((string) $seccion['titulo']);

            if (in_array($key, $existing, true)) {
                continue;
            }

            SalesHubSection::query()->create([
                'producto' => $producto,
                'tipo' => $seccion['tipo'],
                'titulo' => $seccion['titulo'],
                'contenido' => $seccion['contenido'],
                'orden' => ++$orden,
            ]);
            $existing[] = $key;
            $secciones++;
        }

        return ['campos' => $campos, 'secciones' => $secciones];
    }

    /**
     * @return list<array{tipo: string, titulo: string, contenido: string, fecha: null}>
     */
    private function localSections(string $producto): array
    {
        return SalesHubSection::query()
            ->where('producto', $producto)
            ->where('activo', true)
            ->orderBy('orden')
            ->orderBy('id')
            ->get()
            ->map(fn (SalesHubSection $s): array => [
                'tipo' => in_array($s->tipo, SalesHubSection::TIPOS, true) ? $s->tipo : 'general',
                'titulo' => $s->titulo,
                'contenido' => $s->contenido,
                'fecha' => null,
            ])
            ->all();
    }
}
