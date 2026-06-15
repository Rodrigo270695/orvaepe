<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanyLegalProfile;
use App\Models\Invoice;
use App\Models\InvoiceLine;
use App\Models\InvoiceDocumentSequence;
use App\Models\Order;
use App\Models\SunatEmitterSetting;
use App\Services\Sunat\ApiSunatEmitterService;
use App\Services\Sunat\InvoiceEmitterService;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VentasFacturasController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Invoice::query()
            ->with(['order', 'user'])
            ->orderByDesc('issued_at')
            ->orderByDesc('created_at');

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('invoice_number', 'ilike', "%{$q}%")
                    ->orWhere('sunat_serie', 'ilike', "%{$q}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('sunat_document_type_code', $request->input('type'));
        }

        if ($request->filled('filing')) {
            $query->where('sunat_filing_status', $request->input('filing'));
        }

        $invoices = $query->paginate(30)->withQueryString();

        return Inertia::render('admin/comprobantes/index', [
            'invoices' => $invoices,
            'filters'  => $request->only(['q', 'type', 'filing']),
        ]);
    }

    public function create(Request $request): Response
    {
        $profile = CompanyLegalProfile::query()->where('is_default_issuer', true)->first();

        $sequences = InvoiceDocumentSequence::query()
            ->where('is_active', true)
            ->when($profile, fn ($q) => $q->where('company_legal_profile_id', $profile->id))
            ->whereIn('document_type_code', ['01', '03', '07', '08'])
            ->orderBy('document_type_code')
            ->orderBy('serie')
            ->get(['id', 'document_type_code', 'serie', 'establishment_code', 'next_correlative']);

        // Órdenes pagadas sin factura emitida (para pre-rellenar, no obligatorio)
        $orders = Order::query()
            ->where('status', Order::STATUS_PAID)
            ->whereNotIn('id', Invoice::query()->whereNotNull('order_id')->select('order_id'))
            ->with([
                'user',
                'lines' => fn ($q) => $q
                    ->select([
                        'id', 'order_id', 'catalog_sku_id',
                        'product_name_snapshot', 'sku_name_snapshot',
                        'quantity', 'unit_price',
                        'tax_amount', 'line_total',
                    ])
                    ->with(['sku:id,igv_applies,tax_included']),
            ])
            ->orderByDesc('placed_at')
            ->limit(100)
            ->get(['id', 'order_number', 'grand_total', 'currency', 'placed_at', 'user_id', 'billing_snapshot']);

        return Inertia::render('admin/comprobantes/create', [
            'sequences'    => $sequences,
            'orders'       => $orders,
            'preOrderId'   => $request->input('order_id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'sequence_id'            => ['required', 'uuid', 'exists:invoice_document_sequences,id'],
            'order_id'               => ['nullable', 'uuid', 'exists:orders,id'],
            'issued_at'              => ['required', 'date'],
            'currency'               => ['required', 'in:PEN,USD'],
            'payment_type'           => ['required', 'in:Contado,Credito'],
            'buyer.tipo_doc'         => ['required', 'in:6,1,-'],
            'buyer.num_doc'          => ['nullable', 'string', 'max:15'],
            'buyer.razon_social'     => ['required', 'string', 'max:255'],
            'buyer.direccion'        => ['nullable', 'string', 'max:500'],
            'lines'                  => ['required', 'array', 'min:1'],
            'lines.*.description'    => ['required', 'string', 'max:500'],
            'lines.*.quantity'       => ['required', 'numeric', 'min:0.0001'],
            'lines.*.unit_price'     => ['required', 'numeric', 'min:0'],
            'lines.*.tax_rate'       => ['required', 'numeric', 'min:0', 'max:1'],
            'lines.*.igv_code'       => ['required', 'string', 'max:10'],
            'lines.*.product_code'   => ['nullable', 'string', 'max:50'],
            'lines.*.unit_measure'   => ['required', 'string', 'max:10'],
        ]);

        $profile = CompanyLegalProfile::query()->where('is_default_issuer', true)->first();
        if (!$profile) {
            return back()->with('toast', AdminFlashToast::error('Configura el perfil legal del emisor.'));
        }

        /** @var InvoiceDocumentSequence $seq */
        $seq = InvoiceDocumentSequence::find($data['sequence_id']);

        // Calcular totales
        $subtotal = 0.0;
        $taxTotal = 0.0;
        foreach ($data['lines'] as $line) {
            $base  = round((float) $line['quantity'] * (float) $line['unit_price'], 2);
            $igv   = $line['igv_code'] === '10' ? round($base * (float) $line['tax_rate'], 2) : 0.0;
            $subtotal += $base;
            $taxTotal += $igv;
        }
        $grandTotal = round($subtotal + $taxTotal, 2);

        $invoice = DB::transaction(function () use ($data, $profile, $seq, $subtotal, $taxTotal, $grandTotal) {
            // Tomar y reservar el correlativo de forma atómica
            $correlative = $seq->next_correlative;
            $seq->increment('next_correlative');

            $invoiceNumber = $seq->serie . '-' . str_pad((string) $correlative, 8, '0', STR_PAD_LEFT);

            $invoice = Invoice::create([
                'company_legal_profile_id'      => $profile->id,
                'invoice_document_sequence_id'  => $seq->id,
                'invoice_number'                => $invoiceNumber,
                'sunat_document_type_code'      => $seq->document_type_code,
                'sunat_serie'                   => $seq->serie,
                'sunat_correlative'             => (string) $correlative,
                'sunat_filing_status'           => Invoice::FILING_DRAFT,
                'order_id'                      => $data['order_id'] ?? null,
                'user_id'                       => Auth::id(),
                'status'                        => Invoice::STATUS_DRAFT,
                'subtotal'                      => $subtotal,
                'tax_total'                     => $taxTotal,
                'grand_total'                   => $grandTotal,
                'currency'                      => $data['currency'],
                'issued_at'                     => $data['issued_at'],
                'buyer_snapshot'                => $data['buyer'],
            ]);

            foreach ($data['lines'] as $line) {
                $base = round((float) $line['quantity'] * (float) $line['unit_price'], 2);
                $igv  = $line['igv_code'] === '10' ? round($base * (float) $line['tax_rate'], 2) : 0.0;

                InvoiceLine::create([
                    'invoice_id'            => $invoice->id,
                    'description'           => $line['description'],
                    'quantity'              => $line['quantity'],
                    'unit_measure_code'     => $line['unit_measure'] ?? 'ZZ',
                    'unit_price'            => $line['unit_price'],
                    'tax_rate'              => $line['tax_rate'],
                    'line_total'            => round($base + $igv, 2),
                    'sunat_product_code'    => $line['product_code'] ?? null,
                    'igv_affectation_code'  => $line['igv_code'],
                ]);
            }

            return $invoice;
        });

        // Emitir a SUNAT — elegir servicio según modo configurado
        $accepted = $this->emitInvoice($invoice);

        if ($accepted) {
            return redirect('/panel/ventas-facturas/' . $invoice->id)
                ->with('toast', AdminFlashToast::success('Comprobante aceptado por SUNAT ✓'));
        }

        $invoice->refresh();
        return redirect('/panel/ventas-facturas/' . $invoice->id)
            ->with('toast', AdminFlashToast::error(
                'SUNAT respondió: ' . ($invoice->sunat_response_description ?? 'Error'),
                'El comprobante fue creado pero no fue aceptado. Puedes reintentarlo.',
            ));
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['lines', 'order', 'user', 'submissionLogs' => fn ($q) => $q->orderByDesc('created_at')]);

        $ruc = \App\Models\CompanyLegalProfile::where('is_default_issuer', true)->value('ruc');

        return Inertia::render('admin/comprobantes/show', [
            'invoice'     => $invoice,
            'company_ruc' => $ruc,
        ]);
    }

    public function retry(Invoice $invoice): RedirectResponse
    {
        if ($invoice->isAccepted()) {
            return back()->with('toast', AdminFlashToast::success('Este comprobante ya fue aceptado por SUNAT.'));
        }

        $accepted = $this->emitInvoice($invoice);
        $invoice->refresh();

        return back()->with('toast', $accepted
            ? AdminFlashToast::success('Re-envío aceptado por SUNAT ✓')
            : AdminFlashToast::error('SUNAT rechazó el reintento: ' . ($invoice->sunat_response_description ?? 'Error')),
        );
    }

    /**
     * Consulta APISUNAT para obtener las URLs reales del PDF y actualiza el registro.
     * Usado cuando pdf_path quedó vacío (emisiones anteriores al guardado del PDF).
     */
    public function refreshPdf(Invoice $invoice): RedirectResponse
    {
        if (!$invoice->isAccepted()) {
            return back()->with('toast', AdminFlashToast::error('Solo se puede refrescar el PDF de comprobantes aceptados.'));
        }

        $profile  = CompanyLegalProfile::where('is_default_issuer', true)->with('sunatEmitterSetting')->first();
        $settings = $profile?->sunatEmitterSetting;

        if (!$settings) {
            return back()->with('toast', AdminFlashToast::error('No hay configuración de emisor.'));
        }

        $rawTokenEnc = $settings->getAttributes()['apisunat_token_enc'] ?? null;
        if (empty($rawTokenEnc)) {
            return back()->with('toast', AdminFlashToast::error('No hay token de APISUNAT configurado.'));
        }

        try {
            $token = Crypt::decryptString($rawTokenEnc);
        } catch (\Throwable) {
            return back()->with('toast', AdminFlashToast::error('No se pudo descifrar el token de APISUNAT.'));
        }

        $docNames = ['01' => 'factura', '03' => 'boleta', '07' => 'nota_credito', '08' => 'nota_debito'];
        $docName  = $docNames[$invoice->sunat_document_type_code] ?? 'boleta';
        $env      = $settings->environment ?? 'beta';
        $baseUrl  = $env === 'production'
            ? 'https://app.apisunat.pe/api/v3/status'
            : 'https://sandbox.apisunat.pe/api/v3/status';

        try {
            $resp = Http::withToken($token)->timeout(20)->post($baseUrl, [
                'documento' => $docName,
                'serie'     => $invoice->sunat_serie,
                'numero'    => (int) $invoice->sunat_correlative,
            ]);

            $json    = $resp->json();
            $payload = $json['payload'] ?? [];
            $pdf     = $payload['pdf'] ?? [];

            if (!empty($pdf['ticket'])) {
                $invoice->update([
                    'pdf_path'        => $pdf['ticket'],
                    'xml_signed_path' => $payload['xml'] ?? $invoice->xml_signed_path,
                    'cdr_path'        => $payload['cdr'] ?? $invoice->cdr_path,
                ]);

                return back()->with('toast', AdminFlashToast::success('PDF actualizado correctamente.'));
            }

            return back()->with('toast', AdminFlashToast::error('APISUNAT no devolvió PDF. ' . ($json['message'] ?? '')));
        } catch (\Throwable $e) {
            return back()->with('toast', AdminFlashToast::error('Error al consultar APISUNAT: ' . $e->getMessage()));
        }
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        // Solo se pueden eliminar comprobantes que no llegaron a SUNAT
        if (in_array($invoice->sunat_filing_status, [
            Invoice::FILING_ACCEPTED,
            Invoice::FILING_ACCEPTED_WITH_OBS,
            Invoice::FILING_PENDING,
        ])) {
            return back()->with('toast', AdminFlashToast::error(
                'No se puede eliminar este comprobante.',
                'Solo se pueden eliminar los que están en estado Borrador o Error.',
            ));
        }

        $number = $invoice->invoice_number;

        DB::transaction(function () use ($invoice) {
            // Si este comprobante es el último correlativo emitido en su secuencia,
            // retrocedemos el contador para que el número pueda reutilizarse.
            $sequence = \App\Models\InvoiceDocumentSequence::where('serie', $invoice->sunat_serie)
                ->where('document_type_code', $invoice->sunat_document_type_code)
                ->first();

            if ($sequence && ($sequence->next_correlative - 1) === (int) $invoice->sunat_correlative) {
                $sequence->decrement('next_correlative');
            }

            $invoice->submissionLogs()->delete();
            $invoice->lines()->delete();
            $invoice->delete();
        });

        return redirect('/panel/ventas-facturas')
            ->with('toast', AdminFlashToast::success("Comprobante {$number} eliminado."));
    }

    /**
     * Elige el servicio de emisión según el emission_mode del emisor configurado.
     * - 'apisunat' → ApiSunatEmitterService (Lucode PSE, sin certificado propio)
     * - cualquier otro → InvoiceEmitterService (Greenter SOAP, requiere certificado .p12)
     */
    private function emitInvoice(Invoice $invoice): bool
    {
        $mode = CompanyLegalProfile::query()
            ->where('is_default_issuer', true)
            ->with('sunatEmitterSetting:id,company_legal_profile_id,emission_mode,is_active')
            ->first()
            ?->sunatEmitterSetting
            ?->emission_mode;

        if ($mode === 'apisunat') {
            return (new ApiSunatEmitterService())->emit($invoice);
        }

        return (new InvoiceEmitterService())->emit($invoice);
    }
}
