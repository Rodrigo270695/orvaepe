import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    BadgeX,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Clock,
    FilePlus2,
    Search,
} from 'lucide-react';
import * as React from 'react';

import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';

import { panelSectionTitle } from '@/config/admin-panel';
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

const FILING_BADGE: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
    draft:        { label: 'Borrador',  className: 'bg-muted text-muted-foreground', icon: <Clock className="size-3" /> },
    pending:      { label: 'Pendiente', className: 'bg-yellow-500/10 text-yellow-600', icon: <Clock className="size-3" /> },
    accepted:     { label: 'Aceptado',  className: 'bg-[#4A9A72]/15 text-[#4A9A72]', icon: <BadgeCheck className="size-3" /> },
    accepted_obs: { label: 'Aceptado c/obs', className: 'bg-[#4A9A72]/10 text-[#4A9A72]', icon: <BadgeCheck className="size-3" /> },
    rejected:     { label: 'Rechazado', className: 'bg-red-500/10 text-red-500', icon: <BadgeX className="size-3" /> },
    error:        { label: 'Error',     className: 'bg-orange-500/10 text-orange-500', icon: <CircleAlert className="size-3" /> },
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

const labelClass = 'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';
const inputClass = 'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2 pl-1 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';

export default function ComprobantesIndex({ invoices, filters }: Props) {
    const section = 'ventas-facturas';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: 'Comprobantes electrónicos', href: '/panel/ventas-facturas' },
    ];

    const [q, setQ] = React.useState(filters?.q ?? '');
    const [type, setType] = React.useState(filters?.type ?? '');
    const [filing, setFiling] = React.useState(filters?.filing ?? '');

    function applyFilters(params: { q?: string; type?: string; filing?: string }) {
        router.get('/panel/ventas-facturas', params, { preserveState: true, replace: true });
    }

    function handleTypeChange(v: string) {
        const val = v === '__all__' ? '' : v;
        setType(val);
        applyFilters({ q, type: val, filing });
    }

    function handleFilingChange(v: string) {
        const val = v === '__all__' ? '' : v;
        setFiling(val);
        applyFilters({ q, type, filing: val });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comprobantes electrónicos" />
            <div className="px-4 py-6 md:px-6 lg:px-7">

                {/* Header */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Comprobantes electrónicos (CPE)</h1>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                            Facturas, boletas y notas emitidas a SUNAT
                        </p>
                    </div>
                    <Link
                        href="/panel/ventas-facturas/crear"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#4A80B8]/10 px-4 py-2 text-sm font-medium text-[#4A80B8] transition hover:bg-[#4A80B8]/20"
                    >
                        <FilePlus2 className="size-4" />
                        Emitir nuevo CPE
                    </Link>
                </div>

                {/* Filtros — auto-apply en selects, Enter en búsqueda */}
                <div className="mb-6 flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px] space-y-1">
                        <label className={labelClass}>Buscar</label>
                        <form onSubmit={(e) => { e.preventDefault(); applyFilters({ q, type, filing }); }}>
                            <div className="relative">
                                <Search className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Número de comprobante…"
                                    className={`${inputClass} pl-6`}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="space-y-1 min-w-[160px]">
                        <label className={labelClass}>Tipo</label>
                        <AdminUnderlineSelect
                            value={type || '__all__'}
                            options={[
                                { value: '__all__', label: 'Todos' },
                                ...Object.entries(DOC_LABELS).map(([v, l]) => ({ value: v, label: l })),
                            ]}
                            onValueChange={handleTypeChange}
                        />
                    </div>

                    <div className="space-y-1 min-w-[160px]">
                        <label className={labelClass}>Estado SUNAT</label>
                        <AdminUnderlineSelect
                            value={filing || '__all__'}
                            options={[
                                { value: '__all__', label: 'Todos' },
                                ...Object.entries(FILING_BADGE).map(([v, { label }]) => ({ value: v, label })),
                            ]}
                            onValueChange={handleFilingChange}
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="neumorph-inset rounded-xl border border-border/60 overflow-hidden">
                    {invoices.data.length === 0 ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            No hay comprobantes.{' '}
                            <Link href="/panel/ventas-facturas/crear" className="text-[#4A80B8] underline">
                                Emite el primero
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-[13px]">
                            <thead className="border-b border-border/60">
                                <tr className="text-left">
                                    <th className={`${labelClass} px-4 py-3`}>Número</th>
                                    <th className={`${labelClass} px-4 py-3`}>Tipo</th>
                                    <th className={`${labelClass} px-4 py-3 hidden md:table-cell`}>Cliente</th>
                                    <th className={`${labelClass} px-4 py-3 hidden lg:table-cell`}>Orden</th>
                                    <th className={`${labelClass} px-4 py-3`}>Total</th>
                                    <th className={`${labelClass} px-4 py-3`}>Estado SUNAT</th>
                                    <th className={`${labelClass} px-4 py-3 hidden sm:table-cell`}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.data.map((inv) => {
                                    const badge = FILING_BADGE[inv.sunat_filing_status] ?? FILING_BADGE.draft;
                                    return (
                                        <tr
                                            key={inv.id}
                                            className="border-b border-border/30 last:border-0 hover:bg-(--o-amber)/3 transition-colors cursor-pointer"
                                            onClick={() => router.visit(`/panel/ventas-facturas/${inv.id}`)}
                                        >
                                            <td className="px-4 py-3 font-mono font-semibold text-[#4A80B8]">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {DOC_LABELS[inv.sunat_document_type_code] ?? inv.sunat_document_type_code}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell max-w-[180px] truncate">
                                                {inv.buyer_snapshot?.razon_social ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground font-mono text-[11px]">
                                                {inv.order?.order_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {inv.currency} {Number(inv.grand_total).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                                                    {badge.icon}
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-[11px]">
                                                {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('es-PE') : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Paginación */}
                {invoices.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between gap-2 text-[12px] text-muted-foreground">
                        <span>{invoices.from}–{invoices.to} de {invoices.total}</span>
                        <div className="flex gap-1">
                            {invoices.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`rounded px-2 py-1 ${link.active ? 'bg-[#4A80B8]/15 text-[#4A80B8] font-medium' : 'hover:bg-muted'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i} className="rounded px-2 py-1 opacity-40" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
