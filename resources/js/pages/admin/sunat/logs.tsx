import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    BadgeX,
    ChevronRight,
    FileSearch,
    Hash,
    Search,
    ServerCrash,
    Wifi,
    Zap,
} from 'lucide-react';
import * as React from 'react';

import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const labelClass = 'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';
const inputClass = 'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2 pl-6 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';
const cardClass = 'neumorph-inset rounded-2xl border border-border/60 p-4';

const DOC_LABELS: Record<string, string> = {
    '01': 'Factura',
    '03': 'Boleta',
    '07': 'Nota Crédito',
    '08': 'Nota Débito',
};

type LogEntry = {
    id: string;
    invoice_id: string;
    attempt: number;
    channel: string;
    http_status: number | null;
    response_code: string | null;
    response_message: string | null;
    success: boolean;
    created_at: string;
    invoice: {
        id: string;
        invoice_number: string;
        sunat_document_type_code: string;
        sunat_filing_status: string;
        buyer_snapshot: { razon_social?: string } | null;
    } | null;
};

type Stats = {
    today_total: number;
    today_success: number;
    today_error: number;
    total_all: number;
};

type Paginator = {
    data: LogEntry[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    logs: Paginator;
    stats: Stats;
    filters?: { q?: string; success?: string; channel?: string };
};

export default function SunatLogs({ logs, stats, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel',      href: dashboard() },
        { title: 'Logs SUNAT', href: '/panel/sunat-logs' },
    ];

    const [q,       setQ]       = React.useState(filters?.q ?? '');
    const [success, setSuccess] = React.useState(filters?.success ?? '');
    const [channel, setChannel] = React.useState(filters?.channel ?? '');

    function applyFilters(e: React.FormEvent) {
        e.preventDefault();
        router.get('/panel/sunat-logs', { q, success, channel }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logs SUNAT" />
            <div className="px-4 py-6 md:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-lg font-semibold">
                            <FileSearch className="size-5 text-[#4A80B8]" />
                            Logs de envío SUNAT
                        </h1>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                            Historial de cada intento de emisión hacia SUNAT
                        </p>
                    </div>
                    <Link
                        href="/panel/ventas-facturas/crear"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#4A80B8]/10 px-4 py-2 text-sm font-medium text-[#4A80B8] transition hover:bg-[#4A80B8]/20"
                    >
                        <Zap className="size-4" />
                        Emitir CPE
                    </Link>
                </div>

                {/* Stats rápidas */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Hoy — total',   value: stats.today_total,   color: '#4A80B8', icon: <Hash className="size-4" /> },
                        { label: 'Hoy — exitosos',value: stats.today_success, color: '#4A9A72', icon: <BadgeCheck className="size-4" /> },
                        { label: 'Hoy — errores', value: stats.today_error,   color: '#C05050', icon: <ServerCrash className="size-4" /> },
                        { label: 'Total histórico',value: stats.total_all,    color: '#9B6EC8', icon: <Wifi className="size-4" /> },
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

                {/* Filtros */}
                <form onSubmit={applyFilters} className="mb-5 flex flex-wrap items-end gap-4">
                    <div className="min-w-[200px] flex-1 space-y-1">
                        <label className={labelClass}>Buscar comprobante</label>
                        <div className="relative">
                            <Search className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Ej. F001-00000001"
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div className="min-w-[150px] space-y-1">
                        <label className={labelClass}>Resultado</label>
                        <AdminUnderlineSelect
                            value={success || '__all__'}
                            options={[
                                { value: '__all__',  label: 'Todos' },
                                { value: '1',        label: 'Exitosos' },
                                { value: '0',        label: 'Con error' },
                            ]}
                            onValueChange={(v) => setSuccess(v === '__all__' ? '' : v)}
                        />
                    </div>
                    <div className="min-w-[150px] space-y-1">
                        <label className={labelClass}>Canal</label>
                        <AdminUnderlineSelect
                            value={channel || '__all__'}
                            options={[
                                { value: '__all__',  label: 'Todos' },
                                { value: 'apisunat', label: 'API SUNAT' },
                                { value: 'soap',     label: 'SOAP directo' },
                            ]}
                            onValueChange={(v) => setChannel(v === '__all__' ? '' : v)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="cursor-pointer rounded-xl bg-[#4A80B8]/10 px-4 py-2 text-sm text-[#4A80B8] transition hover:bg-[#4A80B8]/20"
                    >
                        Filtrar
                    </button>
                </form>

                {/* Tabla */}
                <div className="neumorph-inset overflow-hidden rounded-2xl border border-border/60">
                    {logs.data.length === 0 ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            No hay logs de envío registrados aún.
                        </div>
                    ) : (
                        <table className="w-full text-[13px]">
                            <thead className="border-b border-border/60">
                                <tr className="text-left">
                                    <th className={`${labelClass} px-4 py-3`}>Comprobante</th>
                                    <th className={`${labelClass} hidden px-4 py-3 md:table-cell`}>Cliente</th>
                                    <th className={`${labelClass} px-4 py-3`}>Canal</th>
                                    <th className={`${labelClass} hidden px-4 py-3 sm:table-cell`}>HTTP</th>
                                    <th className={`${labelClass} px-4 py-3`}>Resultado</th>
                                    <th className={`${labelClass} hidden px-4 py-3 lg:table-cell`}>Respuesta SUNAT</th>
                                    <th className={`${labelClass} hidden px-4 py-3 sm:table-cell`}>Intento</th>
                                    <th className={`${labelClass} px-4 py-3`}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="cursor-pointer border-b border-border/30 transition-colors last:border-0 hover:bg-(--o-amber)/3"
                                        onClick={() => log.invoice && router.visit(`/panel/ventas-facturas/${log.invoice.id}`)}
                                    >
                                        <td className="px-4 py-3">
                                            {log.invoice ? (
                                                <div>
                                                    <span className="font-mono font-semibold text-[#4A80B8]">
                                                        {log.invoice.invoice_number}
                                                    </span>
                                                    <span className="ml-2 text-[10px] text-muted-foreground">
                                                        {DOC_LABELS[log.invoice.sunat_document_type_code] ?? log.invoice.sunat_document_type_code}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="hidden max-w-[160px] truncate px-4 py-3 text-muted-foreground md:table-cell">
                                            {log.invoice?.buyer_snapshot?.razon_social ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${log.channel === 'apisunat' ? 'bg-[#4A9A72]/10 text-[#4A9A72]' : 'bg-[#4A80B8]/10 text-[#4A80B8]'}`}>
                                                {log.channel === 'apisunat' ? 'API SUNAT' : log.channel === 'soap' ? 'SOAP' : log.channel}
                                            </span>
                                        </td>
                                        <td className="hidden px-4 py-3 sm:table-cell">
                                            {log.http_status ? (
                                                <span className={`font-mono text-[12px] font-semibold ${log.http_status < 300 ? 'text-[#4A9A72]' : 'text-[#C05050]'}`}>
                                                    {log.http_status}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.success ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2 py-0.5 text-[10px] font-medium text-[#4A9A72]">
                                                    <BadgeCheck className="size-3" /> Aceptado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-500">
                                                    <BadgeX className="size-3" /> Error
                                                </span>
                                            )}
                                        </td>
                                        <td className="hidden max-w-[220px] truncate px-4 py-3 text-[11px] text-muted-foreground lg:table-cell">
                                            {log.response_code && (
                                                <span className="mr-1.5 font-mono font-medium text-foreground">{log.response_code}</span>
                                            )}
                                            {log.response_message ?? '—'}
                                        </td>
                                        <td className="hidden px-4 py-3 text-center text-[11px] text-muted-foreground sm:table-cell">
                                            #{log.attempt}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-muted-foreground">
                                            {new Date(log.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Paginación */}
                {logs.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between gap-2 text-[12px] text-muted-foreground">
                        <span>{logs.from}–{logs.to} de {logs.total} registros</span>
                        <div className="flex gap-1">
                            {logs.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`rounded px-2 py-1 ${link.active ? 'bg-[#4A80B8]/15 font-medium text-[#4A80B8]' : 'hover:bg-muted'}`}
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
