<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\User;
use App\Support\Invoices\ClientInvoiceAccess;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Vista espejo (solo lectura) de /cliente/facturas para soporte desde el panel admin.
 */
class ClientUserInvoicesController extends Controller
{
    public function index(Request $request, User $user): Response
    {
        $this->ensureClientUser($user);

        $access = new ClientInvoiceAccess($user);

        $invoices = $access->query()
            ->with(['order:id,order_number'])
            ->orderByDesc('issued_at')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Invoice $invoice): array => $access->listPayload($invoice));

        return Inertia::render('admin/acceso-clientes/facturas/index', [
            'client' => $access->clientSummary(),
            'invoices' => $invoices,
        ]);
    }

    public function show(Request $request, User $user, Invoice $invoice): Response
    {
        $this->ensureClientUser($user);
        $access = new ClientInvoiceAccess($user);
        abort_unless($access->belongsToClient($invoice), 404);

        $invoice->load([
            'lines',
            'order' => fn ($q) => $q->with([
                'lines' => fn ($lq) => $lq->select([
                    'id',
                    'order_id',
                    'product_name_snapshot',
                    'sku_name_snapshot',
                    'quantity',
                    'unit_price',
                    'line_total',
                    'tax_amount',
                ]),
            ]),
        ]);

        return Inertia::render('admin/acceso-clientes/facturas/show', [
            'client' => $access->clientSummary(),
            'invoice' => $access->detailPayload($invoice),
        ]);
    }

    public function downloadXml(User $user, Invoice $invoice): StreamedResponse|RedirectResponse
    {
        $this->ensureClientUser($user);
        $access = new ClientInvoiceAccess($user);
        abort_unless($access->belongsToClient($invoice), 404);

        return ClientInvoiceAccess::proxyDownload(
            $invoice->xml_signed_path,
            $invoice->invoice_number.'.xml',
            'application/xml',
        );
    }

    public function downloadCdr(User $user, Invoice $invoice): StreamedResponse|RedirectResponse
    {
        $this->ensureClientUser($user);
        $access = new ClientInvoiceAccess($user);
        abort_unless($access->belongsToClient($invoice), 404);

        return ClientInvoiceAccess::proxyDownload(
            $invoice->cdr_path,
            'CDR-'.$invoice->invoice_number.'.xml',
            'application/xml',
        );
    }

    public function downloadPdf(Request $request, User $user, Invoice $invoice): StreamedResponse|RedirectResponse
    {
        $this->ensureClientUser($user);
        $access = new ClientInvoiceAccess($user);
        abort_unless($access->belongsToClient($invoice), 404);

        $format = $request->query('format', 'ticket');
        $url = $invoice->pdf_path;

        if ($url && $format === 'a4') {
            $url = str_replace('/pdf/ticket/', '/pdf/a4/', $url);
        }

        $suffix = $format === 'a4' ? '-A4' : '-ticket';

        return ClientInvoiceAccess::proxyDownload(
            $url,
            $invoice->invoice_number.$suffix.'.pdf',
            'application/pdf',
        );
    }

    private function ensureClientUser(User $user): void
    {
        abort_unless($user->hasRole('client'), 404);
    }
}
