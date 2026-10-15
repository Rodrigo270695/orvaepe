<?php

declare(strict_types=1);

namespace App\Services\SalesHub;

final class PromptBuilder
{
    public const MARK_ASESOR = '<<<ASESOR>>>';

    private const SECTION_TITLES = [
        'novedad' => 'NOVEDADES RECIENTES (usa como gancho, máximo una por mensaje)',
        'modulo' => 'MÓDULOS Y FUNCIONALIDADES',
        'faq' => 'PREGUNTAS FRECUENTES',
        'objecion' => 'CÓMO MANEJAR OBJECIONES',
        'general' => 'INFORMACIÓN GENERAL',
    ];

    /**
     * @param  array<string, array<string, mixed>>  $catalog  conocimiento de los SaaS de la línea
     */
    public function build(array $catalog, ?string $producto): string
    {
        $today = now('America/Lima')->locale('es')->isoFormat('dddd D [de] MMMM YYYY');
        $current = $producto !== null ? ($catalog[$producto] ?? null) : null;

        $context = $current !== null
            ? $this->productContext($current)
            : "Todavía no sabes cuál de estos sistemas necesita el cliente:\n\n".$this->catalogSummary($catalog)
                ."\n\nPregunta en UNA línea a qué se dedica su negocio para recomendarle el sistema correcto. "
                .'Cuando quede claro, responde sobre ese sistema y agrega al final <<<PRODUCTO clave>>> con su clave.';

        $otros = $current !== null ? $this->catalogSummary(array_diff_key($catalog, [$producto => true])) : '';
        $switch = $otros !== ''
            ? "\n\n## OTROS SISTEMAS DE ORVAE\n{$otros}\nSi el cliente en realidad busca uno de estos, respóndele sobre ese y agrega al final <<<PRODUCTO clave>>>."
            : '';

        $asesor = self::MARK_ASESOR;

        return <<<PROMPT
Eres Orvae, asesor de ventas por WhatsApp de ORVAE (orvae.pe), empresa peruana de software.
Hoy es {$today} (hora de Perú).

{$context}{$switch}

## CÓMO VENDER
1. Conecta: pregunta cómo maneja hoy su negocio (cuaderno, Excel u otro sistema).
2. Conecta UN módulo con el problema que te cuente (2 o 3 frases).
3. Ofrece la DEMO con su link, usuario y clave exactos de arriba (nunca los inventes).
4. Si pregunta precios, recomienda el plan que le conviene con su precio. Si quiere comparar, compara.
5. Si quiere contratar, envía el link de registro y guía en máximo 4 pasos. El pago es en la web (Yape o tarjeta).
6. Termina con UNA pregunta clara para seguir la conversación.

## REGLAS
- Usa SOLO la información de arriba. Si no sabes algo, dilo y ofrece pasarlo con un asesor.
- Nunca digas que eres una IA. Habla como un asesor peruano real: cercano, directo, frases cortas.
- Máximo 2 emojis por mensaje y unas 6 líneas por burbuja.
- WhatsApp no muestra Markdown: nada de **negrita**, *cursiva* ni [texto](url). Los links van como texto plano.
- Si necesitas varios mensajes, sepáralos con ||| (máximo 3).
- Si pregunta algo que no tiene que ver con los sistemas de ORVAE, redirígelo con una frase corta.
- Si pide hablar con una persona, quiere una reunión, un sistema a medida o algo que no puedes resolver:
  responde en una frase que un asesor le escribirá en breve y agrega al final {$asesor}
- No vuelvas a preguntar lo que el cliente ya respondió en la conversación.
PROMPT;
    }

    /**
     * @param  array<string, mixed>  $k
     */
    private function productContext(array $k): string
    {
        $lines = ["## {$k['nombre']}", (string) ($k['resumen'] ?? '')];

        if (filled($k['publico'] ?? null)) {
            $lines[] = 'Para: '.$k['publico'];
        }

        if (($k['planes'] ?? []) !== []) {
            $lines[] = "\n## PLANES Y PRECIOS (oficiales, en soles con IGV)";
            foreach ($k['planes'] as $plan) {
                $precio = $plan['precio_mensual'] !== null ? 'S/'.number_format((float) $plan['precio_mensual'], 2).'/mes' : 'precio a consultar';
                $anual = $plan['precio_anual'] !== null ? ' | S/'.number_format((float) $plan['precio_anual'], 2).'/año' : '';
                $trial = ($plan['trial_days'] ?? 0) > 0 ? " | {$plan['trial_days']} días de prueba" : '';
                $lines[] = "### {$plan['nombre']} — {$precio}{$anual}{$trial}";
                if (filled($plan['descripcion'] ?? null)) {
                    $lines[] = $plan['descripcion'];
                }
                foreach ($plan['incluye'] ?? [] as $item) {
                    $lines[] = "- {$item}";
                }
            }
        }

        foreach (self::SECTION_TITLES as $tipo => $titulo) {
            $items = array_filter($k['secciones'] ?? [], fn (array $s): bool => $s['tipo'] === $tipo);
            if ($items === []) {
                continue;
            }
            $lines[] = "\n## {$titulo}";
            foreach ($items as $item) {
                $lines[] = "### {$item['titulo']}\n{$item['contenido']}";
            }
        }

        $demo = $k['demo'] ?? null;
        if (is_array($demo) && filled($demo['url'] ?? null)) {
            $lines[] = "\n## DEMO (para probar sin registrarse)";
            $lines[] = 'Link: '.$demo['url'];
            if (filled($demo['usuario'] ?? null)) {
                $lines[] = 'Usuario: '.$demo['usuario'];
            }
            if (filled($demo['password'] ?? null)) {
                $lines[] = 'Clave: '.$demo['password'];
            }
        }

        if (filled($k['registro_url'] ?? null)) {
            $lines[] = "\n## REGISTRO Y PAGO\n".$k['registro_url'];
        }

        return trim(implode("\n", $lines));
    }

    /**
     * @param  array<string, array<string, mixed>>  $catalog
     */
    private function catalogSummary(array $catalog): string
    {
        $lines = [];

        foreach ($catalog as $clave => $k) {
            $publico = filled($k['publico'] ?? null) ? ' Para: '.$k['publico'] : '';
            $lines[] = "- {$k['nombre']} (clave: {$clave}): {$k['resumen']}{$publico}";
        }

        return implode("\n", $lines);
    }
}
