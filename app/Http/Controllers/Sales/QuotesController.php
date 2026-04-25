<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\QuoteSendEmailRequest;
use App\Http\Requests\Sales\QuoteStoreRequest;
use App\Mail\QuoteSentToCustomerMail;
use App\Models\CatalogSku;
use App\Models\Quote;
use App\Models\QuoteLine;
use App\Models\User;
use App\Support\AdminFlashToast;
use App\Support\Sales\PeruIgvLineCalculator;
use App\Support\Sales\QuotePdfGenerator;
use App\Support\Users\StaffDisplayName;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\HeaderUtils;

class QuotesController extends Controller
{
    public function index(Request $request): InertiaResponse|RedirectResponse
    {
        $q = trim((string) $request->input('q', ''));
        $status = trim((string) $request->input('status', ''));

        $perPage = (int) $request->input('per_page', 25);
        $allowedPerPage = [10, 15, 20, 25, 30, 40, 50];
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        $dateFrom = trim((string) $request->input('date_from', ''));
        $dateTo = trim((string) $request->input('date_to', ''));
        $datePattern = '/^\d{4}-\d{2}-\d{2}$/';
        $validFrom = $dateFrom !== '' && preg_match($datePattern, $dateFrom);
        $validTo = $dateTo !== '' && preg_match($datePattern, $dateTo);

        if (! $validFrom || ! $validTo) {
            $params = array_merge($request->query(), [
                'date_from' => now()->startOfMonth()->format('Y-m-d'),
                'date_to' => now()->endOfMonth()->format('Y-m-d'),
            ]);

            return redirect()->route('panel.ventas-cotizaciones.index', $params);
        }

        $quotesQuery = Quote::query()
            ->with(['user:id,name,lastname,email,document_number'])
            ->withCount('lines');

        if ($q !== '') {
            $quotesQuery->where(function ($sub) use ($q): void {
                $sub->where('quote_number', 'ILIKE', "%{$q}%")
                    ->orWhere('customer_legal_name', 'ILIKE', "%{$q}%")
                    ->orWhere('customer_document_number', 'ILIKE', "%{$q}%");
            });
        }

        $quotesQuery->whereDate('created_at', '>=', $dateFrom);
        $quotesQuery->whereDate('created_at', '<=', $dateTo);

        $allowedStatuses = [
            Quote::STATUS_DRAFT,
            Quote::STATUS_SENT,
            Quote::STATUS_VIEWED,
            Quote::STATUS_ACCEPTED,
            Quote::STATUS_REJECTED,
            Quote::STATUS_EXPIRED,
            Quote::STATUS_CONVERTED,
        ];
        if ($status !== '' && in_array($status, $allowedStatuses, true)) {
            $quotesQuery->where('status', $status);
        }

        $append = ['per_page' => $perPage];
        if ($q !== '') {
            $append['q'] = $q;
        }
        if ($status !== '') {
            $append['status'] = $status;
        }
        $append['date_from'] = $dateFrom;
        $append['date_to'] = $dateTo;

        $sortDir = strtolower((string) $request->input('sort_dir', 'desc'));
        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }
        $append['sort_dir'] = $sortDir;

        $quotes = $quotesQuery
            ->orderBy('created_at', $sortDir)
            ->paginate($perPage)
            ->appends($append);

        return Inertia::render('admin/ventas-cotizaciones/index', [
            'quotes' => $quotes,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'sort_dir' => $sortDir,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create(): InertiaResponse
    {
        $usersForSelect = User::query()
            ->role('client')
            ->with('profile')
            ->orderBy('name')
            ->orderBy('email')
            ->limit(500)
            ->get(['id', 'name', 'lastname', 'email', 'document_number'])
            ->map(function (User $u) {
                $p = $u->profile;

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'lastname' => $u->lastname,
                    'email' => $u->email,
                    'document_number' => $u->document_number,
                    'profile' => $p === null ? null : [
                        'legal_name' => $p->legal_name,
                        'company_name' => $p->company_name,
                        'ruc' => $p->ruc,
                        'billing_email' => $p->billing_email,
                        'phone' => $p->phone,
                        'address' => $p->address,
                        'city' => $p->city,
                    ],
                ];
            });

        $skusForSelect = CatalogSku::query()
            ->with('product:id,name')
            ->where('is_active', true)
            ->orderBy('code')
            ->get()
            ->map(fn (CatalogSku $s) => [
                'id' => $s->id,
                'code' => $s->code,
                'name' => $s->name,
                'product_name' => $s->product?->name ?? '—',
                'currency' => $s->currency,
                'list_price' => (string) $s->list_price,
            ]);

        return Inertia::render('admin/ventas-cotizaciones/create', [
            'usersForSelect' => $usersForSelect,
            'skusForSelect' => $skusForSelect,
        ]);
    }

    public function store(QuoteStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $linesInput = $data['lines'];
        unset($data['lines']);

        $currency = strtoupper($data['currency']);
        $data['currency'] = $currency;

        $skuIds = collect($linesInput)
            ->pluck('catalog_sku_id')
            ->filter(fn ($id) => is_string($id) && trim($id) !== '')
            ->unique()
            ->values();
        $skus = CatalogSku::query()
            ->with('product:id,name')
            ->whereIn('id', $skuIds)
            ->get()
            ->keyBy('id');

        foreach ($linesInput as $index => $line) {
            $catalogSkuId = is_string($line['catalog_sku_id'] ?? null)
                ? trim($line['catalog_sku_id'])
                : '';

            if ($catalogSkuId === '') {
                $manualName = trim((string) ($line['manual_name'] ?? ''));
                if ($manualName === '') {
                    throw ValidationException::withMessages([
                        "lines.{$index}.manual_name" => 'Ingresa el nombre para la línea manual.',
                    ]);
                }
                continue;
            }

            $sku = $skus->get($catalogSkuId);
            if ($sku === null) {
                throw ValidationException::withMessages([
                    "lines.{$index}.catalog_sku_id" => 'SKU no encontrado.',
                ]);
            }
            if (! $sku->is_active) {
                throw ValidationException::withMessages([
                    "lines.{$index}.catalog_sku_id" => 'El SKU no está activo.',
                ]);
            }
            if (strtoupper((string) $sku->currency) !== $currency) {
                throw ValidationException::withMessages([
                    "lines.{$index}.catalog_sku_id" => 'La moneda del SKU debe coincidir con la moneda de la cotización ('.$currency.').',
                ]);
            }
        }

        $quote = DB::transaction(function () use ($data, $linesInput, $skus, $request, $currency) {
            $subtotal = 0.0;
            $discountTotal = 0.0;
            $taxTotal = 0.0;

            $igvRate = (float) config('sales.igv_rate', 0.18);
            $lineRows = [];
            $sortOrder = 0;
            foreach ($linesInput as $lineIndex => $line) {
                $catalogSkuId = is_string($line['catalog_sku_id'] ?? null)
                    ? trim($line['catalog_sku_id'])
                    : '';
                $sku = $catalogSkuId !== '' ? $skus->get($catalogSkuId) : null;
                $qty = (int) $line['quantity'];
                $unit = isset($line['unit_price'])
                    ? (float) $line['unit_price']
                    : (float) ($sku?->list_price ?? 0.0);
                if ($unit < 0) {
                    $unit = 0.0;
                }
                $lineDiscountInput = isset($line['line_discount'])
                    ? (float) $line['line_discount']
                    : 0.0;
                if ($lineDiscountInput < 0) {
                    $lineDiscountInput = 0.0;
                }

                $taxIncluded = $sku !== null ? (bool) $sku->tax_included : false;
                $igvApplies = $sku !== null
                    ? (bool) ($sku->igv_applies ?? true)
                    : (bool) ($line['manual_igv_applies'] ?? true);

                $amounts = PeruIgvLineCalculator::forLine(
                    $qty,
                    $unit,
                    $taxIncluded,
                    $igvApplies ? $igvRate : null,
                    $igvApplies,
                );

                $baseLine = $amounts->baseLine;
                $taxLine = $amounts->taxLine;
                $lineTotal = $amounts->lineTotal;
                $lineDiscountRequested = min(
                    max(0.0, $lineDiscountInput),
                    $amounts->lineTotal,
                );

                $lineDiscountApplied = 0.0;
                if ($lineDiscountRequested > 0) {
                    if ($igvApplies && ! $taxIncluded) {
                        $d = min($lineDiscountRequested, $amounts->baseLine);
                        $baseLine = max(0.0, round($amounts->baseLine - $d, 2));
                        $taxLine = round($baseLine * $igvRate, 2);
                        $lineTotal = round($baseLine + $taxLine, 2);
                        $lineDiscountApplied = round($d, 2);
                    } elseif ($igvApplies && $taxIncluded) {
                        $d = min($lineDiscountRequested, $amounts->lineTotal);
                        $lineTotal = max(0.0, round($amounts->lineTotal - $d, 2));
                        $baseLine = round($lineTotal / (1 + $igvRate), 2);
                        $taxLine = round($lineTotal - $baseLine, 2);
                        $lineDiscountApplied = round($d, 2);
                    } else {
                        $d = min($lineDiscountRequested, $amounts->lineTotal);
                        $lineTotal = max(0.0, round($amounts->lineTotal - $d, 2));
                        $baseLine = $lineTotal;
                        $taxLine = 0.0;
                        $lineDiscountApplied = round($d, 2);
                    }
                }

                $subtotal += $baseLine;
                $taxTotal += $taxLine;
                $discountTotal += $lineDiscountApplied;

                $manualName = trim((string) ($line['manual_name'] ?? ''));
                $manualCode = trim((string) ($line['manual_code'] ?? ''));
                $productName = $sku?->product?->name ?? 'SKU manual';
                $skuNameSnapshot = $sku?->name;
                if ($sku === null) {
                    $productName = $manualName !== '' ? $manualName : 'SKU manual';
                    $skuNameSnapshot = $manualCode !== '' ? 'Código: '.$manualCode : 'Línea manual';
                }

                $lineRows[] = [
                    'catalog_sku_id' => $sku?->id,
                    'catalog_product_id' => $sku?->catalog_product_id,
                    'product_name_snapshot' => $productName,
                    'sku_name_snapshot' => $skuNameSnapshot,
                    'quantity' => $qty,
                    'unit_price' => round($unit, 2),
                    'tax_included' => $taxIncluded,
                    'igv_applies' => $igvApplies,
                    'tax_rate' => $igvApplies ? $igvRate : null,
                    'line_discount' => $lineDiscountApplied,
                    'line_discount_percent' => null,
                    'tax_amount' => $taxLine,
                    'line_total' => $lineTotal,
                    'sort_order' => $sortOrder++,
                    'metadata' => [
                        'igv_rate' => $igvApplies ? $igvRate : null,
                        'line_kind' => $sku === null ? 'manual' : 'catalog',
                        'manual_code' => $sku === null ? ($manualCode !== '' ? $manualCode : null) : null,
                        'manual_name' => $sku === null ? ($manualName !== '' ? $manualName : null) : null,
                        'line_input_index' => $lineIndex,
                    ],
                ];
            }

            $subtotal = round($subtotal, 2);
            $discountTotal = round($discountTotal, 2);
            $taxTotal = round($taxTotal, 2);
            $grandTotal = round(
                array_sum(array_column($lineRows, 'line_total')),
                2,
            );

            $quote = Quote::create([
                'quote_number' => Quote::generateQuoteNumber(),
                'user_id' => $data['user_id'] ?? null,
                'created_by' => $request->user()?->id,
                'status' => $data['status'],
                'currency' => $currency,
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'grand_total' => $grandTotal,
                'title' => $data['title'] ?? null,
                'customer_legal_name' => $data['customer_legal_name'] ?? null,
                'customer_document_type' => $data['customer_document_type'] ?? null,
                'customer_document_number' => $data['customer_document_number'] ?? null,
                'customer_email' => $data['customer_email'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'customer_address' => $data['customer_address'] ?? null,
                'customer_snapshot' => null,
                'billing_snapshot' => null,
                'notes_internal' => $data['notes_internal'] ?? null,
                'notes_customer' => null,
                'valid_until' => null,
                'sent_at' => ($data['status'] ?? '') === Quote::STATUS_SENT ? now() : null,
                'responded_at' => null,
                'converted_order_id' => null,
                'public_share_token' => null,
                'metadata' => null,
            ]);

            foreach ($lineRows as $row) {
                QuoteLine::create(array_merge($row, ['quote_id' => $quote->id]));
            }

            return $quote;
        });

        return redirect()->route('panel.ventas-cotizaciones.show', $quote);
    }

    public function destroy(Quote $quote): RedirectResponse
    {
        if ($quote->status !== Quote::STATUS_DRAFT) {
            abort(403);
        }

        $quote->delete();

        return redirect()
            ->route('panel.ventas-cotizaciones.index')
            ->with('success', 'Cotización eliminada.');
    }

    public function show(Quote $quote): InertiaResponse
    {
        $quote->load([
            'lines' => fn ($q) => $q->orderBy('sort_order')->orderBy('created_at'),
            'user:id,name,lastname,email,document_number',
            'creator' => fn ($q) => $q->select('id', 'name', 'lastname', 'email', 'username')
                ->with(['profile' => fn ($p) => $p->select('user_id', 'legal_name', 'metadata')]),
        ]);

        return Inertia::render('admin/ventas-cotizaciones/show', [
            'quote' => $quote,
            'creatorDisplayName' => StaffDisplayName::resolve($quote->creator),
            'defaultQuoteEmail' => self::defaultQuoteRecipientEmail($quote),
            'canSendQuoteEmail' => $quote->status !== Quote::STATUS_CONVERTED,
        ]);
    }

    /**
     * PDF de cotización (emisor: perfil legal SUNAT / company_legal_profiles).
     */
    public function pdf(Quote $quote): Response
    {
        $binary = QuotePdfGenerator::pdfBinary($quote);
        $filename = QuotePdfGenerator::attachmentFilename($quote);
        $fallback = preg_replace('/[^\x20-\x7E]/', '_', $filename) ?? 'cotizacion.pdf';

        return new Response($binary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => HeaderUtils::makeDisposition('inline', $filename, $fallback),
            'Content-Length' => (string) strlen($binary),
        ]);
    }

    /**
     * Envía la cotización en PDF al correo del cliente y marca la cotización como enviada.
     */
    public function sendEmail(QuoteSendEmailRequest $request, Quote $quote): RedirectResponse
    {
        if ($quote->status === Quote::STATUS_CONVERTED) {
            abort(403);
        }

        $email = strtolower(trim($request->validated()['email']));

        $pdfBinary = QuotePdfGenerator::pdfBinary($quote);
        $pdfName = QuotePdfGenerator::attachmentFilename($quote);

        try {
            Mail::to($email)->send(new QuoteSentToCustomerMail($quote, $pdfBinary, $pdfName));
        } catch (\Throwable $e) {
            report($e);

            return back()->with(
                'toast',
                AdminFlashToast::error('No se pudo enviar el correo. Revisa la configuración de envío (SMTP).'),
            );
        }

        $newStatus = match ($quote->status) {
            Quote::STATUS_DRAFT, Quote::STATUS_VIEWED => Quote::STATUS_SENT,
            default => $quote->status,
        };

        $quote->update([
            'customer_email' => $email,
            'status' => $newStatus,
            'sent_at' => now(),
        ]);

        return back()->with(
            'toast',
            AdminFlashToast::success('Cotización enviada a '.$email.'.'),
        );
    }

    private static function defaultQuoteRecipientEmail(Quote $quote): string
    {
        $fromQuote = trim((string) ($quote->customer_email ?? ''));
        if ($fromQuote !== '') {
            return $fromQuote;
        }
        $quote->loadMissing('user:id,email');
        $fromUser = trim((string) ($quote->user?->email ?? ''));

        return $fromUser;
    }
}
