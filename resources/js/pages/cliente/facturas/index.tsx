import { Link } from '@inertiajs/react';
import { Download, FileText, Receipt } from 'lucide-react';

import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import { Button } from '@/components/ui/button';
import ClientPortalLayout from '@/layouts/client-portal-layout';

type InvoiceRow = {
    id: string;
    invoice_number: string;
    doc_type_code: string;
    doc_type_label: string;
    sunat_filing_status: string;
    grand_total: string;
    currency: string;
    issued_at: string | null;
    order_number: string | null;
    has_pdf: boolean;
    has_xml: boolean;
    has_cdr: boolean;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
};

type Props = {
    invoices: Paginated<InvoiceRow>;
};

const FILING_LABELS: Record<string, string> = {
    accepted: 'Aceptado',
    accepted_obs: 'Aceptado con observaciones',
    pending: 'Pendiente',
    rejected: 'Rechazado',
    error: 'Error',
};

function filingBadgeClass(status: string): string {
    if (status === 'accepted' || status === 'accepted_obs') {
        return 'bg-[color-mix(in_oklab,var(--state-success)_18%,transparent)] text-[color-mix(in_oklab,var(--state-success)_75%,var(--foreground))]';
    }
    if (status === 'pending') {
        return 'bg-[color-mix(in_oklab,var(--state-warning)_18%,transparent)] text-[color-mix(in_oklab,var(--state-warning)_75%,var(--foreground))]';
    }
    return 'bg-[color-mix(in_oklab,var(--state-alert)_15%,transparent)] text-[color-mix(in_oklab,var(--state-alert)_72%,var(--foreground))]';
}

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
        month: 'short',
        year: 'numeric',
    });
}

export default function ClienteFacturasIndex({ invoices }: Props) {
    const rows = invoices.data;

    return (
        <ClientPortalLayout
            title="Facturas"
            headTitle="Facturas — Área del cliente"
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Facturas' },
            ]}
        >
            <div className="w-full space-y-5">
                <ClientPageTitleCard
                    title="Comprobantes electrónicos"
                    description="Facturas y boletas emitidas a tu nombre. Descarga XML, PDF y CDR cuando estén disponibles."
                />

                <div className="overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] shadow-sm">
                    {rows.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <Receipt
                                className="mx-auto size-10 text-muted-foreground/60"
                                aria-hidden
                            />
                            <p className="mt-3 text-sm text-muted-foreground">
                                Aún no tienes comprobantes emitidos a tu nombre.
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Cuando emitamos una factura o boleta vinculada a tu
                                cuenta o RUC, aparecerá aquí.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_7%,transparent)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            <th className="px-4 py-3">
                                                Comprobante
                                            </th>
                                            <th className="px-4 py-3">
                                                Fecha
                                            </th>
                                            <th className="px-4 py-3">
                                                Pedido
                                            </th>
                                            <th className="px-4 py-3">
                                                Estado SUNAT
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Total
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-b border-[color-mix(in_oklab,var(--border)_80%,transparent)] last:border-0"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-foreground">
                                                        {row.invoice_number}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {row.doc_type_label}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDate(row.issued_at)}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {row.order_number ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${filingBadgeClass(row.sunat_filing_status)}`}
                                                    >
                                                        {FILING_LABELS[
                                                            row.sunat_filing_status
                                                        ] ?? row.sunat_filing_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                    {formatMoney(
                                                        row.grand_total,
                                                        row.currency,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/cliente/facturas/${row.id}`}
                                                            >
                                                                <FileText className="size-4" />
                                                                Ver
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="divide-y divide-[color-mix(in_oklab,var(--border)_80%,transparent)] md:hidden">
                                {rows.map((row) => (
                                    <div key={row.id} className="space-y-2 px-4 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    {row.invoice_number}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {row.doc_type_label} ·{' '}
                                                    {formatDate(row.issued_at)}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${filingBadgeClass(row.sunat_filing_status)}`}
                                            >
                                                {FILING_LABELS[
                                                    row.sunat_filing_status
                                                ] ?? row.sunat_filing_status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {row.order_number
                                                    ? `Pedido ${row.order_number}`
                                                    : 'Sin pedido'}
                                            </span>
                                            <span className="font-medium tabular-nums">
                                                {formatMoney(
                                                    row.grand_total,
                                                    row.currency,
                                                )}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link
                                                href={`/cliente/facturas/${row.id}`}
                                            >
                                                <Download className="size-4" />
                                                Ver detalle y descargas
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {invoices.last_page > 1 ? (
                    <nav className="flex flex-wrap gap-2">
                        {invoices.links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={`${link.label}-${i}`}
                                    href={link.url}
                                    className={`rounded-lg border px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'border-[color-mix(in_oklab,var(--state-info)_40%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_12%,transparent)] font-medium'
                                            : 'border-[color-mix(in_oklab,var(--border)_90%,transparent)] text-muted-foreground hover:bg-muted/40'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : null,
                        )}
                    </nav>
                ) : null}
            </div>
        </ClientPortalLayout>
    );
}
