import { useForm } from '@inertiajs/react';
import {
    Building2,
    FileText,
    Info,
    Loader2,
    Plus,
    Sparkles,
    Trash2,
} from 'lucide-react';
import * as React from 'react';

import AdminClienteSelect, {
    type ClienteUserOption,
} from '@/components/admin/form/admin-cliente-select';
import AdminSkuSearchSelect, {
    type SkuPickOption,
} from '@/components/admin/form/admin-sku-search-select';
import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { getCsrfToken } from '@/lib/csrf';
import { cn } from '@/lib/utils';
import panel from '@/routes/panel';

export type { SkuPickOption } from '@/components/admin/form/admin-sku-search-select';

type Line = {
    catalog_sku_id: string;
    manual_code: string;
    manual_name: string;
    manual_igv_applies: boolean;
    quantity: number;
    /** Precio unitario cotizado (texto para el input; al elegir SKU se rellena con el listado). */
    unit_price: string;
    /** Descuento fijo en moneda de la cotización (valor de venta / total según aplique IGV en backend). */
    line_discount: string;
};

type FormShape = {
    user_id: string;
    customer_legal_name: string;
    customer_document_type: string;
    customer_document_number: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    title: string;
    currency: string;
    status: string;
    notes_internal: string;
    lines: Line[];
};

type Props = {
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuPickOption[];
    initialData?: FormShape;
    submitUrl?: string;
    submitMethod?: 'post' | 'patch';
    submitLabel?: string;
};

function inferDocumentType(doc: string): '6' | '1' {
    const d = doc.replace(/\D/g, '');
    if (d.length === 8) {
        return '1';
    }
    return '6';
}

function buildAddress(p: NonNullable<ClienteUserOption['profile']>): string {
    const parts = [p.address, p.city].filter(
        (x): x is string => Boolean(x && String(x).trim()),
    );
    return parts.join(', ');
}

export default function VentasCotizacionCreateForm({
    usersForSelect,
    skusForSelect,
    initialData,
    submitUrl,
    submitMethod = 'post',
    submitLabel,
}: Props) {
    const defaultData: FormShape = {
        user_id: '',
        customer_legal_name: '',
        customer_document_type: '6',
        customer_document_number: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        title: '',
        currency: 'PEN',
        status: 'draft',
        notes_internal: '',
        lines: [
            {
                catalog_sku_id: '',
                manual_code: '',
                manual_name: '',
                manual_igv_applies: true,
                quantity: 1,
                unit_price: '',
                line_discount: '0',
            },
        ] as Line[],
    };
    const form = useForm<FormShape>(initialData ?? defaultData);

    const { data, setData, post, processing, errors } = form;

    const usersById = React.useMemo(() => {
        const m = new Map<number, ClienteUserOption>();
        for (const u of usersForSelect) {
            m.set(u.id, u);
        }
        return m;
    }, [usersForSelect]);

    const skusById = React.useMemo(() => {
        const m = new Map<string, SkuPickOption>();
        for (const s of skusForSelect) {
            m.set(s.id, s);
        }
        return m;
    }, [skusForSelect]);

    const [billingFromClient, setBillingFromClient] = React.useState(false);
    const [rucLookupLoading, setRucLookupLoading] = React.useState(false);
    const [rucLookupError, setRucLookupError] = React.useState<string | null>(
        null,
    );

    const applyClientProfile = React.useCallback(
        (userId: string) => {
            if (!userId) {
                setBillingFromClient(false);
                return;
            }
            const u = usersById.get(Number(userId));
            if (!u) {
                setBillingFromClient(false);
                return;
            }
            const p = u.profile;
            const legal =
                p?.legal_name?.trim() ||
                p?.company_name?.trim() ||
                [u.name, u.lastname].filter(Boolean).join(' ').trim() ||
                u.name;
            const ruc = p?.ruc?.trim();
            const docUser = u.document_number?.trim();
            const docNum = ruc || docUser || '';
            const docType = docNum ? inferDocumentType(docNum) : '6';
            const email = p?.billing_email?.trim() || u.email || '';
            const phone = p?.phone?.trim() || '';
            const addr = p ? buildAddress(p) : '';

            setData('user_id', userId);
            setData('customer_legal_name', legal);
            setData('customer_document_type', docType);
            setData('customer_document_number', docNum);
            setData('customer_email', email);
            setData('customer_phone', phone);
            setData('customer_address', addr);
            setBillingFromClient(true);
        },
        [usersById, setData],
    );

    const handleClientChange = (userId: string) => {
        if (userId === '') {
            setData('user_id', '');
            setBillingFromClient(false);
            return;
        }
        applyClientProfile(userId);
    };

    const currencyOptions = React.useMemo(() => {
        const label = (code: string): string => {
            if (code === 'PEN') {
                return 'PEN — Sol';
            }
            if (code === 'USD') {
                return 'USD — Dólar';
            }
            return code;
        };
        const fromSkus = new Set<string>();
        for (const s of skusForSelect) {
            if (s.currency) {
                fromSkus.add(s.currency.toUpperCase());
            }
        }
        const primary = ['PEN', 'USD'] as const;
        const extra = Array.from(fromSkus)
            .filter((c) => !primary.includes(c as (typeof primary)[number]))
            .sort();
        const codes = [...primary, ...extra];
        return codes.map((c) => ({ value: c, label: label(c) }));
    }, [skusForSelect]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((fd) => ({
            ...fd,
            user_id: fd.user_id === '' ? null : Number(fd.user_id),
            lines: fd.lines.map((l) => {
                const up = String(l.unit_price).trim();
                const unitPrice =
                    up === '' ? 0 : Number.parseFloat(up.replace(',', '.'));
                const ld = String(l.line_discount).trim();
                const lineDisc =
                    ld === '' ? 0 : Number.parseFloat(ld.replace(',', '.'));
                return {
                    catalog_sku_id: l.catalog_sku_id.trim(),
                    manual_code: l.manual_code.trim(),
                    manual_name: l.manual_name.trim(),
                    manual_igv_applies: Boolean(l.manual_igv_applies),
                    quantity: Number(l.quantity),
                    unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
                    line_discount: Number.isFinite(lineDisc) ? lineDisc : 0,
                };
            }),
        }));
        const action = submitUrl ?? panel.ventasCotizaciones.store.url();
        if (submitMethod === 'patch') {
            form.patch(action);
            return;
        }
        post(action);
    };

    const addLine = () => {
        setData('lines', [
            ...data.lines,
            {
                catalog_sku_id: '',
                manual_code: '',
                manual_name: '',
                manual_igv_applies: true,
                quantity: 1,
                unit_price: '',
                line_discount: '0',
            },
        ]);
    };

    const handleLineSkuChange = (index: number, skuId: string) => {
        const id = skuId === '' ? '' : skuId;
        const patch: Partial<Line> = { catalog_sku_id: id };
        if (id !== '') {
            const s = skusById.get(id);
            if (s) {
                const lp = s.list_price;
                patch.unit_price =
                    lp != null && String(lp).trim() !== ''
                        ? String(lp)
                        : '';
            }
            patch.manual_code = '';
            patch.manual_name = '';
            patch.manual_igv_applies = true;
        } else {
            patch.unit_price = '';
            patch.line_discount = '0';
        }
        updateLine(index, patch);
    };

    const removeLine = (index: number) => {
        if (data.lines.length <= 1) {
            return;
        }
        setData(
            'lines',
            data.lines.filter((_, i) => i !== index),
        );
    };

    const updateLine = (index: number, patch: Partial<Line>) => {
        setData(
            'lines',
            data.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)),
        );
    };

    const markBillingManual = () => {
        if (billingFromClient) {
            setBillingFromClient(false);
        }
    };

    const lookupRucSunat = async () => {
        setRucLookupError(null);
        const digits = data.customer_document_number.replace(/\D/g, '');
        if (digits.length !== 11) {
            setRucLookupError('El RUC debe tener 11 dígitos.');
            return;
        }
        setRucLookupLoading(true);
        try {
            const res = await fetch(panel.ventasCotizaciones.lookupRuc.url(), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ ruc: digits }),
            });
            const json = (await res.json().catch(() => ({}))) as {
                legal_name?: string;
                address?: string;
                phone?: string;
                message?: string;
                errors?: { ruc?: string[] };
            };

            if (!res.ok) {
                const fromErrors = json.errors?.ruc?.[0];
                const msg =
                    (typeof fromErrors === 'string' && fromErrors) ||
                    (typeof json.message === 'string' ? json.message : '') ||
                    'No se pudo consultar el RUC.';
                setRucLookupError(msg);
                return;
            }

            const name =
                typeof json.legal_name === 'string'
                    ? json.legal_name.trim()
                    : '';
            const addr =
                typeof json.address === 'string' ? json.address.trim() : '';

            if (!name || !addr) {
                setRucLookupError(
                    'La respuesta no incluye razón social o dirección.',
                );
                return;
            }

            markBillingManual();
            setData('customer_document_type', '6');
            setData('customer_document_number', digits);
            setData('customer_legal_name', name);
            setData('customer_address', addr);

            const phone =
                typeof json.phone === 'string' ? json.phone.trim() : '';
            if (phone !== '') {
                setData('customer_phone', phone);
            }
        } finally {
            setRucLookupLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-[#4A80B8]" />
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Cliente y alcance
                    </h2>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    Si el comprador ya tiene cuenta, búscalo aquí: completaremos
                    razón social, documento y contacto desde su perfil fiscal
                    (puedes corregir antes de guardar).
                </p>
                <div className="mt-4">
                    <AdminClienteSelect
                        id="cotiz_user_id"
                        value={data.user_id}
                        onChange={handleClientChange}
                        users={usersForSelect}
                        error={errors.user_id}
                        required={false}
                        placeholder="Buscar cliente por nombre, correo o documento…"
                    />
                </div>
                {data.user_id ? (
                    <div
                        className={cn(
                            'mt-3 flex gap-2 rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed',
                            billingFromClient
                                ? 'border-[#4A80B8]/35 bg-[#4A80B8]/8 text-foreground'
                                : 'border-border/60 bg-muted/30 text-muted-foreground',
                        )}
                    >
                        <Info
                            className={cn(
                                'mt-0.5 size-3.5 shrink-0',
                                billingFromClient
                                    ? 'text-[#4A80B8]'
                                    : 'text-muted-foreground',
                            )}
                        />
                        <span>
                            {billingFromClient
                                ? 'Datos del destinatario rellenados desde el perfil del cliente. Revisa RUC/DNI y dirección antes de enviar la cotización.'
                                : 'Cliente seleccionado. Los datos de facturación los puedes editar abajo.'}
                        </span>
                    </div>
                ) : null}
            </NeuCardRaised>

            <div className="rounded-xl border border-border/50 bg-black/2 p-4 dark:bg-white/2 md:p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Destinatario fiscal (PDF / SUNAT)
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                    Obligatorio si no hay cliente registrado; si hay cliente,
                    suele venir del perfil y puedes ajustarlo solo para esta
                    cotización.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel htmlFor="customer_legal_name">
                            Razón social / nombre
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="customer_legal_name"
                            name="customer_legal_name"
                            value={data.customer_legal_name}
                            onChange={(e) => {
                                markBillingManual();
                                setData('customer_legal_name', e.target.value);
                            }}
                            placeholder="Ej. Mi Empresa SAC"
                            autoComplete="organization"
                        />
                        <InputError message={errors.customer_legal_name} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="customer_document_type">
                            Tipo doc.
                        </AdminUnderlineLabel>
                        <AdminUnderlineSelect
                            id="customer_document_type"
                            name="customer_document_type"
                            value={data.customer_document_type}
                            onValueChange={(v) => {
                                markBillingManual();
                                setRucLookupError(null);
                                setData('customer_document_type', v);
                            }}
                            options={[
                                { value: '6', label: '6 — RUC' },
                                { value: '1', label: '1 — DNI' },
                            ]}
                        />
                        <InputError message={errors.customer_document_type} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="customer_document_number">
                            Nº documento
                        </AdminUnderlineLabel>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                            <div className="min-w-0 flex-1">
                                <AdminUnderlineInput
                                    id="customer_document_number"
                                    name="customer_document_number"
                                    value={data.customer_document_number}
                                    onChange={(e) => {
                                        markBillingManual();
                                        setRucLookupError(null);
                                        setData(
                                            'customer_document_number',
                                            e.target.value,
                                        );
                                    }}
                                    placeholder="11 dígitos (RUC) u 8 (DNI)"
                                    autoComplete="off"
                                />
                            </div>
                            {data.customer_document_type === '6' ? (
                                <NeuButtonRaised
                                    type="button"
                                    onClick={() => void lookupRucSunat()}
                                    disabled={rucLookupLoading}
                                    className="h-10 shrink-0 cursor-pointer gap-1.5 px-3 text-[11px] sm:mt-px"
                                    title="Consultar razón social y dirección en SUNAT (apiperu.dev)"
                                >
                                    {rucLookupLoading ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Building2 className="size-3.5 text-[#4A80B8]" />
                                    )}
                                    Consultar SUNAT
                                </NeuButtonRaised>
                            ) : null}
                        </div>
                        {rucLookupError ? (
                            <p className="text-[11px] text-[#C05050]">
                                {rucLookupError}
                            </p>
                        ) : null}
                        <InputError message={errors.customer_document_number} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="customer_email">
                            Correo
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="customer_email"
                            name="customer_email"
                            type="email"
                            value={data.customer_email}
                            onChange={(e) => {
                                markBillingManual();
                                setData('customer_email', e.target.value);
                            }}
                            placeholder="contacto@empresa.com"
                            autoComplete="email"
                        />
                        <InputError message={errors.customer_email} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="customer_phone">
                            Teléfono
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="customer_phone"
                            name="customer_phone"
                            value={data.customer_phone}
                            onChange={(e) => {
                                markBillingManual();
                                setData('customer_phone', e.target.value);
                            }}
                            placeholder="Opcional"
                            autoComplete="tel"
                        />
                        <InputError message={errors.customer_phone} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel htmlFor="customer_address">
                            Dirección
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="customer_address"
                            name="customer_address"
                            value={data.customer_address}
                            onChange={(e) => {
                                markBillingManual();
                                setData('customer_address', e.target.value);
                            }}
                            placeholder="Domicilio fiscal o de contacto"
                            autoComplete="street-address"
                        />
                        <InputError message={errors.customer_address} />
                    </div>
                </div>
            </div>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Cotización
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel htmlFor="title">
                            Título / asunto
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="title"
                            name="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Ej. Licencias antivirus — propuesta abril"
                            autoComplete="off"
                        />
                        <InputError message={errors.title} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="currency" required>
                            Moneda
                        </AdminUnderlineLabel>
                        <AdminUnderlineSelect
                            id="currency"
                            name="currency"
                            value={data.currency}
                            onValueChange={(v) => setData('currency', v)}
                            options={currencyOptions}
                            required
                        />
                        <InputError message={errors.currency} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="status" required>
                            Estado
                        </AdminUnderlineLabel>
                        <AdminUnderlineSelect
                            id="status"
                            name="status"
                            value={data.status}
                            onValueChange={(v) => setData('status', v)}
                            options={[
                                { value: 'draft', label: 'Borrador' },
                                { value: 'sent', label: 'Enviada' },
                            ]}
                            required
                        />
                        <InputError message={errors.status} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel htmlFor="notes_internal">
                            Notas internas
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="notes_internal"
                            name="notes_internal"
                            value={data.notes_internal}
                            onChange={(e) =>
                                setData('notes_internal', e.target.value)
                            }
                            placeholder="Visibles solo en el panel"
                            autoComplete="off"
                        />
                        <InputError message={errors.notes_internal} />
                    </div>
                </div>
            </NeuCardRaised>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Líneas
                        </h2>
                        <p className="mt-1 max-w-xl text-[11px] text-muted-foreground">
                            Puedes usar SKU del catálogo o una línea manual
                            temporal (no se guarda en catálogo). En línea manual
                            defines si aplica IGV.
                        </p>
                    </div>
                    <NeuButtonRaised
                        type="button"
                        onClick={addLine}
                        className="cursor-pointer shrink-0 text-[11px]"
                    >
                        <Plus className="size-3.5" />
                        Añadir línea
                    </NeuButtonRaised>
                </div>

                <div className="mt-4 space-y-4">
                    {data.lines.map((line, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-4 rounded-xl border border-border/55 p-4 neumorph-inset"
                        >
                            <div className="min-w-0">
                                <AdminSkuSearchSelect
                                    id={`cotiz_line_sku_${index}`}
                                    value={line.catalog_sku_id}
                                    onChange={(v) =>
                                        handleLineSkuChange(index, v)
                                    }
                                    skus={skusForSelect}
                                    error={
                                        (errors as Record<string, string>)[
                                            `lines.${index}.catalog_sku_id`
                                        ]
                                    }
                                    required={false}
                                />
                            </div>
                            {!line.catalog_sku_id ? (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <AdminUnderlineLabel
                                            htmlFor={`cotiz_line_manual_code_${index}`}
                                        >
                                            Código manual
                                        </AdminUnderlineLabel>
                                        <AdminUnderlineInput
                                            id={`cotiz_line_manual_code_${index}`}
                                            name={`lines[${index}][manual_code]`}
                                            value={line.manual_code}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    manual_code: e.target.value,
                                                })
                                            }
                                            placeholder="Ej. SKU-MANUAL-001"
                                            autoComplete="off"
                                        />
                                        <InputError
                                            message={
                                                (errors as Record<string, string>)[
                                                    `lines.${index}.manual_code`
                                                ]
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <AdminUnderlineLabel
                                            htmlFor={`cotiz_line_manual_name_${index}`}
                                            required
                                        >
                                            Nombre comercial manual
                                        </AdminUnderlineLabel>
                                        <AdminUnderlineInput
                                            id={`cotiz_line_manual_name_${index}`}
                                            name={`lines[${index}][manual_name]`}
                                            value={line.manual_name}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    manual_name: e.target.value,
                                                })
                                            }
                                            placeholder="Ej. Plan Emprendedor mensual"
                                            autoComplete="off"
                                        />
                                        <InputError
                                            message={
                                                (errors as Record<string, string>)[
                                                    `lines.${index}.manual_name`
                                                ]
                                            }
                                        />
                                    </div>
                                </div>
                            ) : null}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-1.5">
                                    <AdminUnderlineLabel
                                        htmlFor={`cotiz_line_price_${index}`}
                                        required
                                    >
                                        Precio unitario
                                    </AdminUnderlineLabel>
                                    <div className="rounded-xl px-1 neumorph-inset">
                                        <AdminUnderlineInput
                                            id={`cotiz_line_price_${index}`}
                                            name={`lines[${index}][unit_price]`}
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            step={0.01}
                                            value={line.unit_price ?? ''}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    unit_price: e.target.value,
                                                })
                                            }
                                            placeholder="0.00"
                                            className="h-10 border-0 bg-transparent font-mono shadow-none focus-visible:ring-0"
                                        />
                                    </div>
                                    <InputError
                                        message={
                                            (errors as Record<string, string>)[
                                                `lines.${index}.unit_price`
                                            ]
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <AdminUnderlineLabel
                                        htmlFor={`cotiz_line_disc_${index}`}
                                    >
                                        Descuento línea
                                    </AdminUnderlineLabel>
                                    <div className="rounded-xl px-1 neumorph-inset">
                                        <AdminUnderlineInput
                                            id={`cotiz_line_disc_${index}`}
                                            name={`lines[${index}][line_discount]`}
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            step={0.01}
                                            value={line.line_discount ?? '0'}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    line_discount:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="0"
                                            className="h-10 border-0 bg-transparent font-mono shadow-none focus-visible:ring-0"
                                        />
                                    </div>
                                    <p className="text-[10px] leading-snug text-muted-foreground">
                                        Importe fijo en {data.currency}; no puede
                                        superar el total de la línea.
                                    </p>
                                    <InputError
                                        message={
                                            (errors as Record<string, string>)[
                                                `lines.${index}.line_discount`
                                            ]
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <AdminUnderlineLabel
                                        htmlFor={`cotiz_line_qty_${index}`}
                                        required
                                    >
                                        Cantidad
                                    </AdminUnderlineLabel>
                                    <div className="rounded-xl px-1 neumorph-inset">
                                        <AdminUnderlineInput
                                            id={`cotiz_line_qty_${index}`}
                                            name={`lines[${index}][quantity]`}
                                            type="number"
                                            min={1}
                                            step={1}
                                            value={String(
                                                line.quantity ?? 1,
                                            )}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    quantity: Math.max(
                                                        1,
                                                        Number.parseInt(
                                                            e.target.value,
                                                            10,
                                                        ) || 1,
                                                    ),
                                                })
                                            }
                                            className="h-10 border-0 bg-transparent font-mono shadow-none focus-visible:ring-0"
                                        />
                                    </div>
                                    <InputError
                                        message={
                                            (errors as Record<string, string>)[
                                                `lines.${index}.quantity`
                                            ]
                                        }
                                    />
                                </div>
                                <div className="flex items-end justify-end sm:col-span-2 lg:col-span-1">
                                    <button
                                        type="button"
                                        onClick={() => removeLine(index)}
                                        disabled={data.lines.length <= 1}
                                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border/50 text-muted-foreground transition-colors hover:border-[#C05050]/40 hover:text-[#C05050] disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Quitar línea"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                            {!line.catalog_sku_id ? (
                                <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/50 bg-black/5 px-3 py-2 text-[11px] dark:bg-black/20">
                                    <label className="inline-flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={line.manual_igv_applies}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    manual_igv_applies:
                                                        e.target.checked,
                                                })
                                            }
                                            className="size-4 rounded border-border"
                                        />
                                        <span className="text-foreground">
                                            Aplica IGV (solo para esta cotización)
                                        </span>
                                    </label>
                                </div>
                            ) : (
                                <p className="text-[10px] leading-snug text-muted-foreground">
                                    En SKU registrado, el IGV usa la configuración del
                                    catálogo.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
                <InputError message={errors.lines} />
            </NeuCardRaised>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <NeuButtonRaised
                    type="submit"
                    disabled={processing}
                    className="cursor-pointer"
                >
                    <FileText className="size-4 text-[#4A9A72]" />
                    {processing
                        ? 'Guardando…'
                        : submitLabel ?? 'Crear cotización'}
                </NeuButtonRaised>
                <p className="text-[11px] leading-relaxed text-muted-foreground sm:max-w-md">
                    Precio y descuento son por línea. Si eliges SKU del catálogo,
                    usa su configuración de IGV y moneda; si no eliges SKU, se
                    crea una línea manual temporal para esta cotización.
                </p>
            </div>
        </form>
    );
}
