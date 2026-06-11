<?php

namespace App\Services\Sunat;

use App\Models\CompanyLegalProfile;
use App\Models\DigitalCertificate;
use App\Models\Invoice;
use App\Models\InvoiceLine;
use App\Models\SunatEmitterSetting;
use App\Models\SunatSubmissionLog;
use DateTime;
use Greenter\Model\Client\Client;
use Greenter\Model\Company\Address;
use Greenter\Model\Company\Company;
use Greenter\Model\Response\BillResult;
use Greenter\Model\Sale\FormaPagos\FormaPagoContado;
use Greenter\Model\Sale\Invoice as GreenterInvoice;
use Greenter\Model\Sale\Legend;
use Greenter\Model\Sale\SaleDetail;
use Greenter\See;
use Greenter\XMLSecLibs\Certificate\X509Certificate;
use Greenter\XMLSecLibs\Certificate\X509ContentType;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class InvoiceEmitterService
{
    // ── URLs de los servicios SUNAT ──────────────────────────────────────
    private const URLS = [
        'beta' => [
            '01' => 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl',
            '03' => 'https://e-beta.sunat.gob.pe/ol-ti-itcpgem-beta/billService?wsdl',
            '07' => 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl',
            '08' => 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl',
        ],
        'production' => [
            '01' => 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl',
            '03' => 'https://e-factura.sunat.gob.pe/ol-ti-itcpgem/billService?wsdl',
            '07' => 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl',
            '08' => 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService?wsdl',
        ],
    ];

    /**
     * Emite el comprobante a SUNAT y actualiza el modelo Invoice.
     * Devuelve true si SUNAT aceptó el documento.
     */
    public function emit(Invoice $invoice): bool
    {
        // ── 1. Cargar emisor y configuración ─────────────────────────────
        $profile = CompanyLegalProfile::query()
            ->with(['sunatEmitterSetting', 'digitalCertificates'])
            ->where('is_default_issuer', true)
            ->first();

        if (!$profile) {
            return $this->fail($invoice, 'No hay emisor configurado como predeterminado.');
        }

        /** @var SunatEmitterSetting|null $settings */
        $settings = $profile->sunatEmitterSetting;

        if (!$settings || !$settings->is_active) {
            return $this->fail($invoice, 'La integración SUNAT no está activa. Configura en Emisión → Config. emisor.');
        }

        // ── 2. Certificado digital ────────────────────────────────────────
        $cert = $profile->digitalCertificates
                ->where('id', $settings->default_certificate_id)
                ->where('is_active', true)
                ->first()
            ?? $profile->digitalCertificates->where('is_active', true)->first();

        if (!$cert) {
            return $this->fail($invoice, 'No hay certificado digital activo. Sube el .p12 en Config. emisor.');
        }

        // ── 3. Leer .p12 y convertir a PEM ───────────────────────────────
        try {
            $pfxContent   = Storage::disk($cert->storage_disk)->get($cert->storage_path);
            $rawPwdEnc    = $cert->attributes['password_enc'] ?? null;
            $certPassword = '';
            if (!empty($rawPwdEnc)) {
                $certPassword = Crypt::decryptString($rawPwdEnc);
            }
            $x509 = new X509Certificate($pfxContent, $certPassword);
            $pem  = $x509->export(X509ContentType::PEM);
        } catch (Throwable $e) {
            $raw = $e->getMessage();
            $msg = (str_contains($raw, 'mac verify') || str_contains($raw, 'PKCS12'))
                ? 'Contraseña del certificado incorrecta. Ve a Config. emisor → Certificados y actualiza la contraseña de tu .p12.'
                : 'Error al cargar el certificado: ' . $raw;
            return $this->fail($invoice, $msg);
        }

        // ── 4. Credenciales SOL ──────────────────────────────────────────
        $solUser = $settings->sol_username ?? '';
        $solPass = '';
        $rawSolEnc = $settings->getRawOriginal('sol_password_enc') ?? $settings->attributes['sol_password_enc'] ?? null;
        if (!empty($rawSolEnc)) {
            try {
                $solPass = Crypt::decryptString($rawSolEnc);
            } catch (Throwable) {
                return $this->fail($invoice, 'No se puede descifrar la clave SOL. ¿Cambió el APP_KEY?');
            }
        }

        // ── 5. Configurar Greenter See ────────────────────────────────────
        $env        = $settings->environment ?? 'beta';
        $serviceUrl = self::URLS[$env][$invoice->sunat_document_type_code]
                   ?? self::URLS[$env]['01'];

        $see = new See();
        $see->setCertificate($pem);
        $see->setClaveSOL($profile->ruc, $solUser, $solPass);
        $see->setService($serviceUrl);

        // ── 6. Construir documento Greenter ──────────────────────────────
        $invoice->loadMissing('lines');
        $document = $this->buildGreenterInvoice($invoice, $profile);

        // ── 7. Generar y guardar XML firmado ─────────────────────────────
        $xmlPath = null;
        try {
            $xmlSigned = $see->getXmlSigned($document);
            if ($xmlSigned) {
                $xmlPath = 'invoices/xml/' . $invoice->invoice_number . '.xml';
                Storage::disk('local')->put($xmlPath, $xmlSigned);
            }
        } catch (Throwable $e) {
            Log::warning('sunat.xml_sign.error', ['invoice' => $invoice->id, 'err' => $e->getMessage()]);
        }

        // ── 8. Enviar a SUNAT ─────────────────────────────────────────────
        $attempt = $invoice->submissionLogs()->count() + 1;

        try {
            $result = $see->send($document);
        } catch (Throwable $e) {
            Log::error('sunat.send.exception', ['invoice' => $invoice->id, 'err' => $e->getMessage()]);
            $this->fail($invoice, 'Error de conexión SOAP: ' . $e->getMessage());
            $this->writeLog($invoice, $attempt, false, null, null, $xmlPath, $e->getMessage());
            return false;
        }

        // ── 9. Procesar respuesta CDR ─────────────────────────────────────
        $success = $result?->isSuccess() ?? false;
        /** @var BillResult|null $billResult */
        $billResult = $result instanceof BillResult ? $result : null;
        $cdr        = $billResult?->getCdrResponse();
        $code    = $cdr?->getCode() ?? '999';
        $message = $cdr?->getDescription() ?? $result?->getError()?->getMessage() ?? 'Sin respuesta de SUNAT';

        $cdrPath = null;
        if ($success && $billResult?->getCdrZip()) {
            $cdrPath = 'invoices/cdr/' . $invoice->invoice_number . '.zip';
            Storage::disk('local')->put($cdrPath, $billResult->getCdrZip());
        }

        $filingStatus = match (true) {
            $success && $code === '0'                => Invoice::FILING_ACCEPTED,
            $success && (int) $code >= 4000          => Invoice::FILING_ACCEPTED_WITH_OBS,
            default                                  => Invoice::FILING_REJECTED,
        };
        if (!$success) {
            $filingStatus = Invoice::FILING_ERROR;
        }

        $invoice->update([
            'sunat_filing_status'        => $filingStatus,
            'sunat_response_code'        => $code,
            'sunat_response_description' => $message,
            'xml_signed_path'            => $xmlPath,
            'cdr_path'                   => $cdrPath,
            'status'                     => $this->isAccepted($filingStatus)
                ? Invoice::STATUS_ISSUED
                : $invoice->status,
        ]);

        $this->writeLog($invoice, $attempt, $this->isAccepted($filingStatus), $code, $cdrPath, $xmlPath, $message);

        return $this->isAccepted($filingStatus);
    }

    // ── Constructores de documento Greenter ──────────────────────────────

    private function buildGreenterInvoice(Invoice $invoice, CompanyLegalProfile $profile): GreenterInvoice
    {
        $address = (new Address())
            ->setUbigueo($profile->ubigeo ?? '000000')
            ->setDepartamento($profile->department ?? '')
            ->setProvincia($profile->province ?? '')
            ->setDistrito($profile->district ?? '')
            ->setUrbanizacion('-')
            ->setDireccion($profile->address_line ?? '')
            ->setCodLocal('0000');

        $company = (new Company())
            ->setRuc($profile->ruc)
            ->setRazonSocial($profile->legal_name)
            ->setNombreComercial($profile->trade_name ?? $profile->legal_name)
            ->setAddress($address);

        $buyer  = $invoice->buyer_snapshot ?? [];
        $client = (new Client())
            ->setTipoDoc($buyer['tipo_doc'] ?? '-')
            ->setNumDoc($buyer['num_doc'] ?? '')
            ->setRznSocial($buyer['razon_social'] ?? 'CLIENTE GENÉRICO');

        // Construir líneas y acumular totales
        $details    = [];
        $totalGrav  = 0.0;
        $totalIgv   = 0.0;
        $totalVenta = 0.0;

        foreach ($invoice->lines as $line) {
            $taxRate   = (float) ($line->tax_rate ?? 0.18);
            $qty       = (float) $line->quantity;
            $baseUnit  = (float) $line->unit_price;
            $lineBase  = round($baseUnit * $qty, 10);
            $affCode   = $line->igv_affectation_code ?? '10';
            $lineIgv   = $affCode === '10' ? round($lineBase * $taxRate, 10) : 0.0;

            $unitCode = $line->unit_measure_code ?? 'ZZ';

            $detail = (new SaleDetail())
                ->setCodProducto($line->sunat_product_code ?? 'ZZ')
                ->setUnidad($unitCode)
                ->setDescripcion($line->description)
                ->setCantidad($qty)
                ->setMtoValorUnitario($baseUnit)
                ->setMtoBaseIgv(round($lineBase, 2))
                ->setPorcentajeIgv(round($taxRate * 100, 2))
                ->setIgv(round($lineIgv, 2))
                ->setTipAfeIgv($affCode)
                ->setMtoPrecioUnitario(round($baseUnit * (1 + $taxRate), 6))
                ->setMtoValorVenta(round($lineBase, 2));

            $details[] = $detail;

            if ($affCode === '10') {
                $totalGrav  += $lineBase;
                $totalIgv   += $lineIgv;
            }
            $totalVenta += $lineBase;
        }

        $totalGrav  = round($totalGrav, 2);
        $totalIgv   = round($totalIgv, 2);
        $totalVenta = round($totalVenta, 2);
        $grandTotal = round($totalVenta + $totalIgv, 2);

        $legend = (new Legend())
            ->setCode('1000')
            ->setValue($this->montoEnLetras($grandTotal, $invoice->currency ?? 'PEN'));

        return (new GreenterInvoice())
            ->setUblVersion('2.1')
            ->setTipoOperacion('0101')
            ->setTipoDoc($invoice->sunat_document_type_code)
            ->setSerie($invoice->sunat_serie)
            ->setCorrelativo($invoice->sunat_correlative)
            ->setFechaEmision(new DateTime($invoice->issued_at?->toDateString() ?? now()->toDateString()))
            ->setFormaPago(new FormaPagoContado())
            ->setTipoMoneda($invoice->currency ?? 'PEN')
            ->setCompany($company)
            ->setClient($client)
            ->setMtoOperGravadas($totalGrav)
            ->setMtoIGV($totalIgv)
            ->setTotalImpuestos($totalIgv)
            ->setValorVenta($totalVenta)
            ->setSubTotal($grandTotal)
            ->setMtoImpVenta($grandTotal)
            ->setDetails($details)
            ->setLegends([$legend]);
    }

    // ── Conversión básica de monto a letras en español ───────────────────

    private function montoEnLetras(float $monto, string $moneda): string
    {
        $entero = (int) floor($monto);
        $decimales = (int) round(($monto - $entero) * 100);
        $sufijo = $moneda === 'USD' ? 'DÓLARES AMERICANOS' : 'SOLES';

        return 'SON ' . $this->enteroALetras($entero) . ' Y ' . str_pad((string) $decimales, 2, '0', STR_PAD_LEFT) . '/100 ' . $sufijo;
    }

    private function enteroALetras(int $n): string
    {
        if ($n === 0) return 'CERO';

        $unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
            'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE',
            'DIECIOCHO', 'DIECINUEVE', 'VEINTE'];
        $decenas  = ['', '', 'VEINTI', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
        $centenas = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
            'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

        $result = '';

        if ($n >= 1000000) {
            $millones = (int) ($n / 1000000);
            $result .= ($millones === 1 ? 'UN MILLÓN ' : $this->enteroALetras($millones) . ' MILLONES ');
            $n %= 1000000;
        }

        if ($n >= 1000) {
            $miles = (int) ($n / 1000);
            $result .= ($miles === 1 ? 'MIL ' : $this->enteroALetras($miles) . ' MIL ');
            $n %= 1000;
        }

        if ($n >= 100) {
            $c = (int) ($n / 100);
            $resto = $n % 100;
            $result .= ($c === 1 && $resto > 0 ? 'CIENTO ' : $centenas[$c] . ' ');
            $n = $resto;
        }

        if ($n > 20) {
            $d = (int) ($n / 10);
            $u = $n % 10;
            $result .= $decenas[$d] . ($u > 0 ? ($d === 2 ? $unidades[$u] : ' Y ' . $unidades[$u]) : '') . ' ';
        } elseif ($n > 0) {
            $result .= $unidades[$n] . ' ';
        }

        return trim($result);
    }

    // ── Utilidades ───────────────────────────────────────────────────────

    private function isAccepted(string $status): bool
    {
        return in_array($status, [Invoice::FILING_ACCEPTED, Invoice::FILING_ACCEPTED_WITH_OBS]);
    }

    private function fail(Invoice $invoice, string $message): bool
    {
        $invoice->update([
            'sunat_filing_status'        => Invoice::FILING_ERROR,
            'sunat_response_description' => $message,
        ]);
        Log::error('sunat.emission.error', ['invoice_id' => $invoice->id, 'message' => $message]);
        return false;
    }

    private function writeLog(
        Invoice $invoice,
        int $attempt,
        bool $success,
        ?string $code,
        ?string $cdrPath,
        ?string $xmlPath,
        ?string $message,
    ): void {
        SunatSubmissionLog::create([
            'invoice_id'              => $invoice->id,
            'attempt'                 => $attempt,
            'channel'                 => 'soap_direct',
            'response_code'           => $code,
            'response_message'        => $message,
            'cdr_storage_path'        => $cdrPath,
            'xml_signed_storage_path' => $xmlPath,
            'success'                 => $success,
            'created_at'              => now(),
        ]);
    }
}
