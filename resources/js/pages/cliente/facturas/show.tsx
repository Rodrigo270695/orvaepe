import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Download,
    FileCode2,
    FileText,
    Package,
    Receipt,
} from 'lucide-react';

import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import { Button } from '@/components/ui/button';
import ClientPortalLayout from '@/layouts/client-portal-layout';

type InvoiceLine = {
    id: string;
    description: string;
    quantity: string;
    unit_measure_code: string | null;
    unit_price: string;
    tax_rate: string;
    line_total: string;
};

type OrderLine = {
    id: string;
    product_name: string | null;
    sku_name: string | null;
    quantity: string;
    unit_price: string;
    line_total: string;
};

type InvoiceDetail = {
    id: string;
    invoice_number: string;
    doc_type_code: string;
    doc_type_label: string;
    sunat_filing_status: string;
    sunat_response_code: string | null;
    sunat_response_description: string | null;
    subtotal: string;
    tax_total: string;
    grand_total: string;
    currency: string;
    issued_at: string | null;
    buyer: {
        tipo_doc: string | null;
        num_doc: string | null;
        razon_social: string | null;
        direccion: string | null;
    };
    lines: InvoiceLine[];
    order: {
        id: string;
        order_number: string;
        lines: OrderLine[];
    } | null;
    downloads: {
        pdf_ticket: boolean;
        pdf_a4: boolean;
        xml: boolean;
        cdr: boolean;
    };
};

type Props = {
    invoice: InvoiceDetail;
};

const DOC_TYPE_LABEL: Record<string, string> = {
    '1': 'DNI',
    '6': 'RUC',
};

const FILING_LABELS: Record<string, string> = {
    accepted: 'Aceptado por SUNAT',
    accepted_obs: 'Aceptado con observaciones',
    pending: 'Pendiente',
    rejected: 'Rechazado',
    error: 'Error técnico',
};

function formatMoney(amount: string, currency: string): string {
    return `${currency} ${Number(amount).toFixed(2)}`;
}

function formatDate(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export default function ClienteFacturasShow({ invoice }: Props) {
    const base = `/cliente/facturas/${invoice.id}`;
    const isAccepted =
        invoice.sunat_filing_status === 'accepted' ||
        invoice.sunat_filing_status === 'accepted_obs';

    return (
        <ClientPortalLayout
            title={invoice.invoice_number}
            headTitle={`${invoice.invoice_number} — Facturas`}
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Facturas', href: '/cliente/facturas' },
                { label: invoice.invoice_number },
            ]}
        >
            <div className="w-full space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/cliente/facturas">
                            <ArrowLeft className="size-4" />
                            Volver al listado
                        </Link>
                    </Button>
                </div>

                <ClientPageTitleCard
                    title={invoice.invoice_number}
                    description={`${invoice.doc_type_label} · Emitido el ${formatDate(invoice.issued_at)}`}
                />

                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-5">
                        <section className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                        Estado SUNAT
                                    </h2>
                                    <p className="mt-1 flex items-center gap-2 text-base font-medium">
                                        {isAccepted ? (
                                            <BadgeCheck className="size-5 text-[color-mix(in_oklab,var(--state-success)_70%,var(--foreground))]" />
                                        ) : (
                                            <Receipt className="size-5 text-muted-foreground" />
                                        )}
                                        {FILING_LABELS[invoice.sunat_filing_status] ??
                                            invoice.sunat_filing_status}
                                    </p>
                                    {invoice.sunat_response_description ? (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {invoice.sunat_response_description}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                    <p>Adquirente</p>
                                    <p className="font-medium text-foreground">
                                        {invoice.buyer.razon_social ?? '—'}
                                    </p>
                                    <p>
                                        {DOC_TYPE_LABEL[
                                            invoice.buyer.tipo_doc ?? ''
                                        ] ?? 'Doc'}{' '}
                                        {invoice.buyer.num_doc ?? '—'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] shadow-sm">
                            <div className="border-b border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] px-5 py-3">
                                <h2 className="text-sm font-semibold">
                                    Detalle del comprobante
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] text-left text-sm">
                                    <thead>
                                        <tr className="bg-[color-mix(in_oklab,var(--state-info)_6%,transparent)] text-xs uppercase tracking-wide text-muted-foreground">
                                            <th className="px-4 py-2.5">
                                                Descripción
                                            </th>
                                            <th className="px-4 py-2.5 text-right">
                                                Cant.
                                            </th>
                                            <th className="px-4 py-2.5 text-right">
                                                P. unit.
                                            </th>
                                            <th className="px-4 py-2.5 text-right">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.lines.map((line) => (
                                            <tr
                                                key={line.id}
                                                className="border-t border-[color-mix(in_oklab,var(--border)_80%,transparent)]"
                                            >
                                                <td className="px-4 py-3">
                                                    {line.description}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    {Number(line.quantity)}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    {formatMoney(
                                                        line.unit_price,
                                                        invoice.currency,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                    {formatMoney(
                                                        line.line_total,
                                                        invoice.currency,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="space-y-1 border-t border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] px-5 py-4 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal (sin IGV)</span>
                                    <span className="tabular-nums">
                                        {formatMoney(
                                            invoice.subtotal,
                                            invoice.currency,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>IGV</span>
                                    <span className="tabular-nums">
                                        {formatMoney(
                                            invoice.tax_total,
                                            invoice.currency,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-semibold">
                                    <span>Total</span>
                                    <span className="tabular-nums">
                                        {formatMoney(
                                            invoice.grand_total,
                                            invoice.currency,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {invoice.order ? (
                            <section className="overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] shadow-sm">
                                <div className="flex items-center gap-2 border-b border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] px-5 py-3">
                                    <Package className="size-4 text-muted-foreground" />
                                    <h2 className="text-sm font-semibold">
                                        Pedido {invoice.order.order_number}
                                    </h2>
                                </div>
                                <ul className="divide-y divide-[color-mix(in_oklab,var(--border)_80%,transparent)]">
                                    {invoice.order.lines.map((line) => (
                                        <li
                                            key={line.id}
                                            className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {line.product_name ??
                                                        line.sku_name ??
                                                        'Producto'}
                                                </p>
                                                {line.sku_name &&
                                                line.product_name ? (
                                                    <p className="text-xs text-muted-foreground">
                                                        {line.sku_name}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="text-right text-muted-foreground">
                                                <p>
                                                    {Number(line.quantity)} ×{' '}
                                                    {formatMoney(
                                                        line.unit_price,
                                                        invoice.currency,
                                                    )}
                                                </p>
                                                <p className="font-medium text-foreground tabular-nums">
                                                    {formatMoney(
                                                        line.line_total,
                                                        invoice.currency,
                                                    )}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ) : null}
                    </div>

                    <aside className="space-y-4">
                        <section className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] p-5 shadow-sm">
                            <h2 className="text-sm font-semibold">
                                Descargas
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Archivos oficiales del comprobante electrónico.
                            </p>
                            <div className="mt-4 grid gap-2">
                                {invoice.downloads.pdf_ticket ? (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <a
                                            href={`${base}/pdf?format=ticket`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <FileText className="size-4" />
                                            PDF ticket
                                        </a>
                                    </Button>
                                ) : null}
                                {invoice.downloads.pdf_a4 ? (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <a
                                            href={`${base}/pdf?format=a4`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <FileText className="size-4" />
                                            PDF A4
                                        </a>
                                    </Button>
                                ) : null}
                                {invoice.downloads.xml ? (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <a href={`${base}/xml`}>
                                            <FileCode2 className="size-4" />
                                            XML firmado
                                        </a>
                                    </Button>
                                ) : null}
                                {invoice.downloads.cdr ? (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <a href={`${base}/cdr`}>
                                            <Download className="size-4" />
                                            CDR (SUNAT)
                                        </a>
                                    </Button>
                                ) : null}
                                {!invoice.downloads.pdf_ticket &&
                                !invoice.downloads.xml &&
                                !invoice.downloads.cdr ? (
                                    <p className="text-sm text-muted-foreground">
                                        Los archivos estarán disponibles cuando
                                        SUNAT acepte el comprobante.
                                    </p>
                                ) : null}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </ClientPortalLayout>
    );
}
