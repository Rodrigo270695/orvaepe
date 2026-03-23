import { useForm } from '@inertiajs/react';
import { Plus, RefreshCcw, Trash2 } from 'lucide-react';
import * as React from 'react';

import AdminClienteSelect, {
    type ClienteUserOption,
} from '@/components/admin/form/admin-cliente-select';
import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import { Checkbox } from '@/components/ui/checkbox';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import panel from '@/routes/panel';

import type { SkuOption } from '@/components/sales/orders/VentasOrdenCreateForm';

const EMPTY = '_none_';

export type SubscriptionFormSubscription = {
    id: string;
    user_id: number;
    status: string;
    gateway_customer_id: string | null;
    gateway_subscription_id: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    trial_ends_at: string | null;
    cancel_at_period_end: boolean;
    items: Array<{
        catalog_sku_id: string;
        quantity: number;
        unit_price: string;
    }>;
};

type ItemLine = {
    catalog_sku_id: string;
    quantity: number;
    unit_price: string;
};

type Props = {
    mode: 'create' | 'edit';
    subscription?: SubscriptionFormSubscription;
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuOption[];
};

function isoToDatetimeLocal(iso: string | null | undefined): string {
    if (!iso) {
        return '';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_OPTIONS = [
    { value: 'trialing', label: 'En prueba' },
    { value: 'active', label: 'Activa' },
    { value: 'past_due', label: 'Vencida' },
    { value: 'paused', label: 'Pausada' },
    { value: 'cancelled', label: 'Cancelada' },
] as const;

export default function VentasSuscripcionForm({
    mode,
    subscription,
    usersForSelect,
    skusForSelect,
}: Props) {
    const initial = React.useMemo(() => {
        if (mode === 'edit' && subscription) {
            return {
                user_id: String(subscription.user_id),
                status: subscription.status,
                gateway_customer_id: subscription.gateway_customer_id ?? '',
                gateway_subscription_id: subscription.gateway_subscription_id ?? '',
                current_period_start: isoToDatetimeLocal(
                    subscription.current_period_start,
                ),
                current_period_end: isoToDatetimeLocal(
                    subscription.current_period_end,
                ),
                trial_ends_at: isoToDatetimeLocal(subscription.trial_ends_at),
                cancel_at_period_end: subscription.cancel_at_period_end,
                items:
                    subscription.items.length > 0
                        ? subscription.items.map((i) => ({
                              catalog_sku_id: i.catalog_sku_id,
                              quantity: i.quantity,
                              unit_price: i.unit_price,
                          }))
                        : ([
                              {
                                  catalog_sku_id: EMPTY,
                                  quantity: 1,
                                  unit_price: '',
                              },
                          ] as ItemLine[]),
            };
        }
        return {
            user_id: '',
            status: 'active',
            gateway_customer_id: '',
            gateway_subscription_id: '',
            current_period_start: '',
            current_period_end: '',
            trial_ends_at: '',
            cancel_at_period_end: false,
            items: [
                { catalog_sku_id: EMPTY, quantity: 1, unit_price: '' },
            ] as ItemLine[],
        };
    }, [mode, subscription]);

    const form = useForm(initial);

    const { data, setData, post, patch, processing, errors } = form;

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

    const skuById = React.useMemo(() => {
        const m = new Map<string, SkuOption>();
        for (const s of skusForSelect) {
            m.set(s.id, s);
        }
        return m;
    }, [skusForSelect]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((fd) => ({
            ...fd,
            user_id: fd.user_id === '' ? '' : Number(fd.user_id),
            items: fd.items.map((l) => ({
                catalog_sku_id:
                    l.catalog_sku_id === EMPTY ? '' : l.catalog_sku_id,
                quantity: Number(l.quantity),
                unit_price:
                    l.unit_price === '' ? '0' : String(l.unit_price).replace(',', '.'),
            })),
        }));
        if (mode === 'create') {
            post(panel.ventasSuscripciones.store.url());
        } else if (subscription) {
            patch(panel.ventasSuscripciones.update.url(subscription.id));
        }
    };

    const addLine = () => {
        setData('items', [
            ...data.items,
            { catalog_sku_id: EMPTY, quantity: 1, unit_price: '' },
        ]);
    };

    const removeLine = (index: number) => {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const updateItem = (index: number, patchLine: Partial<ItemLine>) => {
        setData(
            'items',
            data.items.map((line, i) => {
                if (i !== index) {
                    return line;
                }
                const next = { ...line, ...patchLine };
                if (patchLine.catalog_sku_id !== undefined) {
                    const sku = skuById.get(
                        patchLine.catalog_sku_id === EMPTY
                            ? ''
                            : patchLine.catalog_sku_id,
                    );
                    if (
                        sku &&
                        patchLine.catalog_sku_id !== EMPTY &&
                        (line.unit_price === '' ||
                            line.catalog_sku_id === EMPTY)
                    ) {
                        next.unit_price = sku.list_price;
                    }
                }
                return next;
            }),
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
                        <AdminUnderlineLabel htmlFor="sub_status" required>
                            Estado
                        </AdminUnderlineLabel>
                        <AdminUnderlineSelect
                            id="sub_status"
                            name="status"
                            value={data.status}
                            onValueChange={(v) => setData('status', v)}
                            options={[...STATUS_OPTIONS]}
                            required
                        />
                        <InputError message={errors.status} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="gateway_customer_id">
                            ID cliente (gateway)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="gateway_customer_id"
                            name="gateway_customer_id"
                            value={data.gateway_customer_id}
                            onChange={(e) =>
                                setData('gateway_customer_id', e.target.value)
                            }
                            placeholder="Opcional"
                            autoComplete="off"
                        />
                        <InputError message={errors.gateway_customer_id} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel htmlFor="gateway_subscription_id">
                            ID suscripción (gateway)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="gateway_subscription_id"
                            name="gateway_subscription_id"
                            value={data.gateway_subscription_id}
                            onChange={(e) =>
                                setData(
                                    'gateway_subscription_id',
                                    e.target.value,
                                )
                            }
                            placeholder="Opcional"
                            autoComplete="off"
                        />
                        <InputError message={errors.gateway_subscription_id} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="current_period_start">
                            Inicio período actual
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="current_period_start"
                            name="current_period_start"
                            type="datetime-local"
                            value={data.current_period_start}
                            onChange={(e) =>
                                setData('current_period_start', e.target.value)
                            }
                        />
                        <InputError message={errors.current_period_start} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="current_period_end">
                            Fin período actual
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="current_period_end"
                            name="current_period_end"
                            type="datetime-local"
                            value={data.current_period_end}
                            onChange={(e) =>
                                setData('current_period_end', e.target.value)
                            }
                        />
                        <InputError message={errors.current_period_end} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel htmlFor="trial_ends_at">
                            Fin de prueba
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="trial_ends_at"
                            name="trial_ends_at"
                            type="datetime-local"
                            value={data.trial_ends_at}
                            onChange={(e) =>
                                setData('trial_ends_at', e.target.value)
                            }
                        />
                        <InputError message={errors.trial_ends_at} />
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2">
                        <Checkbox
                            id="cancel_at_period_end"
                            checked={data.cancel_at_period_end}
                            onCheckedChange={(v) =>
                                setData('cancel_at_period_end', Boolean(v))
                            }
                            className="cursor-pointer"
                        />
                        <label
                            htmlFor="cancel_at_period_end"
                            className="text-[11px] text-muted-foreground"
                        >
                            Cancelar al final del período actual (si aplica al
                            gateway)
                        </label>
                    </div>
                    <InputError message={errors.cancel_at_period_end} />
                </div>
            </NeuCardRaised>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Ítems (SKU y precio)
                    </h2>
                    <NeuButtonRaised
                        type="button"
                        onClick={addLine}
                        className="cursor-pointer text-[11px]"
                    >
                        <Plus className="size-3.5" />
                        Añadir ítem
                    </NeuButtonRaised>
                </div>

                <div className="mt-4 space-y-4">
                    {data.items.map((line, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-3 rounded-xl border border-border/50 p-3 md:flex-row md:flex-wrap md:items-end"
                        >
                            <div className="min-w-0 flex-1 space-y-1.5 md:min-w-48">
                                <AdminUnderlineLabel
                                    htmlFor={`sub_line_sku_${index}`}
                                    required
                                >
                                    SKU
                                </AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id={`sub_line_sku_${index}`}
                                    name={`items[${index}][catalog_sku_id]`}
                                    value={line.catalog_sku_id}
                                    onValueChange={(v) =>
                                        updateItem(index, {
                                            catalog_sku_id: v,
                                        })
                                    }
                                    options={skuOptions}
                                />
                                <InputError
                                    message={
                                        (errors as Record<string, string>)[
                                            `items.${index}.catalog_sku_id`
                                        ]
                                    }
                                />
                            </div>
                            <div className="w-full space-y-1.5 md:w-24">
                                <AdminUnderlineLabel
                                    htmlFor={`sub_line_qty_${index}`}
                                    required
                                >
                                    Cant.
                                </AdminUnderlineLabel>
                                <AdminUnderlineInput
                                    id={`sub_line_qty_${index}`}
                                    name={`items[${index}][quantity]`}
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={String(line.quantity)}
                                    onChange={(e) =>
                                        updateItem(index, {
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
                                            `items.${index}.quantity`
                                        ]
                                    }
                                />
                            </div>
                            <div className="w-full space-y-1.5 md:w-32">
                                <AdminUnderlineLabel
                                    htmlFor={`sub_line_price_${index}`}
                                    required
                                >
                                    Precio unit.
                                </AdminUnderlineLabel>
                                <AdminUnderlineInput
                                    id={`sub_line_price_${index}`}
                                    name={`items[${index}][unit_price]`}
                                    type="text"
                                    inputMode="decimal"
                                    value={line.unit_price}
                                    onChange={(e) =>
                                        updateItem(index, {
                                            unit_price: e.target.value,
                                        })
                                    }
                                />
                                <InputError
                                    message={
                                        (errors as Record<string, string>)[
                                            `items.${index}.unit_price`
                                        ]
                                    }
                                />
                            </div>
                            <div className="flex justify-end md:pb-1">
                                <button
                                    type="button"
                                    onClick={() => removeLine(index)}
                                    disabled={data.items.length <= 1}
                                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-[#C05050] disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Quitar ítem"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <InputError message={errors.items} />
            </NeuCardRaised>

            <div className="flex flex-wrap items-center gap-3">
                <NeuButtonRaised
                    type="submit"
                    disabled={processing}
                    className="cursor-pointer"
                >
                    <RefreshCcw className="size-4 text-[#D28C3C]" />
                    {processing
                        ? 'Guardando…'
                        : mode === 'create'
                          ? 'Crear suscripción'
                          : 'Guardar cambios'}
                </NeuButtonRaised>
                <p className="text-[11px] text-muted-foreground">
                    El precio unitario es manual; al elegir un SKU se sugiere el
                    listado del catálogo.
                </p>
            </div>
        </form>
    );
}
