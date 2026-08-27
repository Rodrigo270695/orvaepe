<?php

namespace App\Support\Sunat;

/**
 * Defaults de detracción SPOT guardados en sunat_emitter_settings.options.detraccion.
 *
 * Lucode (API SUNAT): tipo_operacion=1001 + bloque detraccion.
 * Docs: https://docs.apisunat.pe/facturacion/factura-electronica/factura-con-detraccion
 */
final class DetraccionDefaults
{
    public const TIPO_OPERACION = '1001';

    /** Catálogo 54 — Otros servicios empresariales (común en SaaS / servicios B2B). */
    public const DEFAULT_TIPO = '022';

    public const DEFAULT_PORCENTAJE = '12';

    /** Catálogo 59 — Depósito en cuenta (Banco de la Nación). */
    public const DEFAULT_MEDIO_PAGO = '001';

    /**
     * Umbral Anexo 3 (servicios / construcción): no aplica si importe ≤ S/ 700.
     * Fuente: R.S. 183-2004/SUNAT — el sistema no se aplica si el importe es igual o menor a S/ 700.
     */
    public const DEFAULT_UMBRAL = 700.0;

    /**
     * @param  array<string, mixed>|null  $options
     * @return array{
     *     cuenta_bn: string,
     *     tipo: string,
     *     porcentaje: string,
     *     medio_pago: string,
     *     umbral_soles: float,
     *     auto_aplicar: bool
     * }
     */
    public static function fromOptions(?array $options): array
    {
        $d = is_array($options['detraccion'] ?? null) ? $options['detraccion'] : [];

        // Compat: sugerir_en_factura → auto_aplicar
        $auto = $d['auto_aplicar'] ?? $d['sugerir_en_factura'] ?? true;

        return [
            'cuenta_bn'     => trim((string) ($d['cuenta_bn'] ?? '')),
            'tipo'          => self::normalizeCode((string) ($d['tipo'] ?? self::DEFAULT_TIPO), 3, self::DEFAULT_TIPO),
            'porcentaje'    => self::normalizePercent((string) ($d['porcentaje'] ?? self::DEFAULT_PORCENTAJE)),
            'medio_pago'    => self::normalizeCode((string) ($d['medio_pago'] ?? self::DEFAULT_MEDIO_PAGO), 3, self::DEFAULT_MEDIO_PAGO),
            'umbral_soles'  => max(0.0, (float) ($d['umbral_soles'] ?? self::DEFAULT_UMBRAL)),
            'auto_aplicar'  => (bool) $auto,
        ];
    }

    /**
     * Factura en PEN cuyo total supera el umbral SPOT Anexo 3 (estricto: > 700).
     */
    public static function requierePorMonto(
        string $documentTypeCode,
        string $currency,
        float $grandTotal,
        ?float $umbralSoles = null,
    ): bool {
        if ($documentTypeCode !== '01') {
            return false;
        }

        if (strtoupper($currency) !== 'PEN') {
            return false;
        }

        $umbral = $umbralSoles ?? self::DEFAULT_UMBRAL;

        return $grandTotal > $umbral;
    }

    /**
     * Monto de detracción redondeado al entero (práctica SPOT / Lucode).
     */
    public static function calcularMonto(float $grandTotal, float|string $porcentaje): float
    {
        $pct = (float) $porcentaje;
        if ($grandTotal <= 0 || $pct <= 0) {
            return 0.0;
        }

        return (float) round($grandTotal * ($pct / 100), 0);
    }

    private static function normalizeCode(string $value, int $len, string $fallback): string
    {
        $digits = preg_replace('/\D+/', '', $value) ?? '';
        if ($digits === '') {
            return $fallback;
        }

        return str_pad(substr($digits, 0, $len), $len, '0', STR_PAD_LEFT);
    }

    private static function normalizePercent(string $value): string
    {
        $n = (float) str_replace(',', '.', $value);
        if ($n <= 0 || $n > 100) {
            return self::DEFAULT_PORCENTAJE;
        }

        return rtrim(rtrim(number_format($n, 2, '.', ''), '0'), '.') ?: self::DEFAULT_PORCENTAJE;
    }
}
