<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

use App\Models\OpenWaLine;
use Illuminate\Support\Str;

/**
 * Decide de qué SaaS habla el cliente con las palabras clave que publica cada uno.
 */
final class ProductResolver
{
    public function __construct(
        private readonly SaasKnowledgeClient $knowledge,
    ) {}

    /**
     * SaaS asignados a la línea que publican conocimiento.
     *
     * @return array<string, array<string, mixed>>
     */
    public function knowledgeFor(OpenWaLine $line): array
    {
        $out = [];

        foreach ((array) $line->productos as $producto) {
            if (is_string($producto) && ($data = $this->knowledge->get($producto)) !== null) {
                $out[$producto] = $data;
            }
        }

        return $out;
    }

    /**
     * El SaaS con más coincidencias; null si no hay ninguna o hay empate.
     */
    public function detect(OpenWaLine $line, string $text): ?string
    {
        $haystack = ' '.self::normalize($text).' ';
        $scores = [];

        foreach ($this->knowledgeFor($line) as $producto => $data) {
            $keywords = [$producto, (string) ($data['nombre'] ?? ''), ...($data['palabras_clave'] ?? [])];
            $score = 0;

            foreach (array_unique(array_filter(array_map(self::normalize(...), $keywords))) as $keyword) {
                if (str_contains($haystack, ' '.$keyword.' ')) {
                    $score++;
                }
            }

            if ($score > 0) {
                $scores[$producto] = $score;
            }
        }

        if ($scores === []) {
            return null;
        }

        arsort($scores);
        $top = array_slice($scores, 0, 2, true);
        $values = array_values($top);

        return count($values) > 1 && $values[0] === $values[1] ? null : (string) array_key_first($top);
    }

    public function hasIntent(string $text): bool
    {
        $haystack = ' '.self::normalize($text).' ';

        foreach ((array) config('saleshub.intent_keywords', []) as $keyword) {
            if (str_contains($haystack, ' '.self::normalize((string) $keyword).' ')) {
                return true;
            }
        }

        return false;
    }

    public static function normalize(string $text): string
    {
        $ascii = Str::lower(Str::ascii($text));

        return trim(preg_replace('/\s+/', ' ', preg_replace('/[^a-z0-9]+/', ' ', $ascii) ?? '') ?? '');
    }
}
