import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    Eye,
    FileCode2,
    FileText,
    Package,
} from 'lucide-react';

import { formatClientFullName } from '@/components/sales/orders/orderDisplay';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type ClientSummary = {
    id: number;
    name: string;
    lastname: string | null;
    email: string;
    document_number: string | null;
    profile: { ruc: string | null; legal_name: string | null } | null;
};

type InvoiceDetail = {
    id: string;
    invoice_number: string;
    doc_type_label: string;
    sunat_filing_status: string;
    sunat_response_description: string | null;
    subtotal: string;
    tax_total: string;
    grand_total: string;
    currency: string;
    issued_at: string | null;
    buyer: {
        num_doc: string | null;
        razon_social: string | null;
    };
    lines: {
        id: string;
        description: string;
        quantity: string;
        unit_price: string;
        line_total: string;
    }[];
    order: {
        order_number: string;
        lines: {
            product_name: string | null;
            sku_name: string | null;
            quantity: string;
            line_total: string;
        }[];
    } | null;
    downloads: {
        pdf_ticket: boolean;
        pdf_a4: boolean;
        xml: boolean;
        cdr: boolean;
    };
};

type Props = {
    client: ClientSummary;
    invoice: InvoiceDetail;
};

function formatMoney(amount: string, currency: string): string {
    return `${currency} ${Number(amount).toFixed(2)}`;
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export default function AdminClientFacturasShow({ client, invoice }: Props) {
    const clientLabel = formatClientFullName({
        name: client.name,
        lastname: client.lastname,
        email: client.email,
        document_number: client.document_number,
    });
    const listHref = `/panel/acceso-clientes/${client.id}/facturas`;
    const base = `${listHref}/${invoice.id}`;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: 'Usuarios cliente', href: '/panel/acceso-clientes' },
        { title: clientLabel, href: listHref },
        { title: invoice.invoice_number, href: base },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${invoice.invoice_number} — ${clientLabel}`} />
            <div className="space-y-5 px-4 py-6 md:px-6 lg:px-7">
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 text-sm text-[#4A80B8] hover:underline"
                    >
                        <ArrowLeft className="size-4" />
                        Volver al listado
                    </Link>
                </div>

                <NeuCardRaised className="rounded-2xl border border-[#4A80B8]/20 bg-[#4A80B8]/5 p-4">
                    <div className="flex items-start gap-3 text-sm">
                        <Eye className="mt-0.5 size-5 shrink-0 text-[#4A80B8]" />
                        <div>
                            <p className="font-semibold text-[#4A80B8]">
                                Vista espejo del portal — solo lectura
                            </p>
                            <p className="mt-1 text-muted-foreground">
                                Lo que ve{' '}
                                <span className="font-medium">{client.email}</span>{' '}
                                en /cliente/facturas
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                    <div className="space-y-5">
                        <NeuCardRaised className="rounded-2xl p-5">
                            <h1 className="font-mono text-xl font-bold">
                                {invoice.invoice_number}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {invoice.doc_type_label} ·{' '}
                                {formatDate(invoice.issued_at)}
                            </p>
                            {invoice.sunat_response_description ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {invoice.sunat_response_description}
                                </p>
                            ) : null}
                        </NeuCardRaised>

                        <NeuCardRaised className="overflow-hidden rounded-2xl">
                            <div className="border-b border-border/60 px-5 py-3 font-semibold text-sm">
                                Líneas del comprobante
                            </div>
                            <div className="divide-y divide-border/50">
                                {invoice.lines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm"
                                    >
                                        <span>{line.description}</span>
                                        <span className="tabular-nums font-medium">
                                            {formatMoney(
                                                line.line_total,
                                                invoice.currency,
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1 border-t border-border/60 px-5 py-4 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>
                                        {formatMoney(
                                            invoice.subtotal,
                                            invoice.currency,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>IGV</span>
                                    <span>
                                        {formatMoney(
                                            invoice.tax_total,
                                            invoice.currency,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-semibold">
                                    <span>Total</span>
                                    <span>
                                        {formatMoney(
                                            invoice.grand_total,
                                            invoice.currency,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </NeuCardRaised>

                        {invoice.order ? (
                            <NeuCardRaised className="overflow-hidden rounded-2xl">
                                <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3 text-sm font-semibold">
                                    <Package className="size-4" />
                                    Pedido {invoice.order.order_number}
                                </div>
                                <ul className="divide-y divide-border/50">
                                    {invoice.order.lines.map((line, i) => (
                                        <li
                                            key={i}
                                            className="px-5 py-3 text-sm"
                                        >
                                            {line.product_name ??
                                                line.sku_name ??
                                                'Producto'}
                                        </li>
                                    ))}
                                </ul>
                            </NeuCardRaised>
                        ) : null}
                    </div>

                    <aside className="space-y-4">
                        <NeuCardRaised className="rounded-2xl p-5">
                            <h2 className="text-sm font-semibold">Comprador</h2>
                            <p className="mt-2 text-sm font-medium">
                                {invoice.buyer.razon_social ?? '—'}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                                {invoice.buyer.num_doc ?? '—'}
                            </p>
                        </NeuCardRaised>

                        <NeuCardRaised className="rounded-2xl p-5">
                            <h2 className="text-sm font-semibold">Descargas</h2>
                            <div className="mt-3 grid gap-2">
                                {invoice.downloads.pdf_ticket ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
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
                                        size="sm"
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
                                        size="sm"
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <a href={`${base}/xml`}>
                                            <FileCode2 className="size-4" />
                                            XML
                                        </a>
                                    </Button>
                                ) : null}
                                {invoice.downloads.cdr ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <a href={`${base}/cdr`}>
                                            <Download className="size-4" />
                                            CDR
                                        </a>
                                    </Button>
                                ) : null}
                            </div>
                            <Link
                                href={`/panel/ventas-facturas/${invoice.id}`}
                                className="mt-4 block text-center text-xs text-[#4A80B8] hover:underline"
                            >
                                Abrir en comprobantes admin →
                            </Link>
                        </NeuCardRaised>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
