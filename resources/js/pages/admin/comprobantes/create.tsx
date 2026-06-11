import { Head, router } from '@inertiajs/react';
import {
    FilePlus2,
    Loader2,
    Plus,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import * as React from 'react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const IGV_RATE = 0.18;

const DOC_TYPE_OPTIONS = [
    { value: '01', label: '01 – Factura (cliente con RUC)' },
    { value: '03', label: '03 – Boleta de Venta' },
    { value: '07', label: '07 – Nota de Crédito' },
    { value: '08', label: '08 – Nota de Débito' },
];

const BUYER_DOC_OPTIONS = [
    { value: '6', label: 'RUC (persona jurídica)' },
    { value: '1', label: 'DNI (persona natural)' },
    { value: '-', label: 'Sin documento' },
];

const IGV_CODE_OPTIONS = [
    { value: '10', label: '10 – Gravado (IGV 18%)' },
    { value: '20', label: '20 – Exonerado' },
    { value: '30', label: '30 – Inafecto' },
    { value: '40', label: '40 – Exportación' },
];

const CURRENCY_OPTIONS = [
    { value: 'PEN', label: 'PEN – Soles' },
    { value: 'USD', label: 'USD – Dólares' },
];

const labelClass = 'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';
const inputClass = 'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2.5 pl-1 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';
const inputIconClass = 'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2.5 pl-7 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';
const cardClass = 'neumorph-inset rounded-xl border border-border/60 p-4 md:p-5';

type Sequence = {
    id: string;
    document_type_code: string;
    serie: string;
    establishment_code: string;
    next_correlative: number;
};

type OrderOption = {
    id: string;
    order_number: string;
    grand_total: string;
    currency: string;
    placed_at: string;
    billing_snapshot: Record<string, unknown> | null;
};

type Props = {
    sequences: Sequence[];
    orders: OrderOption[];
    preOrderId?: string;
};

type Line = {
    description: string;
    quantity: string;
    unit_price: string;
    tax_rate: string;
    igv_code: string;
    product_code: string;
};

function emptyLine(): Line {
    return { description: '', quantity: '1', unit_price: '0.00', tax_rate: String(IGV_RATE), igv_code: '10', product_code: '' };
}

export default function ComprobantesCreate({ sequences, orders, preOrderId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: 'Comprobantes', href: '/panel/ventas-facturas' },
        { title: 'Emitir nuevo CPE', href: '/panel/ventas-facturas/crear' },
    ];

    // ── Estado del formulario ────────────────────────────────────────────
    const [sequenceId, setSequenceId] = React.useState(sequences[0]?.id ?? '');
    const [orderId, setOrderId] = React.useState(preOrderId ?? orders[0]?.id ?? '');
    const [issuedAt, setIssuedAt] = React.useState(new Date().toISOString().slice(0, 10));
    const [currency, setCurrency] = React.useState('PEN');
    const [paymentType] = React.useState('Contado');

    const [buyerTipoDoc, setBuyerTipoDoc] = React.useState('6');
    const [buyerNumDoc, setBuyerNumDoc] = React.useState('');
    const [buyerName, setBuyerName] = React.useState('');
    const [buyerAddress, setBuyerAddress] = React.useState('');

    const [lines, setLines] = React.useState<Line[]>([emptyLine()]);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [submitting, setSubmitting] = React.useState(false);

    // ── Sequence seleccionada ────────────────────────────────────────────
    const selectedSeq = sequences.find((s) => s.id === sequenceId);

    const sequenceOptions = sequences.map((s) => ({
        value: s.id,
        label: `${s.document_type_code === '01' ? 'Factura' : s.document_type_code === '03' ? 'Boleta' : 'Nota'} ${s.serie} · correlativo ${s.next_correlative}`,
    }));

    // ── Rellenar desde orden ─────────────────────────────────────────────
    React.useEffect(() => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;
        const snap = order.billing_snapshot as Record<string, string> | null;
        if (snap) {
            setBuyerName((snap.legal_name ?? snap.razon_social ?? '') as string);
            setBuyerNumDoc((snap.ruc ?? snap.document_number ?? '') as string);
            setBuyerAddress((snap.address ?? '') as string);
            setBuyerTipoDoc(snap.ruc ? '6' : '1');
        }
        setCurrency(order.currency);
    }, [orderId, orders]);

    // ── Totales ──────────────────────────────────────────────────────────
    const totals = React.useMemo(() => {
        let subtotal = 0;
        let taxes = 0;
        for (const l of lines) {
            const base = parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0');
            const igv  = l.igv_code === '10' ? base * parseFloat(l.tax_rate || '0') : 0;
            subtotal += base;
            taxes    += igv;
        }
        return {
            subtotal: subtotal.toFixed(2),
            taxes:    taxes.toFixed(2),
            total:    (subtotal + taxes).toFixed(2),
        };
    }, [lines]);

    // ── Líneas ───────────────────────────────────────────────────────────
    function setLine(i: number, field: keyof Line, value: string) {
        setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
    }

    function addLine() {
        setLines((prev) => [...prev, emptyLine()]);
    }

    function removeLine(i: number) {
        setLines((prev) => prev.filter((_, idx) => idx !== i));
    }

    // ── Enviar ───────────────────────────────────────────────────────────
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        router.post('/panel/ventas-facturas', {
            sequence_id: sequenceId,
            order_id:    orderId,
            issued_at:   issuedAt,
            currency,
            payment_type: paymentType,
            buyer: {
                tipo_doc:    buyerTipoDoc,
                num_doc:     buyerNumDoc,
                razon_social: buyerName,
                direccion:   buyerAddress,
            },
            lines: lines.map((l) => ({
                description: l.description,
                quantity:    l.quantity,
                unit_price:  l.unit_price,
                tax_rate:    l.tax_rate,
                igv_code:    l.igv_code,
                product_code: l.product_code,
            })),
        }, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Emitir nuevo CPE" />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-6">
                    <h1 className="text-lg font-semibold">Emitir comprobante electrónico</h1>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                        Se genera el XML UBL 2.1, se firma y se envía a SUNAT en tiempo real.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

                    {/* ── Secuencia y orden ── */}
                    <div className={cardClass}>
                        <h2 className="mb-4 text-sm font-semibold">Datos del comprobante</h2>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <AdminUnderlineLabel htmlFor="sequence_id" required>
                                    Serie y tipo de comprobante
                                </AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id="sequence_id"
                                    name="sequence_id"
                                    value={sequenceId}
                                    options={sequenceOptions}
                                    onValueChange={setSequenceId}
                                />
                                {selectedSeq && (
                                    <p className="text-[10px] text-muted-foreground">
                                        Próximo: <strong>{selectedSeq.serie}-{String(selectedSeq.next_correlative).padStart(8, '0')}</strong>
                                    </p>
                                )}
                                <InputError message={errors.sequence_id} />
                            </div>

                            <div className="space-y-2">
                                <AdminUnderlineLabel htmlFor="order_id" required>
                                    Orden de venta
                                </AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id="order_id"
                                    name="order_id"
                                    value={orderId}
                                    options={orders.map((o) => ({
                                        value: o.id,
                                        label: `${o.order_number} — ${o.currency} ${Number(o.grand_total).toFixed(2)}`,
                                    }))}
                                    onValueChange={setOrderId}
                                />
                                <InputError message={errors.order_id} />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="issued_at" className={labelClass}>
                                    Fecha de emisión <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="issued_at"
                                    type="date"
                                    value={issuedAt}
                                    onChange={(e) => setIssuedAt(e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={errors.issued_at} />
                            </div>

                            <div className="space-y-2">
                                <AdminUnderlineLabel htmlFor="currency" required>
                                    Moneda
                                </AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id="currency"
                                    name="currency"
                                    value={currency}
                                    options={CURRENCY_OPTIONS}
                                    onValueChange={setCurrency}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Datos del comprador ── */}
                    <div className={cardClass}>
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                            <User className="size-4 text-[#D28C3C]" />
                            Datos del comprador
                        </h2>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <AdminUnderlineLabel htmlFor="buyer_tipo_doc" required>
                                    Tipo de documento
                                </AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id="buyer_tipo_doc"
                                    name="buyer[tipo_doc]"
                                    value={buyerTipoDoc}
                                    options={BUYER_DOC_OPTIONS}
                                    onValueChange={setBuyerTipoDoc}
                                />
                                <InputError message={errors['buyer.tipo_doc']} />
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>
                                    N.º Documento ({buyerTipoDoc === '6' ? 'RUC 11 dígitos' : buyerTipoDoc === '1' ? 'DNI 8 dígitos' : 'opcional'})
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        value={buyerNumDoc}
                                        onChange={(e) => setBuyerNumDoc(e.target.value)}
                                        placeholder={buyerTipoDoc === '6' ? '20123456789' : '12345678'}
                                        className={inputIconClass}
                                    />
                                </div>
                                <InputError message={errors['buyer.num_doc']} />
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>
                                    Razón social / Nombre <span className="text-red-400">*</span>
                                </label>
                                <input
                                    value={buyerName}
                                    onChange={(e) => setBuyerName(e.target.value)}
                                    placeholder="EMPRESA SAC o Nombre Apellido"
                                    className={inputClass}
                                    required
                                />
                                <InputError message={errors['buyer.razon_social']} />
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Dirección (opcional)</label>
                                <input
                                    value={buyerAddress}
                                    onChange={(e) => setBuyerAddress(e.target.value)}
                                    placeholder="Av. ..."
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Líneas ── */}
                    <div className={cardClass}>
                        <h2 className="mb-4 text-sm font-semibold">Líneas del comprobante</h2>

                        <div className="space-y-3">
                            {/* Header de columnas */}
                            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 md:grid">
                                {['Descripción', 'Cantidad', 'P. Unit. (sin IGV)', 'Afectación', 'IGV %', ''].map((h, i) => (
                                    <span key={i} className={labelClass}>{h}</span>
                                ))}
                            </div>

                            {lines.map((line, i) => (
                                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg bg-(--o-amber)/3 p-3 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-center md:bg-transparent md:p-0">
                                    <input
                                        value={line.description}
                                        onChange={(e) => setLine(i, 'description', e.target.value)}
                                        placeholder="Descripción del servicio / producto"
                                        required
                                        className={inputClass}
                                    />
                                    <input
                                        type="number"
                                        min="0.0001"
                                        step="0.01"
                                        value={line.quantity}
                                        onChange={(e) => setLine(i, 'quantity', e.target.value)}
                                        className={inputClass}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={line.unit_price}
                                        onChange={(e) => setLine(i, 'unit_price', e.target.value)}
                                        className={inputClass}
                                        placeholder="0.00"
                                    />
                                    <select
                                        value={line.igv_code}
                                        onChange={(e) => setLine(i, 'igv_code', e.target.value)}
                                        className={`${inputClass} cursor-pointer`}
                                    >
                                        {IGV_CODE_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={line.tax_rate}
                                        onChange={(e) => setLine(i, 'tax_rate', e.target.value)}
                                        className={inputClass}
                                        disabled={line.igv_code !== '10'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeLine(i)}
                                        disabled={lines.length === 1}
                                        className="justify-self-end rounded p-1.5 text-[#C05050]/70 hover:text-[#C05050] disabled:opacity-30"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addLine}
                                className="flex items-center gap-1.5 text-[13px] text-[#4A9A72] hover:text-[#4A9A72]/80 transition"
                            >
                                <Plus className="size-4" />
                                Añadir línea
                            </button>
                        </div>

                        {/* Totales */}
                        <div className="mt-5 flex justify-end">
                            <div className="w-64 space-y-1.5 text-[13px]">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal (sin IGV)</span>
                                    <span>{currency} {totals.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>IGV (18%)</span>
                                    <span>{currency} {totals.taxes}</span>
                                </div>
                                <div className="flex justify-between border-t border-border/60 pt-1.5 font-semibold">
                                    <span>Total a pagar</span>
                                    <span className="text-[#4A9A72]">{currency} {totals.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Aviso ── */}
                    <div className="rounded-xl border border-[#4A80B8]/20 bg-[#4A80B8]/5 p-4 text-[12px] text-muted-foreground">
                        <strong className="text-[#4A80B8]">Envío a SUNAT en tiempo real.</strong>{' '}
                        Al hacer clic en "Emitir", se generará el XML UBL 2.1, se firmará con tu certificado digital
                        y se enviará al servicio SOAP de SUNAT. El resultado aparecerá en el detalle del comprobante.
                    </div>

                    {/* Errores globales */}
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-xl border border-red-400/30 bg-red-400/5 p-3 text-[12px] text-red-500">
                            Corrige los errores antes de emitir.
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex items-center gap-4 pb-8">
                        <button
                            type="submit"
                            disabled={submitting || sequences.length === 0}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#4A80B8]/15 px-5 py-2.5 text-sm font-medium text-[#4A80B8] transition hover:bg-[#4A80B8]/25 disabled:opacity-50"
                        >
                            {submitting ? (
                                <><Loader2 className="size-4 animate-spin" />Emitiendo a SUNAT…</>
                            ) : (
                                <><FilePlus2 className="size-4" />Emitir comprobante</>
                            )}
                        </button>
                        {sequences.length === 0 && (
                            <p className="text-[12px] text-orange-500">
                                Configura una secuencia en Emisión → Config. emisor antes de emitir.
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
