import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    BadgeX,
    CircleAlert,
    Clock,
    Download,
    FilePlus2,
    RefreshCcw,
    ReceiptText,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const DOC_LABELS: Record<string, string> = {
    '01': 'Factura',
    '03': 'Boleta de Venta',
    '07': 'Nota de Crédito',
    '08': 'Nota de Débito',
    '09': 'Guía de Remisión',
};

const FILING_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    draft:        { label: 'Borrador',         className: 'bg-muted text-muted-foreground',     icon: <Clock className="size-4" /> },
    pending:      { label: 'Pendiente',        className: 'bg-yellow-500/10 text-yellow-600',   icon: <Clock className="size-4" /> },
    accepted:     { label: 'Aceptado ✓',       className: 'bg-[#4A9A72]/15 text-[#4A9A72]',    icon: <BadgeCheck className="size-4" /> },
    accepted_obs: { label: 'Aceptado c/obs',   className: 'bg-[#4A9A72]/10 text-[#4A9A72]',    icon: <BadgeCheck className="size-4" /> },
    rejected:     { label: 'Rechazado',        className: 'bg-red-500/10 text-red-500',         icon: <BadgeX className="size-4" /> },
    error:        { label: 'Error técnico',    className: 'bg-orange-500/10 text-orange-500',   icon: <CircleAlert className="size-4" /> },
};

type InvoiceLine = {
    id: string;
    description: string;
    quantity: string;
    unit_price: string;
    tax_rate: string;
    line_total: string;
    igv_affectation_code: string | null;
};

type Log = {
    id: string;
    attempt: number;
    channel: string;
    response_code: string | null;
    response_message: string | null;
    success: boolean;
    created_at: string;
};

type Invoice = {
    id: string;
    invoice_number: string;
    sunat_document_type_code: string;
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
    buyer_snapshot: { tipo_doc?: string; num_doc?: string; razon_social?: string; direccion?: string } | null;
    lines: InvoiceLine[];
    order: { order_number: string; id: string } | null;
    submission_logs: Log[];
};

type Props = { invoice: Invoice };

const labelClass = 'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';
const valueClass = 'text-[13px] font-medium text-foreground';
const cardClass  = 'neumorph-inset rounded-xl border border-border/60 p-4 md:p-5';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="space-y-0.5">
            <p className={labelClass}>{label}</p>
            <p className={valueClass}>{value ?? '—'}</p>
        </div>
    );
}

export default function ComprobantesShow({ invoice }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: 'Comprobantes', href: '/panel/ventas-facturas' },
        { title: invoice.invoice_number, href: `/panel/ventas-facturas/${invoice.id}` },
    ];

    const badge = FILING_BADGE[invoice.sunat_filing_status] ?? FILING_BADGE.draft;
    const canRetry = !['accepted', 'accepted_obs'].includes(invoice.sunat_filing_status);

    function handleRetry() {
        router.post(`/panel/ventas-facturas/${invoice.id}/reintentar`, {}, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`CPE ${invoice.invoice_number}`} />
            <div className="px-4 py-6 md:px-6 lg:px-7 max-w-4xl">

                {/* Header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-3">
                            <ReceiptText className="size-5 text-[#D28C3C]" />
                            <h1 className="font-mono text-lg font-bold">{invoice.invoice_number}</h1>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${badge.className}`}>
                                {badge.icon}
                                {badge.label}
                            </span>
                        </div>
                        <p className="mt-1 text-[12px] text-muted-foreground">
                            {DOC_LABELS[invoice.sunat_document_type_code] ?? invoice.sunat_document_type_code}
                            {invoice.issued_at
                                ? ' · Emitida el ' + new Date(invoice.issued_at).toLocaleDateString('es-PE')
                                : ''}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {canRetry && (
                            <button
                                onClick={handleRetry}
                                className="inline-flex items-center gap-2 rounded-xl bg-orange-500/10 px-3 py-2 text-[13px] text-orange-500 hover:bg-orange-500/20 transition"
                            >
                                <RefreshCcw className="size-4" />
                                Reintentar envío
                            </button>
                        )}
                        <Link
                            href="/panel/ventas-facturas/crear"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#4A80B8]/10 px-3 py-2 text-[13px] text-[#4A80B8] hover:bg-[#4A80B8]/20 transition"
                        >
                            <FilePlus2 className="size-4" />
                            Nuevo CPE
                        </Link>
                    </div>
                </div>

                {/* Respuesta SUNAT */}
                {invoice.sunat_response_description && (
                    <div className={`mb-6 flex gap-3 rounded-xl border p-4 text-[13px] ${
                        invoice.sunat_filing_status === 'accepted' || invoice.sunat_filing_status === 'accepted_obs'
                            ? 'border-[#4A9A72]/30 bg-[#4A9A72]/5 text-[#4A9A72]'
                            : 'border-red-400/30 bg-red-400/5 text-red-500'
                    }`}>
                        <span className="font-mono font-bold">{invoice.sunat_response_code}:</span>
                        <span>{invoice.sunat_response_description}</span>
                    </div>
                )}

                {/* Grid de datos */}
                <div className="space-y-5">

                    {/* Resumen */}
                    <div className={cardClass}>
                        <h2 className="mb-4 text-sm font-semibold">Resumen del comprobante</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            <Field label="Número" value={<span className="font-mono">{invoice.invoice_number}</span>} />
                            <Field label="Moneda" value={invoice.currency} />
                            <Field label="Subtotal" value={`${invoice.currency} ${Number(invoice.subtotal).toFixed(2)}`} />
                            <Field label="IGV" value={`${invoice.currency} ${Number(invoice.tax_total).toFixed(2)}`} />
                            <Field
                                label="Total"
                                value={
                                    <span className="text-base font-bold text-[#4A9A72]">
                                        {invoice.currency} {Number(invoice.grand_total).toFixed(2)}
                                    </span>
                                }
                            />
                            {invoice.order && (
                                <Field
                                    label="Orden"
                                    value={
                                        <Link
                                            href={`/panel/ventas-ordenes/${invoice.order.id}`}
                                            className="text-[#4A80B8] hover:underline"
                                        >
                                            {invoice.order.order_number}
                                        </Link>
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* Comprador */}
                    {invoice.buyer_snapshot && (
                        <div className={cardClass}>
                            <h2 className="mb-4 text-sm font-semibold">Comprador</h2>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                <Field
                                    label="Tipo / Documento"
                                    value={`${invoice.buyer_snapshot.tipo_doc === '6' ? 'RUC' : invoice.buyer_snapshot.tipo_doc === '1' ? 'DNI' : '—'} ${invoice.buyer_snapshot.num_doc ?? ''}`}
                                />
                                <Field label="Razón social" value={invoice.buyer_snapshot.razon_social} />
                                {invoice.buyer_snapshot.direccion && (
                                    <Field label="Dirección" value={invoice.buyer_snapshot.direccion} />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Líneas */}
                    <div className={cardClass}>
                        <h2 className="mb-4 text-sm font-semibold">Líneas</h2>
                        <table className="w-full text-[13px]">
                            <thead className="border-b border-border/60">
                                <tr>
                                    <th className={`${labelClass} py-2 text-left`}>Descripción</th>
                                    <th className={`${labelClass} py-2 text-right`}>Cant.</th>
                                    <th className={`${labelClass} py-2 text-right`}>P. Unit.</th>
                                    <th className={`${labelClass} py-2 text-right`}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lines.map((l) => (
                                    <tr key={l.id} className="border-b border-border/20 last:border-0">
                                        <td className="py-2 pr-3">{l.description}</td>
                                        <td className="py-2 text-right text-muted-foreground">{Number(l.quantity).toFixed(2)}</td>
                                        <td className="py-2 text-right text-muted-foreground">{Number(l.unit_price).toFixed(2)}</td>
                                        <td className="py-2 text-right font-medium">{Number(l.line_total).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Archivos */}
                    {(invoice.xml_signed_path || invoice.cdr_path) && (
                        <div className={cardClass}>
                            <h2 className="mb-4 text-sm font-semibold">Archivos SUNAT</h2>
                            <div className="flex flex-wrap gap-3">
                                {invoice.xml_signed_path && (
                                    <a
                                        href={`/panel/ventas-facturas/${invoice.id}/xml`}
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#4A80B8]/10 px-3 py-2 text-[13px] text-[#4A80B8] hover:bg-[#4A80B8]/20 transition"
                                    >
                                        <Download className="size-4" />
                                        XML firmado
                                    </a>
                                )}
                                {invoice.cdr_path && (
                                    <a
                                        href={`/panel/ventas-facturas/${invoice.id}/cdr`}
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#4A9A72]/10 px-3 py-2 text-[13px] text-[#4A9A72] hover:bg-[#4A9A72]/20 transition"
                                    >
                                        <Download className="size-4" />
                                        CDR (respuesta SUNAT)
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Logs de envío */}
                    {invoice.submission_logs.length > 0 && (
                        <div className={cardClass}>
                            <h2 className="mb-4 text-sm font-semibold">Historial de envíos a SUNAT</h2>
                            <div className="space-y-2">
                                {invoice.submission_logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={`flex items-start gap-3 rounded-lg p-3 text-[12px] ${log.success ? 'bg-[#4A9A72]/5' : 'bg-red-500/5'}`}
                                    >
                                        {log.success
                                            ? <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#4A9A72]" />
                                            : <BadgeX className="mt-0.5 size-4 shrink-0 text-red-500" />}
                                        <div className="flex-1 min-w-0">
                                            <span className="font-mono font-semibold">
                                                Intento #{log.attempt} ·{' '}
                                                <span className={log.success ? 'text-[#4A9A72]' : 'text-red-500'}>
                                                    {log.success ? 'Aceptado' : 'Rechazado/Error'}
                                                </span>
                                            </span>
                                            <span className="ml-3 text-muted-foreground">
                                                código {log.response_code}: {log.response_message}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground shrink-0">
                                            {new Date(log.created_at).toLocaleString('es-PE')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
