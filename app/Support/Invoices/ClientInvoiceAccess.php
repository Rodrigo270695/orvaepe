<?php

declare(strict_types=1);

namespace App\Support\Invoices;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Consultas y payloads de comprobantes visibles para un usuario cliente del portal.
 */
final class ClientInvoiceAccess
{
    public function __construct(
        private readonly User $client,
    ) {
        $this->client->loadMissing('profile');
    }

    public function query(): Builder
    {
        $user = $this->client;
        $ruc = $user->profile?->ruc;
        $dni = $user->document_number;

        return Invoice::query()
            ->where(function (Builder $query) use ($user, $ruc, $dni): void {
                $query->where('client_user_id', $user->id);

                $query->orWhereHas('order', fn (Builder $order) => $order->where('user_id', $user->id));

                if (is_string($ruc) && $ruc !== '') {
                    $normalizedRuc = preg_replace('/\D+/', '', $ruc);
                    $query->orWhereRaw(
                        "buyer_snapshot->>'num_doc' = ?",
                        [$normalizedRuc],
                    );
                }

                if (is_string($dni) && $dni !== '') {
                    $normalizedDni = preg_replace('/\D+/', '', $dni);
                    $query->orWhereRaw(
                        "buyer_snapshot->>'num_doc' = ?",
                        [$normalizedDni],
                    );
                }
            })
            ->whereIn('sunat_filing_status', [
                Invoice::FILING_ACCEPTED,
                Invoice::FILING_ACCEPTED_WITH_OBS,
                Invoice::FILING_PENDING,
                Invoice::FILING_REJECTED,
                Invoice::FILING_ERROR,
            ]);
    }

    public function belongsToClient(Invoice $invoice): bool
    {
        return $this->query()
            ->whereKey($invoice->id)
            ->exists();
    }

    /**
     * @return array<string, mixed>
     */
    public function clientSummary(): array
    {
        return [
            'id' => $this->client->id,
            'name' => $this->client->name,
            'lastname' => $this->client->lastname,
            'email' => $this->client->email,
            'document_number' => $this->client->document_number,
            'profile' => $this->client->profile === null ? null : [
                'ruc' => $this->client->profile->ruc,
                'legal_name' => $this->client->profile->legal_name,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function listPayload(Invoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'doc_type_code' => $invoice->sunat_document_type_code,
            'doc_type_label' => $invoice->getDocTypeLabel(),
            'sunat_filing_status' => $invoice->sunat_filing_status,
            'grand_total' => (string) $invoice->grand_total,
            'currency' => $invoice->currency,
            'issued_at' => $invoice->issued_at?->toIso8601String(),
            'order_number' => $invoice->order?->order_number,
            'has_pdf' => filled($invoice->pdf_path),
            'has_xml' => filled($invoice->xml_signed_path),
            'has_cdr' => filled($invoice->cdr_path),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function detailPayload(Invoice $invoice): array
    {
        $buyer = is_array($invoice->buyer_snapshot) ? $invoice->buyer_snapshot : [];
        $pdfTicket = $invoice->pdf_path;
        $pdfA4 = is_string($pdfTicket) && $pdfTicket !== ''
            ? str_replace('/pdf/ticket/', '/pdf/a4/', $pdfTicket)
            : null;

        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'doc_type_code' => $invoice->sunat_document_type_code,
            'doc_type_label' => $invoice->getDocTypeLabel(),
            'sunat_filing_status' => $invoice->sunat_filing_status,
            'sunat_response_code' => $invoice->sunat_response_code,
            'sunat_response_description' => $invoice->sunat_response_description,
            'subtotal' => (string) $invoice->subtotal,
            'tax_total' => (string) $invoice->tax_total,
            'grand_total' => (string) $invoice->grand_total,
            'currency' => $invoice->currency,
            'issued_at' => $invoice->issued_at?->toIso8601String(),
            'buyer' => [
                'tipo_doc' => $buyer['tipo_doc'] ?? null,
                'num_doc' => $buyer['num_doc'] ?? null,
                'razon_social' => $buyer['razon_social'] ?? null,
                'direccion' => $buyer['direccion'] ?? null,
            ],
            'lines' => $invoice->lines->map(fn ($line): array => [
                'id' => $line->id,
                'description' => $line->description,
                'quantity' => (string) $line->quantity,
                'unit_measure_code' => $line->unit_measure_code,
                'unit_price' => (string) $line->unit_price,
                'tax_rate' => (string) $line->tax_rate,
                'line_total' => (string) $line->line_total,
            ])->values()->all(),
            'order' => $invoice->order === null ? null : [
                'id' => $invoice->order->id,
                'order_number' => $invoice->order->order_number,
                'lines' => $invoice->order->lines->map(fn ($line): array => [
                    'id' => $line->id,
                    'product_name' => $line->product_name_snapshot,
                    'sku_name' => $line->sku_name_snapshot,
                    'quantity' => (string) $line->quantity,
                    'unit_price' => (string) $line->unit_price,
                    'line_total' => (string) $line->line_total,
                ])->values()->all(),
            ],
            'downloads' => [
                'pdf_ticket' => filled($pdfTicket),
                'pdf_a4' => filled($pdfA4),
                'xml' => filled($invoice->xml_signed_path),
                'cdr' => filled($invoice->cdr_path),
            ],
        ];
    }

    public static function proxyDownload(
        ?string $url,
        string $filename,
        string $mime,
    ): StreamedResponse|RedirectResponse {
        if (empty($url)) {
            return back()->with('error', 'El archivo no está disponible todavía.');
        }

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            try {
                $response = Http::timeout(30)->get($url);
                $content = $response->body();
            } catch (\Throwable $e) {
                return back()->with('error', 'No se pudo descargar el archivo: '.$e->getMessage());
            }

            return response()->streamDownload(
                fn () => print($content),
                $filename,
                ['Content-Type' => $mime],
            );
        }

        $disk = Storage::disk('local');
        if (! $disk->exists($url)) {
            return back()->with('error', 'El archivo no está disponible.');
        }

        return response()->download($disk->path($url), $filename);
    }
}
