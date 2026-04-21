<?php

namespace App\Support\Sales;

use App\Models\CompanyLegalProfile;
use App\Models\Quote;
use App\Support\Users\StaffDisplayName;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

final class QuotePdfGenerator
{
    public static function loadQuoteForPdf(Quote $quote): void
    {
        $quote->load([
            'lines' => fn ($q) => $q->orderBy('sort_order')->orderBy('created_at'),
            'lines.sku:id,code',
            'user:id,name,lastname,email,document_number',
            'creator' => fn ($q) => $q->select('id', 'name', 'lastname', 'email', 'username')
                ->with(['profile' => fn ($p) => $p->select('user_id', 'legal_name', 'metadata')]),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function viewData(Quote $quote): array
    {
        self::loadQuoteForPdf($quote);

        $issuer = CompanyLegalProfile::query()
            ->orderByDesc('is_default_issuer')
            ->orderBy('created_at')
            ->first();

        $logoDataUri = null;
        if ($issuer && $issuer->logo_path && Storage::disk('public')->exists($issuer->logo_path)) {
            $bytes = Storage::disk('public')->get($issuer->logo_path);
            $ext = strtolower(pathinfo($issuer->logo_path, PATHINFO_EXTENSION));
            $mime = match ($ext) {
                'png' => 'image/png',
                'jpg', 'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                default => null,
            };
            if ($mime !== null) {
                $logoDataUri = 'data:'.$mime.';base64,'.base64_encode($bytes);
            }
        }

        $issuerLegalName = $issuer?->legal_name ?? '—';
        $issuerRuc = $issuer?->ruc ?? '—';

        $showIssuerTitleBar = $logoDataUri === null;
        $issuerBannerTitle = $issuer !== null ? $issuerLegalName : 'Emisor no configurado';

        $addrLine = trim((string) ($issuer?->address_line ?? ''));
        $locLine = $issuer !== null
            ? implode(' — ', array_filter([
                $issuer->district,
                $issuer->province,
                $issuer->department,
            ], fn ($x) => $x !== null && trim((string) $x) !== ''))
            : '';
        $issuerAddress = $addrLine !== ''
            ? $addrLine
            : $locLine;

        $contactBits = array_filter([
            $issuer?->phone ? 'Tel: '.$issuer->phone : null,
            $issuer?->support_email ? 'Email: '.$issuer->support_email : null,
            $issuer?->website ? 'Web: '.$issuer->website : null,
        ]);
        $issuerContact = $contactBits !== [] ? implode(' | ', $contactBits) : '';

        $customerName = trim((string) ($quote->customer_legal_name ?? ''));
        if ($customerName === '' && $quote->user !== null) {
            $customerName = trim(
                ($quote->user->name ?? '').' '.($quote->user->lastname ?? ''),
            );
        }
        if ($customerName === '') {
            $customerName = '—';
        }

        $docType = (string) ($quote->customer_document_type ?? '');
        $docLabel = match ($docType) {
            '6' => 'RUC',
            '1' => 'DNI',
            default => 'Documento',
        };
        $docNumber = trim((string) ($quote->customer_document_number ?? ''));
        $customerDoc = $docNumber !== '' ? $docLabel.' '.$docNumber : '';
        $customerDocLabel = $docNumber !== '' ? $docLabel : '';

        $contactParts = array_filter([
            trim((string) ($quote->customer_email ?? '')),
            trim((string) ($quote->customer_phone ?? '')),
        ]);
        $customerContact = $contactParts !== [] ? implode(' · ', $contactParts) : '';

        $quotePdf = config('sales.quote_pdf', []);
        $fallbackSignatoryName = (string) ($quotePdf['signatory_name'] ?? 'Rodrigo Granja Requejo');
        $fallbackSignatoryTitle = (string) ($quotePdf['signatory_title'] ?? 'Gerente General');

        $creator = $quote->creator;
        $staffDisplayName = StaffDisplayName::resolve($creator);
        $sellerName = $staffDisplayName;
        $signatoryName = $staffDisplayName !== '—' ? $staffDisplayName : $fallbackSignatoryName;
        $signatoryTitle = $fallbackSignatoryTitle;
        if ($creator?->profile !== null) {
            $meta = $creator->profile->metadata;
            if (is_array($meta) && isset($meta['job_title']) && is_string($meta['job_title'])) {
                $jt = trim($meta['job_title']);
                if ($jt !== '') {
                    $signatoryTitle = $jt;
                }
            }
        }

        $issuedAt = $quote->created_at?->timezone(config('app.timezone'))->format('d/m/Y') ?? '—';
        $validUntil = $quote->valid_until !== null
            ? $quote->valid_until->timezone(config('app.timezone'))->format('d/m/Y')
            : '—';

        $validityText = $quote->valid_until !== null
            ? 'Hasta el '.$validUntil.'.'
            : '30 días.';

        $currency = strtoupper((string) $quote->currency);
        $fmt = static fn (mixed $amount): string => $currency.' '.number_format((float) $amount, 2, '.', ',');

        $lines = [];
        $n = 0;
        foreach ($quote->lines as $line) {
            $n++;
            $desc = (string) $line->product_name_snapshot;
            if ($line->sku_name_snapshot !== null && trim((string) $line->sku_name_snapshot) !== '') {
                $desc .= "\n".$line->sku_name_snapshot;
            }
            $lines[] = [
                'n' => $n,
                'code' => $line->sku?->code ?? '—',
                'desc_html' => nl2br(e($desc)),
                'qty' => number_format((float) $line->quantity, 2, '.', ','),
                'uom' => 'UND',
                'unit' => $fmt($line->unit_price),
                'total' => $fmt($line->line_total),
            ];
        }

        $notesCustomer = trim((string) ($quote->notes_customer ?? ''));
        if (strlen($notesCustomer) > 800) {
            $notesCustomer = substr($notesCustomer, 0, 797).'…';
        }

        return [
            'logoDataUri' => $logoDataUri,
            'showIssuerTitleBar' => $showIssuerTitleBar,
            'issuerBannerTitle' => $issuerBannerTitle,
            'issuerLegalName' => $issuerLegalName,
            'issuerRuc' => $issuerRuc,
            'issuerAddress' => $issuerAddress,
            'issuerContact' => $issuerContact,
            'quoteNumber' => $quote->quote_number,
            'customerName' => $customerName,
            'customerDoc' => $customerDoc,
            'customerDocLabel' => $customerDocLabel,
            'customerContact' => $customerContact,
            'issuedAt' => $issuedAt,
            'validUntil' => $validUntil,
            'sellerName' => $sellerName,
            'subject' => trim((string) ($quote->title ?? '')),
            'lines' => $lines,
            'moneySubtotal' => $fmt($quote->subtotal),
            'moneyDiscount' => $fmt($quote->discount_total),
            'moneyTax' => $fmt($quote->tax_total),
            'moneyGrand' => $fmt($quote->grand_total),
            'hasDiscount' => (float) $quote->discount_total > 0.00001,
            'validityText' => $validityText,
            'paymentTerms' => (string) ($quotePdf['payment_terms'] ?? 'Transferencia, Yape o PLIN'),
            'notesCustomer' => $notesCustomer,
            'generatedAt' => now()->timezone(config('app.timezone'))->format('d/m/Y H:i'),
            'signatoryName' => $signatoryName,
            'signatoryTitle' => $signatoryTitle,
        ];
    }

    public static function pdfBinary(Quote $quote): string
    {
        $viewData = self::viewData($quote);
        $pdf = Pdf::loadView('pdf.quote', $viewData);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->output();
    }

    public static function attachmentFilename(Quote $quote): string
    {
        $safe = preg_replace('/[^A-Za-z0-9._-]+/', '_', $quote->quote_number) ?? 'cotizacion';

        return $safe.'.pdf';
    }
}
