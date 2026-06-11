import { Head, router } from '@inertiajs/react';
import {
    Building2,
    FilePlus2,
    Loader2,
    Plus,
    Trash2,
    User,
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

/**
 * Catálogo 16 SUNAT — Códigos de afectación IGV.
 * Agrupados por tipo para el LineCodePicker.
 */
const IGV_GROUPS: CodeGroup[] = [
    {
        label: 'Operaciones gravadas',
        options: [
            { value: '10', label: 'Gravado — Operación Onerosa', shortLabel: 'Gravado 18%', color: 'blue' },
            { value: '17', label: 'Gravado — IVAP (Arroz pilado)', shortLabel: 'IVAP', color: 'blue' },
        ],
    },
    {
        label: 'Exoneradas e inafectas',
        options: [
            { value: '20', label: 'Exonerado — Operación Onerosa', shortLabel: 'Exonerado', color: 'yellow' },
            { value: '30', label: 'Inafecto — Operación Onerosa',  shortLabel: 'Inafecto',  color: 'gray' },
            { value: '31', label: 'Inafecto — Retiro por bonificación', shortLabel: 'Retiro bonif.', color: 'gray' },
        ],
    },
    {
        label: 'Exportación y gratuita',
        options: [
            { value: '40', label: 'Exportación de bienes o servicios', shortLabel: 'Exportación', color: 'purple' },
            { value: '11', label: 'Gravado — Retiro por premio',   shortLabel: 'Retiro premio', color: 'orange' },
            { value: '21', label: 'Exonerado — Transferencia gratuita', shortLabel: 'Exon. gratuita', color: 'orange' },
        ],
    },
];

/**
 * Catálogo 03 SUNAT — Unidades de medida.
 * Ref: https://cpe.sunat.gob.pe/sites/default/files/inline-files/Catalogo%2003.pdf
 */
const UNIT_GROUPS: CodeGroup[] = [
    {
        label: 'Servicios (intangibles)',
        options: [
            { value: 'ZZ',  label: 'Unidad de servicio (digital / intangible)', shortLabel: 'Servicio', color: 'blue' },
            { value: 'E49', label: 'Trabajo / actividad de servicio',           shortLabel: 'Trabajo',  color: 'blue' },
        ],
    },
    {
        label: 'Cantidad',
        options: [
            { value: 'NIU', label: 'Unidad (unidades físicas)',  shortLabel: 'Unidad',   color: 'green' },
            { value: 'SET', label: 'Juego / conjunto de ítems',  shortLabel: 'Juego',    color: 'green' },
            { value: 'PAR', label: 'Par',                        shortLabel: 'Par',      color: 'green' },
            { value: 'C62', label: 'Uno (count)',                shortLabel: 'Count',    color: 'green' },
        ],
    },
    {
        label: 'Peso',
        options: [
            { value: 'KGM', label: 'Kilogramo', shortLabel: 'Kg',    color: 'orange' },
            { value: 'GRM', label: 'Gramo',     shortLabel: 'g',     color: 'orange' },
            { value: 'LBR', label: 'Libra',     shortLabel: 'lb',    color: 'orange' },
            { value: 'ONZ', label: 'Onza',      shortLabel: 'oz',    color: 'orange' },
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
        description: '',
        quantity: '1',
        unit_measure: 'ZZ',
        unit_price: '0.00',
        tax_rate: String(IGV_RATE),
        igv_code: '10',
        product_code: '',
    };
}

export default function ComprobantesCreate({ sequences, orders, preOrderId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: 'Comprobantes', href: '/panel/ventas-facturas' },
        { title: 'Emitir nuevo CPE', href: '/panel/ventas-facturas/crear' },
    ];

    // ── Estado del formulario ────────────────────────────────────────────
    const [sequenceId, setSequenceId] = React.useState(sequences[0]?.id ?? '');
    const [orderId, setOrderId] = React.useState(preOrderId ?? '');
    const [issuedAt, setIssuedAt] = React.useState(new Date().toISOString().slice(0, 10));
    const [currency, setCurrency] = React.useState('PEN');
    const [paymentType] = React.useState('Contado');

    const [buyerTipoDoc, setBuyerTipoDoc] = React.useState('6');
    const [buyerNumDoc, setBuyerNumDoc] = React.useState('');
    const [buyerName, setBuyerName] = React.useState('');
    const [buyerAddress, setBuyerAddress] = React.useState('');
    const [lookupLoading, setLookupLoading] = React.useState(false);
    const [lookupError, setLookupError] = React.useState<string | null>(null);
    const [lookupOk, setLookupOk] = React.useState(false);

    const [lines, setLines] = React.useState<Line[]>([emptyLine()]);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [submitting, setSubmitting] = React.useState(false);

    // ── Sequence seleccionada ────────────────────────────────────────────
    const selectedSeq = sequences.find((s) => s.id === sequenceId);

    const sequenceOptions = sequences.map((s) => ({
        value: s.id,
        label: `${s.document_type_code === '01' ? 'Factura' : s.document_type_code === '03' ? 'Boleta' : 'Nota'} ${s.serie} · correlativo ${s.next_correlative}`,
    }));

    // ── Rellenar comprador + líneas cuando se selecciona una orden ──────
    React.useEffect(() => {
        if (!orderId) return; // sin orden seleccionada: no hacer nada

        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        // Datos del comprador (desde billing_snapshot)
        const snap = order.billing_snapshot as Record<string, string> | null;
        if (snap) {
            setBuyerName(snap.legal_name ?? snap.razon_social ?? '');
            setBuyerNumDoc(snap.ruc ?? snap.document_number ?? '');
            setBuyerAddress(snap.address ?? '');
            setBuyerTipoDoc(snap.ruc ? '6' : '1');
        }
        setCurrency(order.currency);

        // Líneas desde la orden
        if (order.lines && order.lines.length > 0) {
            const mapped: Line[] = order.lines.map((ol) => {
                const sku         = ol.sku;
                // igv_applies del SKU; fallback: si hay tax_amount > 0 asumimos gravado
                const igvApplies  = sku != null
                    ? sku.igv_applies
                    : parseFloat(ol.tax_amount ?? '0') > 0;

                // Si el precio del SKU ya incluye IGV, dividimos para obtener la base
                const taxIncluded = sku != null ? sku.tax_included : false;
                const rawPrice    = parseFloat(ol.unit_price);
                const unitNoIgv   = igvApplies && taxIncluded
                    ? (rawPrice / 1.18).toFixed(2)
                    : rawPrice.toFixed(2);

                const description = [ol.product_name_snapshot, ol.sku_name_snapshot]
                    .filter(Boolean)
                    .join(' — ');

                return {
                    description,
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

    // ── Validación de longitud esperada según tipo de doc ────────────────
    const expectedLen = buyerTipoDoc === '6' ? 11 : buyerTipoDoc === '1' ? 8 : null;

    // ── Consulta APIPERU (RUC o DNI) ─────────────────────────────────────
    const lookupDocument = React.useCallback(async (doc: string) => {
        const len = doc.length;
        if ((buyerTipoDoc === '6' && len !== 11) || (buyerTipoDoc === '1' && len !== 8)) return;

        setLookupLoading(true);
        setLookupError(null);
        setLookupOk(false);

        try {
            const csrfMeta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
            const csrfToken = csrfMeta?.content ?? '';

            const res = await fetch('/panel/ventas-facturas/lookup-doc', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ document: doc }),
            });

            const json = (await res.json().catch(() => ({}))) as {
                tipo_doc?: string;
                name?: string;
                address?: string;
                estado?: string;
                condicion?: string;
                message?: string;
            };

            if (!res.ok) {
                setLookupError(json.message ?? 'No se encontraron datos.');
                return;
            }

            if (json.name) setBuyerName(json.name);
            if (json.address) setBuyerAddress(json.address);
            setLookupOk(true);
        } catch {
            setLookupError('Error de conexión al consultar.');
        } finally {
            setLookupLoading(false);
        }
    }, [buyerTipoDoc]);

    // ── Manejador del campo de documento (solo números + auto-lookup) ────
    function handleDocChange(raw: string) {
        const digits = raw.replace(/\D/g, '');
        // Limitar longitud
        const maxLen = buyerTipoDoc === '6' ? 11 : buyerTipoDoc === '1' ? 8 : 15;
        const trimmed = digits.slice(0, maxLen);
        setBuyerNumDoc(trimmed);
        setLookupError(null);
        setLookupOk(false);

        // Auto-lookup al alcanzar la longitud correcta
        const target = buyerTipoDoc === '6' ? 11 : buyerTipoDoc === '1' ? 8 : null;
        if (target && trimmed.length === target) {
            void lookupDocument(trimmed);
        }
    }

    // Reset al cambiar tipo de doc
    function handleTipoDocChange(v: string) {
        setBuyerTipoDoc(v);
        setBuyerNumDoc('');
        setLookupError(null);
        setLookupOk(false);
    }

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
            order_id:    orderId || null,
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
                description:  l.description,
                quantity:     l.quantity,
                unit_measure: l.unit_measure,
                unit_price:   l.unit_price,
                tax_rate:     l.tax_rate,
                igv_code:     l.igv_code,
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
                                    <p className="text-[10px] text-muted-foreground">
                                        Líneas pre-cargadas desde la orden. Puedes editarlas.
                                    </p>
                                )}
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
                                    onValueChange={handleTipoDocChange}
                                />
                                <InputError message={errors['buyer.tipo_doc']} />
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>
                                    N.º Documento
                                    <span className="ml-1 normal-case text-(--muted-foreground)">
                                        ({buyerTipoDoc === '6' ? 'RUC – 11 dígitos' : buyerTipoDoc === '1' ? 'DNI – 8 dígitos' : 'opcional'})
                                    </span>
                                </label>

                                {/* Campo con ícono búsqueda, contador y botón lookup */}
                                <div className="flex items-stretch gap-2">
                                    <div className="relative flex-1">
                                        {/* Ícono izquierdo */}
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

                                        {/* Contador de dígitos dentro del campo (derecha) */}
                                        {expectedLen && (
                                            <span
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] font-semibold tabular-nums transition-colors ${
                                                    buyerNumDoc.length === expectedLen
                                                        ? 'text-[#4A9A72]'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {buyerNumDoc.length}/{expectedLen}
                                            </span>
                                        )}
                                    </div>

                                    {/* Botón lookup manual */}
                                    {(buyerTipoDoc === '6' || buyerTipoDoc === '1') && (
                                        <button
                                            type="button"
                                            onClick={() => void lookupDocument(buyerNumDoc)}
                                            disabled={
                                                lookupLoading ||
                                                (buyerTipoDoc === '6' && buyerNumDoc.length !== 11) ||
                                                (buyerTipoDoc === '1' && buyerNumDoc.length !== 8)
                                            }
                                            title="Consultar nombre/razón social en SUNAT (apiperu.dev)"
                                            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-[#4A80B8]/8 px-3 py-1.5 text-[11px] font-medium text-[#4A80B8] transition hover:bg-[#4A80B8]/15 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {lookupLoading ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                <Building2 className="size-3.5" />
                                            )}
                                            Consultar
                                        </button>
                                    )}
                                </div>

                                {/* Feedback lookup */}
                                {lookupOk && (
                                    <p className="text-[11px] text-[#4A9A72]">✓ Datos obtenidos de SUNAT · Revisa y edita si es necesario.</p>
                                )}
                                {lookupError && (
                                    <p className="text-[11px] text-[#C05050]">{lookupError}</p>
                                )}
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
                            <div className="hidden grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 md:grid">
                                {['Descripción', 'Cant.', 'Unidad (Cat.03)', 'P. Unit. s/IGV', 'Afectación IGV', 'IGV %', ''].map((h, i) => (
                                    <span key={i} className={labelClass}>{h}</span>
                                ))}
                            </div>

                            {lines.map((line, i) => (
                                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg bg-(--o-amber)/3 p-3 md:grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr_auto] md:items-center md:bg-transparent md:p-0">
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
                                    {/* Unidad — Catálogo 03 SUNAT */}
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

                                    {/* Afectación IGV — Catálogo 16 SUNAT */}
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
