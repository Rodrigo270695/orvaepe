import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    BadgeX,
    Building2,
    CircleAlert,
    Clock,
    Download,
    ExternalLink,
    FilePlus2,
    FileText,
    Hash,
    PackageSearch,
    Printer,
    RefreshCcw,
    ReceiptText,
    Trash2,
    User,
} from 'lucide-react';

import AdminCrudDeleteModal from '@/components/admin/crud/AdminCrudDeleteModal';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ── Catálogos ─────────────────────────────────────────────────────────────────

const DOC_LABELS: Record<string, string> = {
    '01': 'Factura Electrónica',
    '03': 'Boleta de Venta',
    '07': 'Nota de Crédito',
    '08': 'Nota de Débito',
    '09': 'Guía de Remisión',
};

const DOC_TYPE_LABEL: Record<string, string> = {
    '1': 'DNI',
    '6': 'RUC',
    '4': 'Carnet extrajería',
    '7': 'Pasaporte',
    'A': 'Cédula diplomática',
};

const FILING_CONFIG: Record<string, {
    label: string;
    icon: React.ReactNode;
    headerBg: string;
    headerText: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
}> = {
    draft:        { label: 'Borrador',        icon: <Clock className="size-5"/>,      headerBg: 'bg-slate-100',         headerText: 'text-slate-600',    badgeBg: 'bg-slate-100',        badgeText: 'text-slate-600',    borderColor: 'border-slate-200' },
    pending:      { label: 'Pendiente',       icon: <Clock className="size-5"/>,      headerBg: 'bg-yellow-50',         headerText: 'text-yellow-700',   badgeBg: 'bg-yellow-100',       badgeText: 'text-yellow-700',   borderColor: 'border-yellow-200' },
    accepted:     { label: 'Aceptado ✓',      icon: <BadgeCheck className="size-5"/>, headerBg: 'bg-emerald-50',        headerText: 'text-emerald-700',  badgeBg: 'bg-emerald-100',      badgeText: 'text-emerald-700',  borderColor: 'border-emerald-200' },
    accepted_obs: { label: 'Aceptado c/obs',  icon: <BadgeCheck className="size-5"/>, headerBg: 'bg-emerald-50',        headerText: 'text-emerald-700',  badgeBg: 'bg-emerald-100',      badgeText: 'text-emerald-700',  borderColor: 'border-emerald-200' },
    rejected:     { label: 'Rechazado',       icon: <BadgeX className="size-5"/>,     headerBg: 'bg-red-50',            headerText: 'text-red-700',      badgeBg: 'bg-red-100',          badgeText: 'text-red-700',      borderColor: 'border-red-200' },
    error:        { label: 'Error técnico',   icon: <CircleAlert className="size-5"/>,headerBg: 'bg-orange-50',         headerText: 'text-orange-700',   badgeBg: 'bg-orange-100',       badgeText: 'text-orange-700',   borderColor: 'border-orange-200' },
};

// ── Tipos ─────────────────────────────────────────────────────────────────────

type InvoiceLine = {
    id: string;
    description: string;
    quantity: string;
    unit_measure_code: string | null;
    unit_price: string;
    tax_rate: string;
    line_total: string;
    igv_affectation_code: string | null;
};

type Log = {
    id: string;
    attempt: number;
    channel: string;
    http_status: number | null;
    response_code: string | null;
    response_message: string | null;
    success: boolean;
    created_at: string;
};

type Invoice = {
    id: string;
    invoice_number: string;
    sunat_document_type_code: string;
    sunat_serie: string;
    sunat_correlative: number;
    sunat_filing_status: string;
    sunat_response_code: string | null;
    sunat_response_description: string | null;
    grand_total: string;
    subtotal: string;
    tax_total: string;
    currency: string;
    issued_at: string | null;
    status: string;
    xml_signed_path: string | null;
    cdr_path: string | null;
    pdf_path: string | null;
    buyer_snapshot: { tipo_doc?: string; num_doc?: string; razon_social?: string; direccion?: string } | null;
    lines: InvoiceLine[];
    order: { order_number: string; id: string } | null;
    submission_logs: Log[];
};

type Props = { invoice: Invoice; company_ruc: string | null };

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Deriva la URL de A4 desde el ticket URL (mismo path, solo cambia el segmento).
 * La URL real incluye tokens únicos de APISUNAT, por eso no se puede construir manualmente.
 * Ejemplo ticket: https://app.apisunat.pe/pdf/ticket/8701/abc123/RUC-03-BE01-2
 * Ejemplo a4:     https://app.apisunat.pe/pdf/a4/8701/abc123/RUC-03-BE01-2
 */
function buildA4FromTicket(ticketUrl: string): string {
    return ticketUrl.replace('/pdf/ticket/', '/pdf/a4/');
}

function fmt(n: string | number, currency = 'PEN') {
    return `${currency} ${Number(n).toFixed(2)}`;
}

function fmtDate(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ComprobantesShow({ invoice, company_ruc }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel',        href: dashboard() },
        { title: 'Comprobantes', href: '/panel/ventas-facturas' },
        { title: invoice.invoice_number, href: `/panel/ventas-facturas/${invoice.id}` },
    ];

    const cfg      = FILING_CONFIG[invoice.sunat_filing_status] ?? FILING_CONFIG.draft;
    const isOk     = ['accepted', 'accepted_obs'].includes(invoice.sunat_filing_status);
    const canRetry = !isOk;
    const canDelete= ['draft', 'error', 'rejected'].includes(invoice.sunat_filing_status);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [refreshingPdf, setRefreshingPdf]     = React.useState(false);

    // La URL real del PDF la provee APISUNAT (incluye tokens únicos de organización)
    const hasPdf = Boolean(invoice.pdf_path);

    function handleRetry() {
        router.post(`/panel/ventas-facturas/${invoice.id}/reintentar`, {}, { preserveScroll: true });
    }

    function handleRefreshPdf() {
        setRefreshingPdf(true);
        router.post(`/panel/ventas-facturas/${invoice.id}/refresh-pdf`, {}, {
            preserveScroll: true,
            onFinish: () => setRefreshingPdf(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`CPE ${invoice.invoice_number}`} />

            <div className="min-h-screen bg-[#f0f2f5]">

                {/* ── Hero header ─────────────────────────────────────────── */}
                <div className={`${cfg.headerBg} border-b ${cfg.borderColor}`}>
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

                        {/* Breadcrumb back */}
                        <Link
                            href="/panel/ventas-facturas"
                            className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition"
                        >
                            <ArrowLeft className="size-3.5" />
                            Comprobantes
                        </Link>

                        <div className="flex flex-wrap items-start justify-between gap-4">
                            {/* Título */}
                            <div className="flex items-start gap-4">
                                <div className={`rounded-2xl p-3 ${cfg.badgeBg}`}>
                                    <ReceiptText className={`size-7 ${cfg.headerText}`} />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className={`font-mono text-2xl font-bold tracking-tight ${cfg.headerText}`}>
                                            {invoice.invoice_number}
                                        </h1>
                                        <span className={`inline-flex items-center gap-1.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText} px-3 py-1 text-[12px] font-semibold`}>
                                            {cfg.icon}
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[13px] text-muted-foreground">
                                        {DOC_LABELS[invoice.sunat_document_type_code] ?? invoice.sunat_document_type_code}
                                        {invoice.issued_at ? ` · Emitida el ${fmtDate(invoice.issued_at)}` : ''}
                                        {invoice.order && (
                                            <> · Orden{' '}
                                                <Link href={`/panel/ventas-ordenes/${invoice.order.id}`} className="text-[#4A80B8] hover:underline font-medium">
                                                    {invoice.order.order_number}
                                                </Link>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex flex-wrap items-center gap-2">
                                {canRetry && (
                                    <button
                                        onClick={handleRetry}
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-[13px] font-medium text-white shadow hover:bg-orange-600 transition"
                                    >
                                        <RefreshCcw className="size-4" />
                                        Reintentar envío
                                    </button>
                                )}
                                <Link
                                    href="/panel/ventas-facturas/crear"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#4A80B8] px-4 py-2 text-[13px] font-medium text-white shadow hover:bg-[#3a6fa8] transition"
                                >
                                    <FilePlus2 className="size-4" />
                                    Nuevo CPE
                                </Link>
                                {canDelete && (
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-[13px] font-medium text-red-600 shadow-sm hover:bg-red-50 transition"
                                    >
                                        <Trash2 className="size-4" />
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Respuesta SUNAT */}
                        {invoice.sunat_response_description && (
                            <div className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-[13px] font-medium ${cfg.borderColor} bg-white/60 ${cfg.headerText}`}>
                                {cfg.icon}
                                <span>
                                    {invoice.sunat_response_code && <span className="font-mono font-bold">{invoice.sunat_response_code}: </span>}
                                    {invoice.sunat_response_description}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Contenido principal ─────────────────────────────────── */}
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                        {/* ── Columna izquierda (2/3) ──────────────────────── */}
                        <div className="space-y-5 lg:col-span-2">

                            {/* Líneas del comprobante */}
                            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                                    <PackageSearch className="size-4 text-[#D28C3C]" />
                                    <h2 className="text-[14px] font-semibold">Productos / Servicios</h2>
                                    <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                                        {invoice.lines.length} {invoice.lines.length === 1 ? 'línea' : 'líneas'}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[13px]">
                                        <thead>
                                            <tr className="bg-gray-50/80">
                                                <th className="px-6 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">Descripción</th>
                                                <th className="px-3 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">Cant.</th>
                                                <th className="px-3 py-3 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">UM</th>
                                                <th className="px-3 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">P. Unit</th>
                                                <th className="px-6 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total c/IGV</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {invoice.lines.map((l) => (
                                                <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-3.5 font-medium text-gray-800">{l.description}</td>
                                                    <td className="px-3 py-3.5 text-right text-gray-500">{Number(l.quantity).toFixed(2)}</td>
                                                    <td className="px-3 py-3.5 text-center">
                                                        <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-600">
                                                            {l.unit_measure_code ?? 'ZZ'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3.5 text-right text-gray-500">{Number(l.unit_price).toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 text-right font-bold text-gray-800">{Number(l.line_total).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Totales inline */}
                                <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-1.5 text-[13px]">
                                            <div className="flex justify-between text-gray-500">
                                                <span>Subtotal (sin IGV)</span>
                                                <span>{fmt(invoice.subtotal, invoice.currency)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-500">
                                                <span>IGV (18%)</span>
                                                <span>{fmt(invoice.tax_total, invoice.currency)}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-1.5 text-[15px] font-bold text-gray-800">
                                                <span>Total</span>
                                                <span className="text-emerald-600">{fmt(invoice.grand_total, invoice.currency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Historial de envíos */}
                            {invoice.submission_logs.length > 0 && (
                                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                    <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                                        <Hash className="size-4 text-[#D28C3C]" />
                                        <h2 className="text-[14px] font-semibold">Historial de envíos a SUNAT</h2>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {invoice.submission_logs.map((log) => (
                                            <div key={log.id} className={`flex items-start gap-3 px-6 py-4 ${log.success ? 'bg-emerald-50/30' : 'bg-red-50/30'}`}>
                                                <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${log.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                                    {log.success
                                                        ? <BadgeCheck className="size-3.5 text-emerald-600" />
                                                        : <BadgeX className="size-3.5 text-red-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-baseline gap-2">
                                                        <span className="text-[13px] font-semibold text-gray-700">
                                                            Intento #{log.attempt}
                                                        </span>
                                                        <span className={`text-[11px] font-semibold ${log.success ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {log.success ? '· Aceptado' : '· Rechazado/Error'}
                                                        </span>
                                                        {log.http_status && (
                                                            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
                                                                HTTP {log.http_status}
                                                            </span>
                                                        )}
                                                        <span className="ml-auto text-[11px] text-gray-400 shrink-0">
                                                            {new Date(log.created_at).toLocaleString('es-PE')}
                                                        </span>
                                                    </div>
                                                    {log.response_message && (
                                                        <p className="mt-0.5 text-[12px] text-gray-500 wrap-break-word">
                                                            {log.response_code && <span className="font-mono font-medium">{log.response_code}: </span>}
                                                            {log.response_message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Columna derecha (1/3) ────────────────────────── */}
                        <div className="space-y-4">

                            {/* Resumen financiero */}
                            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                <div className="border-b border-gray-100 bg-linear-to-r from-[#4A80B8]/5 to-transparent px-5 py-4">
                                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total a pagar</p>
                                    <p className="mt-1 text-3xl font-bold text-gray-800">
                                        {fmt(invoice.grand_total, invoice.currency)}
                                    </p>
                                </div>
                                <div className="divide-y divide-gray-50 px-5 py-1">
                                    <SideField label="Número" value={<span className="font-mono text-[13px] font-semibold">{invoice.invoice_number}</span>} />
                                    <SideField label="Tipo" value={DOC_LABELS[invoice.sunat_document_type_code] ?? '—'} />
                                    <SideField label="Moneda" value={invoice.currency} />
                                    <SideField label="Fecha emisión" value={fmtDate(invoice.issued_at)} />
                                    {invoice.order && (
                                        <SideField
                                            label="Orden"
                                            value={
                                                <Link href={`/panel/ventas-ordenes/${invoice.order.id}`} className="text-[#4A80B8] hover:underline text-[13px]">
                                                    {invoice.order.order_number}
                                                </Link>
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Comprador */}
                            {invoice.buyer_snapshot && (
                                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
                                        {invoice.buyer_snapshot.tipo_doc === '6'
                                            ? <Building2 className="size-4 text-[#4A80B8]" />
                                            : <User className="size-4 text-[#4A80B8]" />}
                                        <h3 className="text-[13px] font-semibold text-gray-700">Comprador</h3>
                                    </div>
                                    <div className="divide-y divide-gray-50 px-5 py-1">
                                        <SideField
                                            label={DOC_TYPE_LABEL[invoice.buyer_snapshot.tipo_doc ?? ''] ?? 'Doc.'}
                                            value={<span className="font-mono font-semibold text-[13px]">{invoice.buyer_snapshot.num_doc}</span>}
                                        />
                                        <SideField label="Nombre / Razón Social" value={invoice.buyer_snapshot.razon_social} />
                                        {invoice.buyer_snapshot.direccion && invoice.buyer_snapshot.direccion !== '-' && (
                                            <SideField label="Dirección" value={invoice.buyer_snapshot.direccion} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Imprimir PDF */}
                            {isOk && (
                                hasPdf
                                    ? <PrintPdfButton ticketUrl={invoice.pdf_path!} />
                                    : (
                                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
                                                <Printer className="size-4 text-[#D28C3C]" />
                                                <h3 className="text-[13px] font-semibold text-gray-700">Imprimir / PDF</h3>
                                            </div>
                                            <div className="p-4 text-center">
                                                <p className="mb-3 text-[12px] text-gray-400">
                                                    URL del PDF no disponible. Consulta APISUNAT para obtenerla.
                                                </p>
                                                <button
                                                    onClick={handleRefreshPdf}
                                                    disabled={refreshingPdf}
                                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                                                >
                                                    <RefreshCcw className={`size-4 ${refreshingPdf ? 'animate-spin' : ''}`} />
                                                    {refreshingPdf ? 'Consultando...' : 'Obtener PDF desde APISUNAT'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                            )}

                            {/* Archivos SUNAT */}
                            {(invoice.xml_signed_path || invoice.cdr_path) && (
                                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
                                        <FileText className="size-4 text-[#4A9A72]" />
                                        <h3 className="text-[13px] font-semibold text-gray-700">Archivos SUNAT</h3>
                                    </div>
                                    <div className="space-y-2 p-4">
                                        {invoice.xml_signed_path && (
                                            <SunatFileRow
                                                label="XML firmado"
                                                viewUrl={invoice.xml_signed_path}
                                                downloadUrl={`/panel/ventas-facturas/${invoice.id}/download-xml`}
                                                colorClass="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                            />
                                        )}
                                        {invoice.cdr_path && (
                                            <SunatFileRow
                                                label="CDR (respuesta SUNAT)"
                                                viewUrl={invoice.cdr_path}
                                                downloadUrl={`/panel/ventas-facturas/${invoice.id}/download-cdr`}
                                                colorClass="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AdminCrudDeleteModal
                open={showDeleteModal}
                onOpenChange={setShowDeleteModal}
                title="Eliminar comprobante"
                description="Se eliminarán el comprobante, sus líneas y el historial de envíos."
                confirmLabel="Sí, eliminar"
                action={`/panel/ventas-facturas/${invoice.id}`}
                method="post"
                methodOverride="delete"
                entityLabel={invoice.invoice_number}
            />
        </AppLayout>
    );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function SideField({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-3 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 shrink-0 pt-0.5">{label}</span>
            <span className="text-right text-[13px] font-medium text-gray-700">{value ?? '—'}</span>
        </div>
    );
}

// ── Fila de archivo SUNAT con ver + descargar ────────────────────────────────

function SunatFileRow({
    label,
    viewUrl,
    downloadUrl,
    colorClass,
}: {
    label: string;
    viewUrl: string;
    downloadUrl: string;
    colorClass: string;
}) {
    return (
        <div className={`flex items-center rounded-xl border px-4 py-3 ${colorClass}`}>
            <Download className="mr-2 size-4 shrink-0" />
            <span className="flex-1 text-[13px] font-medium">{label}</span>
            <div className="flex items-center gap-1">
                {/* Ver en nueva pestaña */}
                <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver en nueva pestaña"
                    className="rounded-lg p-1.5 opacity-60 transition hover:opacity-100"
                >
                    <ExternalLink className="size-3.5" />
                </a>
                {/* Descargar vía proxy backend */}
                <a
                    href={downloadUrl}
                    title="Descargar archivo"
                    className="rounded-lg p-1.5 opacity-60 transition hover:opacity-100"
                >
                    <Download className="size-3.5" />
                </a>
            </div>
        </div>
    );
}

// ── Modal de selección de formato PDF ────────────────────────────────────────

const PDF_FORMATS = [
    { label: 'Ticket 80mm', sub: 'Ticketera térmica',  icon: '🖨️', accent: 'hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700', getUrl: (t: string) => t },
    { label: 'Formato A4',  sub: 'Impresora normal',   icon: '📄', accent: 'hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700',   getUrl: buildA4FromTicket },
];

function PrintPdfButton({ ticketUrl }: { ticketUrl: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#D28C3C] px-4 py-3 text-[14px] font-semibold text-white shadow-md transition hover:bg-[#b97630] active:scale-[0.98]"
            >
                <Printer className="size-4" />
                Imprimir / Descargar PDF
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-5 text-center">
                            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-amber-100">
                                <Printer className="size-6 text-amber-600" />
                            </div>
                            <h3 className="text-[16px] font-bold text-gray-800">Selecciona el formato</h3>
                            <p className="mt-1 text-[12px] text-gray-400">¿Cómo quieres imprimir o guardar el comprobante?</p>
                        </div>

                        <div className="space-y-3">
                            {PDF_FORMATS.map(({ label, sub, icon, accent, getUrl }) => (
                                <a
                                    key={label}
                                    href={getUrl(ticketUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpen(false)}
                                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 transition ${accent}`}
                                >
                                    <span className="text-3xl leading-none">{icon}</span>
                                    <div className="flex-1">
                                        <p className="text-[14px] font-bold text-gray-800">{label}</p>
                                        <p className="text-[12px] text-gray-400">{sub}</p>
                                    </div>
                                    <ExternalLink className="size-4 shrink-0 text-gray-300" />
                                </a>
                            ))}
                        </div>

                        <p className="mt-4 text-center text-[11px] text-gray-400">
                            Se abre en nueva pestaña · Ctrl+P para imprimir
                        </p>
                        <button
                            onClick={() => setOpen(false)}
                            className="mt-4 w-full cursor-pointer rounded-xl py-2 text-[13px] text-gray-400 transition hover:text-gray-600"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
