import { Head, router } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    FilePlus2,
    FileText,
    Hash,
    Loader2,
    Plus,
    Receipt,
    Trash2,
    User,
    Zap,
} from 'lucide-react';
import * as React from 'react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import { LineCodePicker, type CodeGroup } from '@/components/facturas/LineCodePicker';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const IGV_RATE = 0.18;

const BUYER_DOC_OPTIONS = [
    { value: '6', label: 'RUC (persona jurídica)' },
    { value: '1', label: 'DNI (persona natural)' },
    { value: '-', label: 'Sin documento' },
];

const IGV_GROUPS: CodeGroup[] = [
    {
        label: 'Operaciones gravadas',
        options: [
            { value: '10', label: 'Gravado — Operación Onerosa',       shortLabel: 'Gravado 18%',   color: 'blue'   },
            { value: '17', label: 'Gravado — IVAP (Arroz pilado)',      shortLabel: 'IVAP',          color: 'blue'   },
        ],
    },
    {
        label: 'Exoneradas e inafectas',
        options: [
            { value: '20', label: 'Exonerado — Operación Onerosa',        shortLabel: 'Exonerado',     color: 'yellow' },
            { value: '30', label: 'Inafecto — Operación Onerosa',         shortLabel: 'Inafecto',      color: 'gray'   },
            { value: '31', label: 'Inafecto — Retiro por bonificación',   shortLabel: 'Retiro bonif.', color: 'gray'   },
        ],
    },
    {
        label: 'Exportación y gratuita',
        options: [
            { value: '40', label: 'Exportación de bienes o servicios',       shortLabel: 'Exportación',   color: 'purple' },
            { value: '11', label: 'Gravado — Retiro por premio',             shortLabel: 'Retiro premio', color: 'orange' },
            { value: '21', label: 'Exonerado — Transferencia gratuita',      shortLabel: 'Exon. gratuita',color: 'orange' },
        ],
    },
];

const UNIT_GROUPS: CodeGroup[] = [
    {
        label: 'Servicios (intangibles)',
        options: [
            { value: 'ZZ',  label: 'Unidad de servicio (digital / intangible)', shortLabel: 'Servicio', color: 'blue'   },
            { value: 'E49', label: 'Trabajo / actividad de servicio',            shortLabel: 'Trabajo',  color: 'blue'   },
        ],
    },
    {
        label: 'Cantidad',
        options: [
            { value: 'NIU', label: 'Unidad (unidades físicas)',  shortLabel: 'Unidad', color: 'green' },
            { value: 'SET', label: 'Juego / conjunto de ítems',  shortLabel: 'Juego',  color: 'green' },
            { value: 'PAR', label: 'Par',                        shortLabel: 'Par',    color: 'green' },
            { value: 'C62', label: 'Uno (count)',                shortLabel: 'Count',  color: 'green' },
        ],
    },
    {
        label: 'Peso',
        options: [
            { value: 'KGM', label: 'Kilogramo', shortLabel: 'Kg', color: 'orange' },
            { value: 'GRM', label: 'Gramo',     shortLabel: 'g',  color: 'orange' },
            { value: 'LBR', label: 'Libra',     shortLabel: 'lb', color: 'orange' },
            { value: 'ONZ', label: 'Onza',      shortLabel: 'oz', color: 'orange' },
        ],
    },
    {
        label: 'Longitud y volumen',
        options: [
            { value: 'MTR', label: 'Metro',   shortLabel: 'm',   color: 'purple' },
            { value: 'LTR', label: 'Litro',   shortLabel: 'L',   color: 'purple' },
            { value: 'GLL', label: 'Galón',   shortLabel: 'Gal', color: 'purple' },
            { value: 'FOT', label: 'Pie',     shortLabel: 'ft',  color: 'purple' },
            { value: 'INH', label: 'Pulgada', shortLabel: 'in',  color: 'purple' },
        ],
    },
    {
        label: 'Energía y tiempo',
        options: [
            { value: 'KWH', label: 'Kilovatio hora', shortLabel: 'kWh', color: 'yellow' },
            { value: 'HUR', label: 'Hora',           shortLabel: 'h',   color: 'yellow' },
            { value: 'DAY', label: 'Día',            shortLabel: 'día', color: 'yellow' },
            { value: 'MON', label: 'Mes',            shortLabel: 'mes', color: 'yellow' },
        ],
    },
];

const CURRENCY_OPTIONS = [
    { value: 'PEN', label: 'PEN – Soles' },
    { value: 'USD', label: 'USD – Dólares' },
];

const labelClass =
    'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';
const inputClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2.5 pl-1 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';
const inputIconClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2.5 pl-7 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';
const cardClass = 'neumorph-inset rounded-2xl border border-border/60 p-5';

const DOC_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    '01': { label: 'Factura',        color: '#4A80B8' },
    '03': { label: 'Boleta',         color: '#4A9A72' },
    '07': { label: 'Nota de Crédito',color: '#D28C3C' },
    '08': { label: 'Nota de Débito', color: '#9B6EC8' },
};

type Sequence = {
    id: string;
    document_type_code: string;
    serie: string;
    establishment_code: string;
    next_correlative: number;
};

type OrderLineSku = {
    igv_applies: boolean;
    tax_included: boolean;
};

type OrderLine = {
    id: string;
    product_name_snapshot: string;
    sku_name_snapshot: string | null;
    quantity: number;
    unit_price: string;
    tax_amount: string | null;
    line_total: string;
    sku: OrderLineSku | null;
};

type OrderOption = {
    id: string;
    order_number: string;
    grand_total: string;
    currency: string;
    placed_at: string;
    billing_snapshot: Record<string, unknown> | null;
    lines: OrderLine[];
};

type Props = {
    sequences: Sequence[];
    orders: OrderOption[];
    preOrderId?: string;
};

type Line = {
    description: string;
    quantity: string;
    unit_measure: string;
    unit_price: string;
    tax_rate: string;
    igv_code: string;
    product_code: string;
};

function emptyLine(): Line {
    return {
        description:  '',
        quantity:     '1',
        unit_measure: 'ZZ',
        unit_price:   '0.00',
        tax_rate:     String(IGV_RATE),
        igv_code:     '10',
        product_code: '',
    };
}

export default function ComprobantesCreate({ sequences, orders, preOrderId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel',          href: dashboard() },
        { title: 'Comprobantes',   href: '/panel/ventas-facturas' },
        { title: 'Emitir nuevo',   href: '/panel/ventas-facturas/crear' },
    ];

    // ── Estado ────────────────────────────────────────────────────────────
    const [sequenceId, setSequenceId] = React.useState(sequences[0]?.id ?? '');
    const [orderId,    setOrderId]    = React.useState(preOrderId ?? '');
    const [issuedAt,   setIssuedAt]   = React.useState(new Date().toISOString().slice(0, 10));
    const [currency,   setCurrency]   = React.useState('PEN');
    const [paymentType]               = React.useState('Contado');

    const [buyerTipoDoc,   setBuyerTipoDoc]   = React.useState('6');
    const [buyerNumDoc,    setBuyerNumDoc]     = React.useState('');
    const [buyerName,      setBuyerName]       = React.useState('');
    const [buyerAddress,   setBuyerAddress]    = React.useState('');
    const [lookupLoading,  setLookupLoading]   = React.useState(false);
    const [lookupError,    setLookupError]     = React.useState<string | null>(null);
    const [lookupOk,       setLookupOk]        = React.useState(false);

    const [lines,      setLines]      = React.useState<Line[]>([emptyLine()]);
    const [errors,     setErrors]     = React.useState<Record<string, string>>({});
    const [submitting, setSubmitting] = React.useState(false);

    // ── Sequence seleccionada ─────────────────────────────────────────────
    const selectedSeq   = sequences.find((s) => s.id === sequenceId);
    const docTypeInfo   = DOC_TYPE_LABELS[selectedSeq?.document_type_code ?? '01'] ?? DOC_TYPE_LABELS['01'];
    const nextNumber    = selectedSeq
        ? `${selectedSeq.serie}-${String(selectedSeq.next_correlative).padStart(8, '0')}`
        : '—';

    const sequenceOptions = sequences.map((s) => {
        const info = DOC_TYPE_LABELS[s.document_type_code];
        return {
            value: s.id,
            label: `${info?.label ?? 'Doc'} ${s.serie} · #${s.next_correlative}`,
        };
    });

    // ── Pre-rellenar desde orden ──────────────────────────────────────────
    React.useEffect(() => {
        if (!orderId) return;
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        const snap = order.billing_snapshot as Record<string, string> | null;
        if (snap) {
            setBuyerName(snap.legal_name ?? snap.razon_social ?? '');
            setBuyerNumDoc(snap.ruc ?? snap.document_number ?? '');
            setBuyerAddress(snap.address ?? '');
            setBuyerTipoDoc(snap.ruc ? '6' : '1');
        }
        setCurrency(order.currency);

        if (order.lines?.length) {
            const mapped: Line[] = order.lines.map((ol) => {
                const sku        = ol.sku;
                const igvApplies = sku != null ? sku.igv_applies : parseFloat(ol.tax_amount ?? '0') > 0;
                const taxIncluded= sku != null ? sku.tax_included : false;
                const rawPrice   = parseFloat(ol.unit_price);
                const unitNoIgv  = igvApplies && taxIncluded
                    ? (rawPrice / 1.18).toFixed(2)
                    : rawPrice.toFixed(2);
                return {
                    description:  [ol.product_name_snapshot, ol.sku_name_snapshot].filter(Boolean).join(' — '),
                    quantity:     String(ol.quantity || 1),
                    unit_measure: 'ZZ',
                    unit_price:   unitNoIgv,
                    tax_rate:     igvApplies ? String(IGV_RATE) : '0',
                    igv_code:     igvApplies ? '10' : '30',
                    product_code: '',
                };
            });
            setLines(mapped);
        }
    }, [orderId, orders]);

    // ── Validación longitud doc ───────────────────────────────────────────
    const expectedLen = buyerTipoDoc === '6' ? 11 : buyerTipoDoc === '1' ? 8 : null;

    // ── Lookup APIPERU ────────────────────────────────────────────────────
    const lookupDocument = React.useCallback(async (doc: string) => {
        const len = doc.length;
        if ((buyerTipoDoc === '6' && len !== 11) || (buyerTipoDoc === '1' && len !== 8)) return;
        setLookupLoading(true);
        setLookupError(null);
        setLookupOk(false);
        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const res = await fetch('/panel/ventas-facturas/lookup-doc', {
                method:  'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
                body:    JSON.stringify({ document: doc }),
            });
            const json = (await res.json().catch(() => ({}))) as { name?: string; address?: string; message?: string };
            if (!res.ok) { setLookupError(json.message ?? 'No se encontraron datos.'); return; }
            if (json.name)    setBuyerName(json.name);
            if (json.address) setBuyerAddress(json.address);
            setLookupOk(true);
        } catch { setLookupError('Error de conexión al consultar.'); }
        finally  { setLookupLoading(false); }
    }, [buyerTipoDoc]);

    function handleDocChange(raw: string) {
        const digits  = raw.replace(/\D/g, '');
        const maxLen  = buyerTipoDoc === '6' ? 11 : buyerTipoDoc === '1' ? 8 : 15;
        const trimmed = digits.slice(0, maxLen);
        setBuyerNumDoc(trimmed);
        setLookupError(null);
        setLookupOk(false);
        const target = buyerTipoDoc === '6' ? 11 : buyerTipoDoc === '1' ? 8 : null;
        if (target && trimmed.length === target) void lookupDocument(trimmed);
    }

    function handleTipoDocChange(v: string) {
        setBuyerTipoDoc(v);
        setBuyerNumDoc('');
        setLookupError(null);
        setLookupOk(false);
    }

    // ── Totales ───────────────────────────────────────────────────────────
    const totals = React.useMemo(() => {
        let subtotal = 0, taxes = 0;
        for (const l of lines) {
            const base = parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0');
            const igv  = l.igv_code === '10' ? base * parseFloat(l.tax_rate || '0') : 0;
            subtotal += base;
            taxes    += igv;
        }
        return { subtotal: subtotal.toFixed(2), taxes: taxes.toFixed(2), total: (subtotal + taxes).toFixed(2) };
    }, [lines]);

    // ── Líneas CRUD ───────────────────────────────────────────────────────
    function setLine(i: number, field: keyof Line, value: string) {
        setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
    }
    const addLine    = () => setLines((prev) => [...prev, emptyLine()]);
    const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

    // ── Submit ────────────────────────────────────────────────────────────
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        router.post('/panel/ventas-facturas', {
            sequence_id:  sequenceId,
            order_id:     orderId || null,
            issued_at:    issuedAt,
            currency,
            payment_type: paymentType,
            buyer: { tipo_doc: buyerTipoDoc, num_doc: buyerNumDoc, razon_social: buyerName, direccion: buyerAddress },
            lines: lines.map((l) => ({
                description: l.description, quantity: l.quantity, unit_measure: l.unit_measure,
                unit_price: l.unit_price, tax_rate: l.tax_rate, igv_code: l.igv_code, product_code: l.product_code,
            })),
        }, {
            onError:  (errs) => { setErrors(errs as Record<string, string>); setSubmitting(false); },
            onFinish: () => setSubmitting(false),
        });
    }

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Emitir nuevo CPE" />

            <div className="px-4 py-6 md:px-6 lg:px-8">

                {/* ── Cabecera de página ── */}
                <div className="mb-7 flex items-start justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-lg font-semibold">
                            <FilePlus2 className="size-5 text-[#4A80B8]" />
                            Emitir comprobante electrónico
                        </h1>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                            XML UBL 2.1 · firmado y enviado a SUNAT en tiempo real
                        </p>
                    </div>
                    <a
                        href="/panel/ventas-facturas"
                        className="flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-[12px] text-muted-foreground transition hover:text-foreground"
                    >
                        Ver todos
                        <ChevronRight className="size-3.5" />
                    </a>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">

                    {/* ═══════════════════════════════════════════════════════
                        IZQUIERDA — Secciones del formulario
                    ════════════════════════════════════════════════════════ */}
                    <div className="space-y-5">

                        {/* ── Card 1: Comprobante ── */}
                        <section className={cardClass}>
                            <div className="mb-5 flex items-center gap-2.5">
                                <span className="block h-5 w-1 rounded-full bg-[#4A80B8]" />
                                <FileText className="size-4 text-[#4A80B8]" />
                                <h2 className="text-[13px] font-semibold">Datos del comprobante</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <AdminUnderlineLabel htmlFor="sequence_id" required>
                                        Serie y tipo
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
                                            Próximo: <strong className="text-foreground">{nextNumber}</strong>
                                        </p>
                                    )}
                                    <InputError message={errors.sequence_id} />
                                </div>

                                <div className="space-y-2">
                                    <AdminUnderlineLabel htmlFor="order_id">
                                        Orden de venta
                                        <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
                                    </AdminUnderlineLabel>
                                    <AdminUnderlineSelect
                                        id="order_id"
                                        name="order_id"
                                        value={orderId || '__none__'}
                                        options={[
                                            { value: '__none__', label: '— Sin orden asociada —' },
                                            ...orders.map((o) => ({
                                                value: o.id,
                                                label: `${o.order_number} — ${o.currency} ${Number(o.grand_total).toFixed(2)}`,
                                            })),
                                        ]}
                                        onValueChange={(v) => {
                                            const real = v === '__none__' ? '' : v;
                                            setOrderId(real);
                                            if (!real) setLines([emptyLine()]);
                                        }}
                                    />
                                    {orderId && (
                                        <p className="text-[10px] text-[#4A9A72]">
                                            ✓ Líneas pre-cargadas desde la orden
                                        </p>
                                    )}
                                    <InputError message={errors.order_id} />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="issued_at" className={labelClass}>
                                        Fecha de emisión <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id="issued_at"
                                            type="date"
                                            value={issuedAt}
                                            onChange={(e) => setIssuedAt(e.target.value)}
                                            className={inputIconClass}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.issued_at} />
                                </div>

                                <div className="space-y-2">
                                    <AdminUnderlineLabel htmlFor="currency" required>
                                        Moneda
                                    </AdminUnderlineLabel>
                                    <div className="relative">
                                        <CircleDollarSign className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
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
                        </section>

                        {/* ── Card 2: Comprador ── */}
                        <section className={cardClass}>
                            <div className="mb-5 flex items-center gap-2.5">
                                <span className="block h-5 w-1 rounded-full bg-[#D28C3C]" />
                                <User className="size-4 text-[#D28C3C]" />
                                <h2 className="text-[13px] font-semibold">Datos del comprador</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <AdminUnderlineLabel htmlFor="buyer_tipo_doc" required>
                                        Tipo de documento
                                    </AdminUnderlineLabel>
                                    <AdminUnderlineSelect
                                        id="buyer_tipo_doc"
                                        name="buyer[tipo_doc]"
                                        value={buyerTipoDoc}
                                        options={BUYER_DOC_OPTIONS}
                                        onValueChange={handleTipoDocChange}
                                    />
                                    <InputError message={errors['buyer.tipo_doc']} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={labelClass}>
                                        N.º Documento
                                        <span className="ml-1 normal-case text-muted-foreground">
                                            ({buyerTipoDoc === '6' ? 'RUC – 11 dígitos' : buyerTipoDoc === '1' ? 'DNI – 8 dígitos' : 'opcional'})
                                        </span>
                                    </label>
                                    <div className="flex items-stretch gap-2">
                                        <div className="relative flex-1">
                                            {lookupLoading ? (
                                                <Loader2 className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-[#4A80B8]" />
                                            ) : (
                                                <Building2 className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                            )}
                                            <input
                                                value={buyerNumDoc}
                                                onChange={(e) => handleDocChange(e.target.value)}
                                                placeholder={buyerTipoDoc === '6' ? '20123456789' : buyerTipoDoc === '1' ? '12345678' : 'Número'}
                                                inputMode="numeric"
                                                maxLength={buyerTipoDoc === '6' ? 11 : buyerTipoDoc === '1' ? 8 : 15}
                                                className={`${inputIconClass} pr-14`}
                                                autoComplete="off"
                                            />
                                            {expectedLen && (
                                                <span className={`absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] font-semibold tabular-nums transition-colors ${buyerNumDoc.length === expectedLen ? 'text-[#4A9A72]' : 'text-muted-foreground'}`}>
                                                    {buyerNumDoc.length}/{expectedLen}
                                                </span>
                                            )}
                                        </div>
                                        {(buyerTipoDoc === '6' || buyerTipoDoc === '1') && (
                                            <button
                                                type="button"
                                                onClick={() => void lookupDocument(buyerNumDoc)}
                                                disabled={lookupLoading || (buyerTipoDoc === '6' && buyerNumDoc.length !== 11) || (buyerTipoDoc === '1' && buyerNumDoc.length !== 8)}
                                                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-[#4A80B8]/8 px-3 py-1.5 text-[11px] font-medium text-[#4A80B8] transition hover:bg-[#4A80B8]/15 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {lookupLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Building2 className="size-3.5" />}
                                                Consultar
                                            </button>
                                        )}
                                    </div>
                                    {lookupOk    && <p className="text-[11px] text-[#4A9A72]">✓ Datos obtenidos de SUNAT · Revisa y edita si es necesario.</p>}
                                    {lookupError && <p className="text-[11px] text-[#C05050]">{lookupError}</p>}
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
                                    <label className={labelClass}>Dirección <span className="font-normal text-muted-foreground">(opcional)</span></label>
                                    <input
                                        value={buyerAddress}
                                        onChange={(e) => setBuyerAddress(e.target.value)}
                                        placeholder="Av. ..."
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ── Card 3: Líneas ── */}
                        <section className={cardClass}>
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="block h-5 w-1 rounded-full bg-[#4A9A72]" />
                                    <Receipt className="size-4 text-[#4A9A72]" />
                                    <h2 className="text-[13px] font-semibold">Líneas del comprobante</h2>
                                </div>
                                <span className="rounded-full bg-[#4A9A72]/10 px-2 py-0.5 text-[11px] font-semibold text-[#4A9A72]">
                                    {lines.length} {lines.length === 1 ? 'ítem' : 'ítems'}
                                </span>
                            </div>

                            {/* Cabecera de columnas */}
                            <div className="mb-1 hidden grid-cols-[2.4fr_0.7fr_1fr_1fr_1.1fr_0.6fr_auto] gap-2 md:grid">
                                {['Descripción', 'Cant.', 'Unidad (Cat.03)', 'P. Unit. s/IGV', 'Afectación IGV', 'IGV %', ''].map((h, i) => (
                                    <span key={i} className={labelClass}>{h}</span>
                                ))}
                            </div>

                            <div className="space-y-2">
                                {lines.map((line, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-1 gap-2 rounded-xl border border-border/40 bg-(--o-amber)/2 p-3 transition hover:border-border/70 md:grid-cols-[2.4fr_0.7fr_1fr_1fr_1.1fr_0.6fr_auto] md:items-center md:rounded-none md:border-0 md:bg-transparent md:p-0 md:hover:bg-(--o-amber)/3 md:py-1"
                                    >
                                        <input
                                            value={line.description}
                                            onChange={(e) => setLine(i, 'description', e.target.value)}
                                            placeholder="Descripción del servicio / producto"
                                            required
                                            className={inputClass}
                                        />
                                        <input
                                            type="number"
                                            min="0.001"
                                            step="any"
                                            value={line.quantity}
                                            onChange={(e) => setLine(i, 'quantity', e.target.value)}
                                            className={`${inputClass} text-center`}
                                        />
                                        <div className="flex items-end pb-1">
                                            <LineCodePicker
                                                value={line.unit_measure}
                                                onChange={(v) => setLine(i, 'unit_measure', v)}
                                                groups={UNIT_GROUPS}
                                            />
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={line.unit_price}
                                            onChange={(e) => setLine(i, 'unit_price', e.target.value)}
                                            className={inputClass}
                                            placeholder="0.00"
                                        />
                                        <div className="flex items-end pb-1">
                                            <LineCodePicker
                                                value={line.igv_code}
                                                onChange={(v) => setLine(i, 'igv_code', v)}
                                                groups={IGV_GROUPS}
                                            />
                                        </div>
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
                                            className="justify-self-end rounded-lg p-1.5 text-[#C05050]/60 hover:bg-[#C05050]/10 hover:text-[#C05050] disabled:opacity-20 transition"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addLine}
                                className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-[#4A9A72]/40 px-3 py-2 text-[12px] text-[#4A9A72] transition hover:border-[#4A9A72]/70 hover:bg-[#4A9A72]/5"
                            >
                                <Plus className="size-3.5" />
                                Añadir línea
                            </button>

                            {/* Separador + totales en la misma card */}
                            <div className="mt-5 border-t border-border/50 pt-4">
                                <div className="ml-auto w-full max-w-xs space-y-2 text-[13px]">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal (sin IGV)</span>
                                        <span className="tabular-nums">{currency} {totals.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>IGV (18%)</span>
                                        <span className="tabular-nums">{currency} {totals.taxes}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-border/60 pt-2 text-[14px] font-semibold">
                                        <span>Total a pagar</span>
                                        <span className="tabular-nums text-[#4A9A72]">
                                            {currency} {totals.total}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Errores globales */}
                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-xl border border-red-400/30 bg-red-400/5 p-3 text-[12px] text-red-500">
                                Corrige los errores marcados antes de emitir.
                            </div>
                        )}
                    </div>

                    {/* ═══════════════════════════════════════════════════════
                        DERECHA — Sidebar sticky con resumen
                    ════════════════════════════════════════════════════════ */}
                    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">

                        {/* Preview del comprobante */}
                        <div className={cardClass}>
                            <p className={`${labelClass} mb-3`}>Vista previa</p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-muted-foreground">Tipo</span>
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                                        style={{ background: `${docTypeInfo.color}18`, color: docTypeInfo.color }}
                                    >
                                        {docTypeInfo.label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Hash className="size-3" /> Número
                                    </span>
                                    <span className="font-mono text-[12px] font-semibold">{nextNumber}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <CalendarDays className="size-3" /> Fecha
                                    </span>
                                    <span className="text-[12px]">{issuedAt}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <CircleDollarSign className="size-3" /> Moneda
                                    </span>
                                    <span className="text-[12px] font-medium">{currency}</span>
                                </div>
                            </div>
                        </div>

                        {/* Comprador — solo si hay nombre */}
                        {buyerName && (
                            <div className={cardClass}>
                                <p className={`${labelClass} mb-3`}>Comprador</p>
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#D28C3C]/12">
                                        <User className="size-3.5 text-[#D28C3C]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-[12px] font-semibold">{buyerName}</p>
                                        {buyerNumDoc && (
                                            <p className="font-mono text-[11px] text-muted-foreground">{buyerNumDoc}</p>
                                        )}
                                        {buyerAddress && (
                                            <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">{buyerAddress}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resumen de totales */}
                        <div className={cardClass}>
                            <p className={`${labelClass} mb-3`}>Totales</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[12px] text-muted-foreground">
                                    <span>Subtotal s/IGV</span>
                                    <span className="tabular-nums font-medium text-foreground">{currency} {totals.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-[12px] text-muted-foreground">
                                    <span>IGV 18%</span>
                                    <span className="tabular-nums font-medium text-foreground">{currency} {totals.taxes}</span>
                                </div>
                                <div className="mt-1 rounded-xl bg-[#4A9A72]/10 px-3 py-2.5">
                                    <div className="flex justify-between">
                                        <span className="text-[13px] font-semibold text-[#4A9A72]">Total</span>
                                        <span className="tabular-nums text-[15px] font-bold text-[#4A9A72]">
                                            {currency} {totals.total}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[10px] text-[#4A9A72]/70">
                                        {lines.length} {lines.length === 1 ? 'línea' : 'líneas'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botón emitir */}
                        {sequences.length === 0 ? (
                            <div className="rounded-xl border border-orange-400/30 bg-orange-400/5 p-3 text-[12px] text-orange-500">
                                Configura una secuencia en Config. emisor antes de emitir.
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A80B8] px-5 py-3 text-[13px] font-semibold text-white shadow-md transition hover:bg-[#4A80B8]/90 active:scale-[0.98] disabled:opacity-60"
                            >
                                {submitting ? (
                                    <><Loader2 className="size-4 animate-spin" />Emitiendo a SUNAT…</>
                                ) : (
                                    <><Zap className="size-4" />Emitir comprobante</>
                                )}
                            </button>
                        )}

                        {/* Info de envío */}
                        <div className="rounded-xl border border-[#4A80B8]/15 bg-[#4A80B8]/4 p-3.5 text-[11px] text-muted-foreground">
                            <div className="mb-1.5 flex items-center gap-1.5">
                                <CheckCircle2 className="size-3.5 text-[#4A80B8]" />
                                <span className="font-medium text-[#4A80B8]">Envío en tiempo real</span>
                            </div>
                            Al emitir, se genera el XML UBL 2.1, se firma y se envía a SUNAT. El CDR de respuesta quedará guardado en el detalle.
                        </div>
                    </aside>
                </form>
            </div>
        </AppLayout>
    );
}
