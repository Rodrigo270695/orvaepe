import { Head, Link } from '@inertiajs/react';
import { Eye, FileText, Receipt } from 'lucide-react';

import { formatClientFullName } from '@/components/sales/orders/orderDisplay';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
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

type InvoiceRow = {
    id: string;
    invoice_number: string;
    doc_type_label: string;
    sunat_filing_status: string;
    grand_total: string;
    currency: string;
    issued_at: string | null;
    order_number: string | null;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    last_page: number;
};

type Props = {
    client: ClientSummary;
    invoices: Paginated<InvoiceRow>;
};

const FILING_LABELS: Record<string, string> = {
    accepted: 'Aceptado',
    accepted_obs: 'Aceptado c/obs',
    pending: 'Pendiente',
    rejected: 'Rechazado',
    error: 'Error',
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
        month: 'short',
        year: 'numeric',
    });
}

export default function AdminClientFacturasIndex({ client, invoices }: Props) {
    const clientLabel = formatClientFullName({
        name: client.name,
        lastname: client.lastname,
        email: client.email,
        document_number: client.document_number,
    });
    const base = `/panel/acceso-clientes/${client.id}/facturas`;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: 'Usuarios cliente', href: '/panel/acceso-clientes' },
        { title: clientLabel, href: base },
        { title: 'Facturas portal', href: base },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Facturas portal — ${clientLabel}`} />
            <div className="space-y-5 px-4 py-6 md:px-6 lg:px-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Facturas del portal
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Vista espejo de{' '}
                            <span className="font-medium text-foreground">
                                /cliente/facturas
                            </span>{' '}
                            — solo lectura.
                        </p>
                    </div>
                    <Link
                        href="/panel/acceso-clientes"
                        className="text-sm text-[#4A80B8] hover:underline"
                    >
                        ← Volver a clientes
                    </Link>
                </div>

                <NeuCardRaised className="rounded-2xl border border-[#4A80B8]/20 bg-[#4A80B8]/5 p-4">
                    <div className="flex items-start gap-3">
                        <Eye className="mt-0.5 size-5 shrink-0 text-[#4A80B8]" />
                        <div className="min-w-0 text-sm">
                            <p className="font-semibold text-[#4A80B8]">
                                Vista espejo — {clientLabel}
                            </p>
                            <p className="mt-1 text-muted-foreground">
                                {client.email}
                                {client.profile?.ruc
                                    ? ` · RUC ${client.profile.ruc}`
                                    : client.document_number
                                      ? ` · Doc. ${client.document_number}`
                                      : ''}
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <NeuCardRaised className="overflow-hidden rounded-2xl">
                    {invoices.data.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                            <Receipt className="mx-auto size-10 text-muted-foreground/50" />
                            <p className="mt-3 text-sm text-muted-foreground">
                                Este cliente no tiene comprobantes visibles en
                                su portal.
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Verifica vínculo por pedido, RUC o{' '}
                                <code className="font-mono">client_user_id</code>{' '}
                                al emitir.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 bg-black/2 text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-4 py-3">Comprobante</th>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Pedido</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.data.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b border-border/50 last:border-0"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium font-mono">
                                                    {row.invoice_number}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {row.doc_type_label}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {formatDate(row.issued_at)}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {row.order_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {FILING_LABELS[
                                                    row.sunat_filing_status
                                                ] ?? row.sunat_filing_status}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                {formatMoney(
                                                    row.grand_total,
                                                    row.currency,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`${base}/${row.id}`}
                                                    className="inline-flex items-center gap-1 text-[#4A80B8] hover:underline"
                                                >
                                                    <FileText className="size-3.5" />
                                                    Detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </NeuCardRaised>

                {invoices.last_page > 1 ? (
                    <nav className="flex flex-wrap gap-2">
                        {invoices.links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={`${link.label}-${i}`}
                                    href={link.url}
                                    className={`rounded-lg border px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'border-[#4A80B8]/40 bg-[#4A80B8]/10 font-medium'
                                            : 'border-border text-muted-foreground hover:bg-muted/40'
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
        </AppLayout>
    );
}
