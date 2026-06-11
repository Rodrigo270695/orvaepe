<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanyLegalProfile;
use App\Models\Invoice;
use App\Models\InvoiceLine;
use App\Models\InvoiceDocumentSequence;
use App\Models\Order;
use App\Services\Sunat\InvoiceEmitterService;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        // Emitir a SUNAT
        $service = new InvoiceEmitterService();
        $accepted = $service->emit($invoice);

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

        return Inertia::render('admin/comprobantes/show', [
            'invoice' => $invoice,
        ]);
    }

    public function retry(Invoice $invoice): RedirectResponse
    {
        if ($invoice->isAccepted()) {
            return back()->with('toast', AdminFlashToast::success('Este comprobante ya fue aceptado por SUNAT.'));
        }

        $service  = new InvoiceEmitterService();
        $accepted = $service->emit($invoice);
        $invoice->refresh();

        return back()->with('toast', $accepted
            ? AdminFlashToast::success('Re-envío aceptado por SUNAT ✓')
            : AdminFlashToast::error('SUNAT rechazó el reintento: ' . ($invoice->sunat_response_description ?? 'Error')),
        );
    }
}
