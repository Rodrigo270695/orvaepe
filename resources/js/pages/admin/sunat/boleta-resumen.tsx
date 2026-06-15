import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Receipt,
    ServerCrash,
    TrendingUp,
    Zap,
} from 'lucide-react';
import * as React from 'react';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const labelClass = 'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';
const cardClass  = 'neumorph-inset rounded-2xl border border-border/60 p-4';

const FILING_BADGE: Record<string, { label: string; cls: string }> = {
    draft:        { label: 'Borrador',  cls: 'bg-muted text-muted-foreground' },
    pending:      { label: 'Pendiente', cls: 'bg-yellow-500/10 text-yellow-600' },
    accepted:     { label: 'Aceptado',  cls: 'bg-[#4A9A72]/15 text-[#4A9A72]' },
    accepted_obs: { label: 'Ac/obs',    cls: 'bg-[#4A9A72]/10 text-[#4A9A72]' },
    rejected:     { label: 'Rechazado', cls: 'bg-red-500/10 text-red-500' },
    error:        { label: 'Error',     cls: 'bg-orange-500/10 text-orange-500' },
};

type DailySummary = {
    day: string;
    total_docs: number;
    total_amount: string;
    total_igv: string;
    accepted_count: number;
    error_count: number;
    currency: string;
};

type MonthStats = {
    total: number;
    total_amount: string;
    accepted: number;
    errors: number;
} | null;

type Boleta = {
    id: string;
    invoice_number: string;
    sunat_filing_status: string;
    grand_total: string;
    currency: string;
    issued_at: string;
    buyer_snapshot: { razon_social?: string } | null;
};

type Props = {
    dailySummary: DailySummary[];
    monthStats: MonthStats;
    recentBoletas: Boleta[];
    month: string;
};

function prevMonth(month: string): string {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(month: string): string {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string): string {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
}

export default function BoletaResumen({ dailySummary, monthStats, recentBoletas, month }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel',           href: dashboard() },
        { title: 'Resumen boletas', href: '/panel/sunat-boleta-resumen' },
    ];

    function navigate(m: string) {
        router.get('/panel/sunat-boleta-resumen', { month: m }, { preserveState: true, replace: true });
    }

    const isCurrentMonth = month === new Date().toISOString().slice(0, 7);
    const acceptRate = monthStats?.total
        ? Math.round((Number(monthStats.accepted) / Number(monthStats.total)) * 100)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resumen boletas" />
            <div className="px-4 py-6 md:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-lg font-semibold">
                            <Receipt className="size-5 text-[#4A9A72]" />
                            Resumen de boletas
                        </h1>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                            Boletas de venta emitidas, agrupadas por día
                        </p>
                    </div>
                    <Link
                        href="/panel/ventas-facturas/crear"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#4A9A72]/10 px-4 py-2 text-sm font-medium text-[#4A9A72] transition hover:bg-[#4A9A72]/20"
                    >
                        <Zap className="size-4" />
                        Emitir boleta
                    </Link>
                </div>

                {/* Navegación de mes */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(prevMonth(month))}
                        className="cursor-pointer rounded-xl border border-border/60 p-2 transition hover:bg-muted"
                    >
                        <ChevronLeft className="size-4" />
                    </button>

                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-[#4A9A72]" />
                        <span className="text-sm font-semibold capitalize">{monthLabel(month)}</span>
                        {isCurrentMonth && (
                            <span className="rounded-full bg-[#4A9A72]/15 px-2 py-0.5 text-[10px] font-semibold text-[#4A9A72]">
                                Mes actual
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(nextMonth(month))}
                        disabled={isCurrentMonth}
                        className="cursor-pointer rounded-xl border border-border/60 p-2 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>

                {/* Stats del mes */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Total boletas',  value: monthStats?.total ?? 0,    color: '#4A80B8', icon: <Receipt className="size-4" /> },
                        { label: 'Aceptadas',      value: monthStats?.accepted ?? 0, color: '#4A9A72', icon: <BadgeCheck className="size-4" /> },
                        { label: 'Con error',      value: monthStats?.errors ?? 0,   color: '#C05050', icon: <ServerCrash className="size-4" /> },
                        { label: 'Tasa éxito',     value: `${acceptRate}%`,          color: '#D28C3C', icon: <TrendingUp className="size-4" /> },
                    ].map((s) => (
                        <div key={s.label} className={cardClass}>
                            <div className="flex items-center justify-between">
                                <span className={labelClass}>{s.label}</span>
                                <span style={{ color: s.color }}>{s.icon}</span>
                            </div>
                            <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: s.color }}>
                                {s.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">

                    {/* Tabla diaria */}
                    <div className="space-y-3">
                        <h2 className="flex items-center gap-2 text-[13px] font-semibold">
                            <span className="block h-4 w-1 rounded-full bg-[#4A9A72]" />
                            Resumen por día
                        </h2>

                        {dailySummary.length === 0 ? (
                            <div className="neumorph-inset rounded-2xl border border-border/60 py-12 text-center text-sm text-muted-foreground">
                                No hay boletas emitidas en {monthLabel(month)}.
                            </div>
                        ) : (
                            <div className="neumorph-inset overflow-hidden rounded-2xl border border-border/60">
                                <table className="w-full text-[13px]">
                                    <thead className="border-b border-border/60">
                                        <tr className="text-left">
                                            <th className={`${labelClass} px-4 py-3`}>Día</th>
                                            <th className={`${labelClass} px-4 py-3`}>Boletas</th>
                                            <th className={`${labelClass} hidden px-4 py-3 sm:table-cell`}>Aceptadas</th>
                                            <th className={`${labelClass} hidden px-4 py-3 sm:table-cell`}>Errores</th>
                                            <th className={`${labelClass} px-4 py-3`}>Total</th>
                                            <th className={`${labelClass} hidden px-4 py-3 md:table-cell`}>IGV</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailySummary.map((row) => (
                                            <tr
                                                key={row.day}
                                                className="border-b border-border/30 last:border-0 hover:bg-(--o-amber)/3 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {new Date(row.day + 'T12:00:00').toLocaleDateString('es-PE', {
                                                        weekday: 'short', day: 'numeric', month: 'short',
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums font-semibold text-[#4A80B8]">
                                                    {row.total_docs}
                                                </td>
                                                <td className="hidden px-4 py-3 sm:table-cell">
                                                    <span className="tabular-nums font-medium text-[#4A9A72]">
                                                        {row.accepted_count}
                                                    </span>
                                                </td>
                                                <td className="hidden px-4 py-3 sm:table-cell">
                                                    {row.error_count > 0 ? (
                                                        <span className="tabular-nums font-medium text-[#C05050]">
                                                            {row.error_count}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums font-semibold">
                                                    {row.currency} {Number(row.total_amount).toFixed(2)}
                                                </td>
                                                <td className="hidden px-4 py-3 tabular-nums text-muted-foreground md:table-cell">
                                                    {row.currency} {Number(row.total_igv).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {dailySummary.length > 1 && (
                                        <tfoot className="border-t border-border/60 bg-(--o-amber)/3">
                                            <tr>
                                                <td className="px-4 py-2.5 text-[11px] font-semibold text-muted-foreground">Total del mes</td>
                                                <td className="px-4 py-2.5 tabular-nums font-bold text-[#4A80B8]">
                                                    {dailySummary.reduce((s, r) => s + r.total_docs, 0)}
                                                </td>
                                                <td className="hidden px-4 py-2.5 sm:table-cell tabular-nums font-bold text-[#4A9A72]">
                                                    {dailySummary.reduce((s, r) => s + r.accepted_count, 0)}
                                                </td>
                                                <td className="hidden px-4 py-2.5 sm:table-cell tabular-nums font-bold text-[#C05050]">
                                                    {dailySummary.reduce((s, r) => s + r.error_count, 0) || '—'}
                                                </td>
                                                <td className="px-4 py-2.5 tabular-nums font-bold">
                                                    {dailySummary[0]?.currency} {dailySummary.reduce((s, r) => s + Number(r.total_amount), 0).toFixed(2)}
                                                </td>
                                                <td className="hidden px-4 py-2.5 md:table-cell tabular-nums font-bold text-muted-foreground">
                                                    {dailySummary[0]?.currency} {dailySummary.reduce((s, r) => s + Number(r.total_igv), 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Lista de boletas recientes */}
                    <div className="space-y-3">
                        <h2 className="flex items-center gap-2 text-[13px] font-semibold">
                            <span className="block h-4 w-1 rounded-full bg-[#4A80B8]" />
                            Boletas del mes
                        </h2>

                        {recentBoletas.length === 0 ? (
                            <div className={`${cardClass} py-8 text-center text-sm text-muted-foreground`}>
                                Sin boletas.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentBoletas.map((b) => {
                                    const badge = FILING_BADGE[b.sunat_filing_status] ?? FILING_BADGE.draft;
                                    return (
                                        <div
                                            key={b.id}
                                            onClick={() => router.visit(`/panel/ventas-facturas/${b.id}`)}
                                            className="neumorph-inset flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 transition hover:border-[#4A80B8]/30"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-mono text-[12px] font-semibold text-[#4A80B8]">
                                                    {b.invoice_number}
                                                </p>
                                                <p className="truncate text-[11px] text-muted-foreground">
                                                    {b.buyer_snapshot?.razon_social ?? '—'}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1">
                                                <span className="tabular-nums text-[12px] font-semibold">
                                                    {b.currency} {Number(b.grand_total).toFixed(2)}
                                                </span>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
