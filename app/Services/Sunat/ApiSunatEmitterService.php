<?php

namespace App\Services\Sunat;

use App\Models\CompanyLegalProfile;
use App\Models\Invoice;
use App\Models\SunatEmitterSetting;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Emite comprobantes electrónicos a través del PSE API SUNAT (Lucode).
 * No requiere certificado digital propio — Lucode firma y envía por ti.
 *
 * Docs: https://docs.apisunat.pe/integracion/facturacion-electronica
 */
class ApiSunatEmitterService
{
    private const PROD_URL    = 'https://api.apisunat.pe/api/v3/documents';
    private const SANDBOX_URL = 'https://sandbox.apisunat.pe/api/v3/documents';

    // Catálogo 10 SUNAT → nombre del tributo para API SUNAT
    private const TRIBUTO = [
        '10' => ['nombre' => 'IGV',  'porcentaje' => '18'],
        '17' => ['nombre' => 'IVAP', 'porcentaje' => '4'],
        '20' => ['nombre' => 'EXO',  'porcentaje' => '0'],
        '21' => ['nombre' => 'EXO',  'porcentaje' => '0'],
        '30' => ['nombre' => 'INA',  'porcentaje' => '0'],
        '31' => ['nombre' => 'INA',  'porcentaje' => '0'],
        '40' => ['nombre' => 'EXP',  'porcentaje' => '0'],
    ];

    // Código de documento → nombre para la API
    private const DOC_NOMBRES = [
        '01' => 'factura',
        '03' => 'boleta',
        '07' => 'nota_credito',
        '08' => 'nota_debito',
    ];

    public function emit(Invoice $invoice): bool
    {
        // ── 1. Cargar configuración ───────────────────────────────────────
        $profile = CompanyLegalProfile::query()
            ->with('sunatEmitterSetting')
            ->where('is_default_issuer', true)
            ->first();

        if (!$profile) {
            return $this->fail($invoice, 'No hay emisor configurado como predeterminado.');
        }

        /** @var SunatEmitterSetting|null $settings */
        $settings = $profile->sunatEmitterSetting;

        if (!$settings || !$settings->is_active) {
            return $this->fail($invoice, 'La integración SUNAT no está activa.');
        }

        // ── 2. Descifrar token de API SUNAT ───────────────────────────────
        $rawTokenEnc = $settings->attributes['apisunat_token_enc'] ?? null;
        if (empty($rawTokenEnc)) {
            return $this->fail($invoice, 'No hay token de API SUNAT configurado. Agrégalo en Config. emisor.');
        }

        try {
            $token = Crypt::decryptString($rawTokenEnc);
        } catch (Throwable) {
            return $this->fail($invoice, 'No se puede descifrar el token de API SUNAT. ¿Cambió el APP_KEY?');
        }

        // ── 3. Construir payload JSON ─────────────────────────────────────
        $invoice->loadMissing('lines');
        $buyer   = $invoice->buyer_snapshot ?? [];
        $docName = self::DOC_NOMBRES[$invoice->sunat_document_type_code] ?? 'factura';

        $items = $invoice->lines->map(function ($line) {
            $igvCode  = $line->igv_affectation_code ?? '10';
            $tributo  = self::TRIBUTO[$igvCode] ?? self::TRIBUTO['10'];

            return [
                'unidad_de_medida'            => $line->unit_measure_code ?? 'ZZ',
                'descripcion'                 => $line->description,
                'cantidad'                    => number_format((float) $line->quantity, 6, '.', ''),
                'valor_unitario'              => number_format((float) $line->unit_price, 6, '.', ''),
                'porcentaje_igv'              => $tributo['porcentaje'],
                'codigo_tipo_afectacion_igv'  => $igvCode,
                'nombre_tributo'              => $tributo['nombre'],
            ];
        })->values()->toArray();

        $payload = [
            'documento'                    => $docName,
            'serie'                        => $invoice->sunat_serie,
            'numero'                       => (int) $invoice->sunat_correlative,
            'fecha_de_emision'             => $invoice->issued_at->format('Y-m-d'),
            'hora_de_emision'              => $invoice->issued_at->format('H:i:s'),
            'moneda'                       => $invoice->currency ?? 'PEN',
            'tipo_operacion'               => '0101',
            'cliente_tipo_de_documento'    => $buyer['tipo_doc'] ?? '6',
            'cliente_numero_de_documento'  => $buyer['num_doc'] ?? '',
            'cliente_denominacion'         => $buyer['razon_social'] ?? '',
            'cliente_direccion'            => $buyer['direccion'] ?? '-',
            'items'                        => $items,
            'total'                        => number_format((float) $invoice->grand_total, 2, '.', ''),
        ];

        // ── 4. Llamar a la API ────────────────────────────────────────────
        $env = $settings->environment ?? 'beta';
        $url = $env === 'production' ? self::PROD_URL : self::SANDBOX_URL;

        try {
            $response = Http::withToken($token)
                ->timeout(30)
                ->post($url, $payload);

            $json = $response->json();
        } catch (Throwable $e) {
            Log::error('apisunat.http.error', ['invoice' => $invoice->id, 'err' => $e->getMessage()]);
            return $this->fail($invoice, 'Error de conexión con API SUNAT: ' . $e->getMessage());
        }

        // ── 5. Procesar respuesta ─────────────────────────────────────────
        $success = $json['success'] ?? false;

        if (!$success) {
            $msg = $json['message'] ?? 'Error desconocido de API SUNAT';
            Log::warning('apisunat.rejected', ['invoice' => $invoice->id, 'resp' => $json]);
            return $this->fail($invoice, $msg);
        }

        // Respuesta exitosa
        $invoice->update([
            'sunat_filing_status'          => Invoice::FILING_ACCEPTED,
            'status'                       => Invoice::STATUS_ISSUED,
            'sunat_response_code'          => '0',
            'sunat_response_description'   => $json['message'] ?? 'Aceptado por SUNAT vía API SUNAT',
        ]);

        // Guardar log
        $attempt = $invoice->submissionLogs()->count() + 1;
        $invoice->submissionLogs()->create([
            'attempt_number'      => $attempt,
            'environment'         => $env,
            'service_url'         => $url,
            'was_successful'      => true,
            'sunat_response_code' => '0',
            'sunat_response_desc' => $json['message'] ?? 'OK',
        ]);

        return true;
    }

    private function fail(Invoice $invoice, string $message): bool
    {
        $invoice->update([
            'sunat_filing_status'        => Invoice::FILING_ERROR,
            'sunat_response_description' => $message,
        ]);

        Log::error('apisunat.fail', ['invoice' => $invoice->id, 'msg' => $message]);

        return false;
    }
}
