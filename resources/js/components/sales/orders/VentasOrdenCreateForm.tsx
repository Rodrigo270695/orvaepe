import { useForm } from '@inertiajs/react';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import * as React from 'react';

import AdminClienteSelect, {
    type ClienteUserOption,
} from '@/components/admin/form/admin-cliente-select';
import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import panel from '@/routes/panel';

const EMPTY = '_none_';

export type SkuOption = {
    id: string;
    code: string;
    name: string;
    product_name: string;
    currency: string;
    list_price: string;
};

type Line = {
    catalog_sku_id: string;
    quantity: number;
};

type Props = {
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuOption[];
};

export default function VentasOrdenCreateForm({
    usersForSelect,
    skusForSelect,
}: Props) {
    const form = useForm({
        user_id: '',
        currency: 'PEN',
        status: 'draft',
        notes_internal: '',
        lines: [{ catalog_sku_id: EMPTY, quantity: 1 }] as Line[],
    });

    const { data, setData, post, processing, errors } = form;

    const currencyOptions = React.useMemo(() => {
        const set = new Set<string>();
        for (const s of skusForSelect) {
            if (s.currency) {
                set.add(s.currency.toUpperCase());
            }
        }
        const list = Array.from(set).sort();
        if (list.length === 0) {
            return [{ value: 'PEN', label: 'PEN' }];
        }
        return list.map((c) => ({ value: c, label: c }));
    }, [skusForSelect]);

    const skuOptions = React.useMemo(
        () => [
            { value: EMPTY, label: '— Elegir SKU —' },
            ...skusForSelect.map((s) => ({
                value: s.id,
                label: `${s.code} · ${s.name} (${s.product_name}) · ${s.currency} ${s.list_price}`,
            })),
        ],
        [skusForSelect],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((fd) => ({
            ...fd,
            user_id: fd.user_id === '' ? '' : Number(fd.user_id),
            lines: fd.lines.map((l) => ({
                catalog_sku_id:
                    l.catalog_sku_id === EMPTY ? '' : l.catalog_sku_id,
                quantity: Number(l.quantity),
            })),
        }));
        post(panel.ventasOrdenes.store.url());
    };

    const addLine = () => {
        setData('lines', [
            ...data.lines,
            { catalog_sku_id: EMPTY, quantity: 1 },
        ]);
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Cabecera
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <AdminClienteSelect
                            value={data.user_id}
                            onChange={(v) => setData('user_id', v)}
                            users={usersForSelect}
                            error={errors.user_id}
                            required
                        />
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
                                {
                                    value: 'pending_payment',
                                    label: 'Pendiente de pago',
                                },
                                { value: 'paid', label: 'Pagado' },
                                {
                                    value: 'cancelled',
                                    label: 'Cancelado',
                                },
                                {
                                    value: 'refunded',
                                    label: 'Reembolsado',
                                },
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
                            placeholder="Opcional"
                            autoComplete="off"
                        />
                        <InputError message={errors.notes_internal} />
                    </div>
                </div>
            </NeuCardRaised>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Líneas
                    </h2>
                    <NeuButtonRaised
                        type="button"
                        onClick={addLine}
                        className="cursor-pointer text-[11px]"
                    >
                        <Plus className="size-3.5" />
                        Añadir línea
                    </NeuButtonRaised>
                </div>

                <div className="mt-4 space-y-4">
                    {data.lines.map((line, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-3 rounded-xl border border-border/50 p-3 md:flex-row md:items-end"
                        >
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <AdminUnderlineLabel
                                    htmlFor={`line_sku_${index}`}
                                    required
                                >
                                    SKU
                                </AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id={`line_sku_${index}`}
                                    name={`lines[${index}][catalog_sku_id]`}
                                    value={line.catalog_sku_id}
                                    onValueChange={(v) =>
                                        updateLine(index, {
                                            catalog_sku_id: v,
                                        })
                                    }
                                    options={skuOptions}
                                />
                                <InputError
                                    message={
                                        (errors as Record<string, string>)[
                                            `lines.${index}.catalog_sku_id`
                                        ]
                                    }
                                />
                            </div>
                            <div className="w-full space-y-1.5 md:w-28">
                                <AdminUnderlineLabel
                                    htmlFor={`line_qty_${index}`}
                                    required
                                >
                                    Cant.
                                </AdminUnderlineLabel>
                                <AdminUnderlineInput
                                    id={`line_qty_${index}`}
                                    name={`lines[${index}][quantity]`}
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={String(line.quantity)}
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
                                />
                                <InputError
                                    message={
                                        (errors as Record<string, string>)[
                                            `lines.${index}.quantity`
                                        ]
                                    }
                                />
                            </div>
                            <div className="flex justify-end md:pb-1">
                                <button
                                    type="button"
                                    onClick={() => removeLine(index)}
                                    disabled={data.lines.length <= 1}
                                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-[#C05050] disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Quitar línea"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <InputError message={errors.lines} />
            </NeuCardRaised>

            <div className="flex flex-wrap items-center gap-3">
                <NeuButtonRaised
                    type="submit"
                    disabled={processing}
                    className="cursor-pointer"
                >
                    <ShoppingCart className="size-4 text-[#4A9A72]" />
                    {processing ? 'Guardando…' : 'Crear pedido'}
                </NeuButtonRaised>
                <p className="text-[11px] text-muted-foreground">
                    Los precios se toman del listado del SKU; la moneda del SKU
                    debe coincidir con la moneda del pedido.
                </p>
            </div>
        </form>
    );
}
