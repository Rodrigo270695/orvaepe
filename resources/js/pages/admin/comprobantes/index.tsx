import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    BadgeX,
    CircleAlert,
    Clock,
    Eye,
    FilePlus2,
    LayoutGrid,
    ReceiptText,
    Search,
    Trash2,
} from 'lucide-react';
import * as React from 'react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const DOC_LABELS: Record<string, string> = {
    '01': 'Factura',
    '03': 'Boleta',
    '07': 'Nota Crédito',
    '08': 'Nota Débito',
    '09': 'Guía Remisión',
};

const FILING_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    draft:        { label: 'Borrador',       className: 'bg-muted text-muted-foreground',     icon: <Clock className="size-3" /> },
    pending:      { label: 'Pendiente',      className: 'bg-yellow-500/10 text-yellow-600',   icon: <Clock className="size-3" /> },
    accepted:     { label: 'Aceptado',       className: 'bg-[#4A9A72]/15 text-[#4A9A72]',    icon: <BadgeCheck className="size-3" /> },
    accepted_obs: { label: 'Aceptado c/obs', className: 'bg-[#4A9A72]/10 text-[#4A9A72]',    icon: <BadgeCheck className="size-3" /> },
    rejected:     { label: 'Rechazado',      className: 'bg-red-500/10 text-red-500',         icon: <BadgeX className="size-3" /> },
    error:        { label: 'Error',          className: 'bg-orange-500/10 text-orange-500',   icon: <CircleAlert className="size-3" /> },
};

type Invoice = {
    id: string;
    invoice_number: string;
    sunat_document_type_code: string;
    sunat_filing_status: string;
    grand_total: string;
    currency: string;
    issued_at: string | null;
    buyer_snapshot: { razon_social?: string } | null;
    order?: { order_number: string } | null;
};

type Paginator = {
    data: Invoice[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    invoices: Paginator;
    filters?: { q?: string; type?: string; filing?: string };
};

const inputClass = 'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2 pl-6 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';

function formatDate(iso: string | null): string {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ComprobantesIndex({ invoices, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel',                   href: dashboard() },
        { title: 'Comprobantes electrónicos', href: '/panel/ventas-facturas' },
    ];

    const page = usePage();
    const [q, setQ] = React.useState(filters?.q ?? '');

    const rows = invoices.data;
    const total      = invoices.total;
    const accepted   = rows.filter((r) => r.sunat_filing_status === 'accepted' || r.sunat_filing_status === 'accepted_obs').length;
    const pending    = rows.filter((r) => r.sunat_filing_status === 'pending' || r.sunat_filing_status === 'draft').length;
    const errors     = rows.filter((r) => r.sunat_filing_status === 'error' || r.sunat_filing_status === 'rejected').length;

    function navigate(params: Record<string, string>) {
        const currentUrl = new URL(page.url, window.location.origin);

        Object.entries(params).forEach(([k, v]) => {
            if (v) {
                currentUrl.searchParams.set(k, v);
            } else {
                currentUrl.searchParams.delete(k);
            }
        });

        currentUrl.searchParams.set('page', '1');
        router.get(currentUrl.pathname + currentUrl.search, {}, { preserveScroll: true, preserveState: true, replace: true });
    }

    const currentType   = new URL(page.url, window.location.origin).searchParams.get('type')   ?? '';
    const currentFiling = new URL(page.url, window.location.origin).searchParams.get('filing') ?? '';

    const columns: AdminCrudTableColumn<Invoice>[] = [
        {
            header: 'Número',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span className="font-mono text-sm font-semibold text-[#4A80B8]">{r.invoice_number}</span>
            ),
        },
        {
            header: 'Tipo',
            cellClassName: 'px-3 py-2 align-middle text-sm text-muted-foreground',
            render: (r) => DOC_LABELS[r.sunat_document_type_code] ?? r.sunat_document_type_code,
        },
        {
            header: 'Cliente',
            cellClassName: 'px-3 py-2 align-middle max-w-[180px]',
            render: (r) => (
                <span className="block truncate text-sm">
                    {r.buyer_snapshot?.razon_social ?? '—'}
                </span>
            ),
        },
        {
            header: 'Orden',
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs text-muted-foreground',
            render: (r) => r.order?.order_number ?? '—',
        },
        {
            header: 'Total',
            cellClassName: 'px-3 py-2 align-middle font-medium tabular-nums',
            render: (r) => `${r.currency} ${Number(r.grand_total).toFixed(2)}`,
        },
        {
            header: 'Estado SUNAT',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => {
                const badge = FILING_BADGE[r.sunat_filing_status] ?? FILING_BADGE.draft;

                return (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                        {badge.icon}
                        {badge.label}
                    </span>
                );
            },
        },
        {
            header: 'Fecha',
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDate(r.issued_at),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comprobantes electrónicos" />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <AdminCrudIndex<Invoice>
                    rows={rows}
                    rowKey={(r) => r.id}
                    columns={columns}
                    paginator={invoices}
                    emptyState="No hay comprobantes. Emite el primero desde «Emitir nuevo CPE»."
                    onRowClick={(r) => router.visit(`/panel/ventas-facturas/${r.id}`)}
                    rowClassName={() => 'cursor-pointer'}

                    renderToolbar={() => (
                        <NeuCardRaised className="rounded-xl p-4 md:p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="flex items-start gap-3">
                                    <ReceiptText className="mt-0.5 size-4 text-[#D28C3C]" />
                                    <div>
                                        <h1 className="text-sm font-bold">Comprobantes electrónicos (CPE)</h1>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            Facturas, boletas y notas emitidas a SUNAT.
                                        </p>
                                    </div>
                                </div>
                                <Link href="/panel/ventas-facturas/crear" className="inline-flex">
                                    <NeuButtonRaised type="button" className="cursor-pointer">
                                        <FilePlus2 className="size-4 text-[#4A80B8]" />
                                        Emitir nuevo CPE
                                    </NeuButtonRaised>
                                </Link>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                                    <ReceiptText className="size-3.5" />
                                    Total {total}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                                    <BadgeCheck className="size-3.5" />
                                    Aceptados {accepted}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/12 px-2.5 py-1 text-xs text-[#D28C3C]">
                                    <Clock className="size-3.5" />
                                    Pendientes {pending}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#C05050]/12 px-2.5 py-1 text-xs text-[#C05050]">
                                    <CircleAlert className="size-3.5" />
                                    Errores {errors}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                                    <LayoutGrid className="size-3.5" />
                                    En pantalla {rows.length}
                                </span>
                            </div>
                        </NeuCardRaised>
                    )}

                    renderAboveTable={() => (
                        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
                            {/* Búsqueda con Enter */}
                            <div className="w-full min-w-0 max-w-sm sm:w-auto space-y-1.5">
                                <AdminUnderlineLabel htmlFor="cpe_search">Buscar</AdminUnderlineLabel>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    navigate({ q, type: currentType, filing: currentFiling });
                                }}>
                                    <div className="relative">
                                        <Search className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="cpe_search"
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                            placeholder="Número de comprobante…"
                                            className={inputClass}
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Tipo — auto-apply */}
                            <div className="w-[min(100%,14rem)] shrink-0 space-y-1.5">
                                <AdminUnderlineLabel htmlFor="cpe_type">Tipo</AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id="cpe_type"
                                    name="cpe_type"
                                    value={currentType || '__all__'}
                                    options={[
                                        { value: '__all__', label: 'Todos' },
                                        ...Object.entries(DOC_LABELS).map(([v, l]) => ({ value: v, label: l })),
                                    ]}
                                    onValueChange={(v) => navigate({ q, type: v === '__all__' ? '' : v, filing: currentFiling })}
                                />
                            </div>

                            {/* Estado SUNAT — auto-apply */}
                            <div className="w-[min(100%,16rem)] shrink-0 space-y-1.5">
                                <AdminUnderlineLabel htmlFor="cpe_filing">Estado SUNAT</AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id="cpe_filing"
                                    name="cpe_filing"
                                    value={currentFiling || '__all__'}
                                    options={[
                                        { value: '__all__', label: 'Todos' },
                                        ...Object.entries(FILING_BADGE).map(([v, { label }]) => ({ value: v, label })),
                                    ]}
                                    onValueChange={(v) => navigate({ q, type: currentType, filing: v === '__all__' ? '' : v })}
                                />
                            </div>
                        </div>
                    )}

                    renderRowActions={({ row }) => (
                        <div className="flex items-center gap-1">
                            <Link
                                href={`/panel/ventas-facturas/${row.id}`}
                                className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
                                aria-label="Ver comprobante"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Eye className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                            </Link>
                            {['draft', 'error', 'rejected'].includes(row.sunat_filing_status) && (
                                <button
                                    type="button"
                                    aria-label="Eliminar comprobante"
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        if (confirm(`¿Eliminar ${row.invoice_number}?`)) {
                                            router.delete(`/panel/ventas-facturas/${row.id}`);
                                        }
                                    }}
                                    className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
                                >
                                    <Trash2 className="size-4 text-[#C05050]/60 transition-colors group-hover:text-[#C05050]" />
                                </button>
                            )}
                        </div>
                    )}
                />
            </div>
        </AppLayout>
    );
}
