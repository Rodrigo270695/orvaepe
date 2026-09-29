import { useForm } from '@inertiajs/react';
import { Building2, FileCode2, FileText, Loader2 } from 'lucide-react';
import * as React from 'react';

import AdminNeuInsetDateInput from '@/components/admin/form/admin-neu-inset-date-input';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import type { DeliveryRow, PlanPeriod } from '@/components/sales/deliveries/deliveryTypes';
import {
    deliveryInvoiceUrl,
    deliveryXmlUrl,
    planEndDate,
    planPeriodOptions,
} from '@/components/sales/deliveries/deliveryTypes';
import InputError from '@/components/input-error';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { getCsrfToken } from '@/lib/csrf';
import panel from '@/routes/panel';

type EntregaFormData = {
    ruc: string;
    legal_name: string;
    product_description: string;
    includes_igv: '1' | '0';
    delivered_at: string;
    plan_period: PlanPeriod;
    plan_ends_at: string;
    invoice_file: File | null;
    xml_file: File | null;
    _method?: 'patch';
};

type Props = {
    mode: 'create' | 'edit';
    delivery?: DeliveryRow | null;
};

function todayIso(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
}

export default function VentasEntregaForm({ mode, delivery = null }: Props) {
    const [rucLookupLoading, setRucLookupLoading] = React.useState(false);
    const [rucLookupError, setRucLookupError] = React.useState<string | null>(
        null,
    );
    const [rucLookupOk, setRucLookupOk] = React.useState<string | null>(null);
    const lastLooked = React.useRef<string | null>(
        mode === 'edit' ? (delivery?.ruc ?? null) : null,
    );

    const initialDelivered = delivery?.delivered_at ?? todayIso();
    const initialPeriod: PlanPeriod =
        delivery?.plan_period === 'monthly' ||
        delivery?.plan_period === 'annual' ||
        delivery?.plan_period === 'two_years' ||
        delivery?.plan_period === 'three_years'
            ? delivery.plan_period
            : 'annual';

    const form = useForm<EntregaFormData>({
        ruc: delivery?.ruc ?? '',
        legal_name: delivery?.legal_name ?? '',
        product_description: delivery?.product_description ?? '',
        includes_igv: delivery?.includes_igv === false ? '0' : '1',
        delivered_at: initialDelivered,
        plan_period: initialPeriod,
        plan_ends_at:
            delivery?.plan_ends_at ?? planEndDate(initialDelivered, initialPeriod),
        invoice_file: null,
        xml_file: null,
    });

    const setDataRef = React.useRef(form.setData);
    setDataRef.current = form.setData;

    const lookupRuc = React.useCallback(async (digits: string) => {
        setRucLookupError(null);
        setRucLookupOk(null);
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
                message?: string;
                errors?: { ruc?: string[] };
            };
            if (!res.ok) {
                const msg =
                    json.errors?.ruc?.[0] ||
                    (typeof json.message === 'string' ? json.message : '') ||
                    'No se pudo consultar el RUC.';
                setRucLookupError(msg);
                return;
            }
            const name =
                typeof json.legal_name === 'string' ? json.legal_name.trim() : '';
            if (!name) {
                setRucLookupError('La consulta no devolvió la razón social.');
                return;
            }
            lastLooked.current = digits;
            setDataRef.current('legal_name', name);
            setRucLookupOk('Razón social cargada desde SUNAT.');
        } catch {
            setRucLookupError(
                'No se pudo consultar el RUC. Puedes escribir la razón social a mano.',
            );
        } finally {
            setRucLookupLoading(false);
        }
    }, []);

    React.useEffect(() => {
        const digits = form.data.ruc.replace(/\D/g, '');
        if (digits.length !== 11 || lastLooked.current === digits) {
            return;
        }
        const timer = window.setTimeout(() => {
            void lookupRuc(digits);
        }, 450);
        return () => window.clearTimeout(timer);
    }, [form.data.ruc, lookupRuc]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const url =
            mode === 'edit' && delivery
                ? `/panel/ventas-entregas/${delivery.id}`
                : '/panel/ventas-entregas';

        form.transform((data) => {
            const payload: EntregaFormData = {
                ruc: data.ruc.replace(/\D/g, ''),
                legal_name: data.legal_name,
                product_description: data.product_description,
                includes_igv: data.includes_igv,
                delivered_at: data.delivered_at,
                plan_period: data.plan_period,
                plan_ends_at: data.plan_ends_at,
                invoice_file: data.invoice_file,
                xml_file: data.xml_file,
            };
            if (mode === 'edit') {
                payload._method = 'patch';
            }
            return payload;
        });

        form.post(url, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-[#4A80B8]" />
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Empresa
                    </h2>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    Al completar los 11 dígitos del RUC se busca la razón social
                    en SUNAT. Si la consulta falla, puedes escribirla a mano.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="entrega_ruc" required>
                            RUC
                        </AdminUnderlineLabel>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                            <div className="min-w-0 flex-1">
                                <AdminUnderlineInput
                                    id="entrega_ruc"
                                    name="ruc"
                                    inputMode="numeric"
                                    value={form.data.ruc}
                                    onChange={(event) => {
                                        setRucLookupError(null);
                                        setRucLookupOk(null);
                                        const digits = event.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 11);
                                        form.setData('ruc', digits);
                                    }}
                                    placeholder="11 dígitos"
                                    autoComplete="off"
                                />
                            </div>
                            <NeuButtonRaised
                                type="button"
                                onClick={() =>
                                    void lookupRuc(
                                        form.data.ruc.replace(/\D/g, ''),
                                    )
                                }
                                disabled={rucLookupLoading}
                                className="h-10 shrink-0 cursor-pointer gap-1.5 px-3 text-[11px] sm:mt-px"
                            >
                                {rucLookupLoading ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Building2 className="size-3.5 text-[#4A80B8]" />
                                )}
                                Consultar SUNAT
                            </NeuButtonRaised>
                        </div>
                        {rucLookupError ? (
                            <p className="text-[11px] text-[#C05050]">
                                {rucLookupError}
                            </p>
                        ) : null}
                        {rucLookupOk ? (
                            <p className="text-[11px] text-[#4A9A72]">
                                {rucLookupOk}
                            </p>
                        ) : null}
                        <InputError message={form.errors.ruc} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="entrega_legal_name" required>
                            Razón social
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="entrega_legal_name"
                            name="legal_name"
                            value={form.data.legal_name}
                            onChange={(event) =>
                                form.setData('legal_name', event.target.value)
                            }
                            placeholder="Se completa al consultar el RUC"
                            autoComplete="organization"
                        />
                        <InputError message={form.errors.legal_name} />
                    </div>
                </div>
            </NeuCardRaised>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex items-center gap-2">
                    <FileText className="size-3.5 text-[#D28C3C]" />
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Producto y documentos
                    </h2>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5 md:col-span-2">
                        <AdminUnderlineLabel
                            htmlFor="entrega_product_description"
                            required
                        >
                            Descripción del producto
                        </AdminUnderlineLabel>
                        <textarea
                            id="entrega_product_description"
                            name="product_description"
                            value={form.data.product_description}
                            onChange={(event) =>
                                form.setData(
                                    'product_description',
                                    event.target.value,
                                )
                            }
                            rows={4}
                            placeholder="Qué se entregó o se ofreció"
                            className="w-full rounded-none border-0 border-b border-[var(--o-border2)] bg-transparent py-3 pl-3 pr-3 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--o-amber)]/60 focus:outline-none"
                        />
                        <InputError message={form.errors.product_description} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="entrega_includes_igv" required>
                            IGV
                        </AdminUnderlineLabel>
                        <AdminUnderlineSelect
                            id="entrega_includes_igv"
                            name="includes_igv"
                            value={form.data.includes_igv}
                            onValueChange={(next) =>
                                form.setData(
                                    'includes_igv',
                                    next === '0' ? '0' : '1',
                                )
                            }
                            options={[
                                { value: '1', label: 'Incluye IGV' },
                                { value: '0', label: 'No incluye IGV' },
                            ]}
                        />
                        <InputError message={form.errors.includes_igv} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="entrega_plan_period" required>
                            Plan comprado
                        </AdminUnderlineLabel>
                        <AdminUnderlineSelect
                            id="entrega_plan_period"
                            name="plan_period"
                            value={form.data.plan_period}
                            onValueChange={(next) => {
                                const period: PlanPeriod =
                                    next === 'monthly' ||
                                    next === 'two_years' ||
                                    next === 'three_years'
                                        ? next
                                        : 'annual';
                                form.setData({
                                    ...form.data,
                                    plan_period: period,
                                    plan_ends_at: planEndDate(
                                        form.data.delivered_at,
                                        period,
                                    ),
                                });
                            }}
                            options={planPeriodOptions}
                        />
                        <InputError message={form.errors.plan_period} />
                    </div>
                    <AdminNeuInsetDateInput
                        id="entrega_delivered_at"
                        label="Fecha de entrega"
                        value={form.data.delivered_at}
                        onChange={(value) =>
                            form.setData({
                                ...form.data,
                                delivered_at: value,
                                plan_ends_at: planEndDate(
                                    value,
                                    form.data.plan_period,
                                ),
                            })
                        }
                    />
                    <InputError message={form.errors.delivered_at} />
                    <div className="space-y-1.5">
                        <AdminNeuInsetDateInput
                            id="entrega_plan_ends_at"
                            label="Finalización del plan"
                            value={form.data.plan_ends_at}
                            onChange={(value) =>
                                form.setData('plan_ends_at', value)
                            }
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Se calcula al elegir el plan. Puedes ajustarla si la
                            vigencia real es otra.
                        </p>
                        <InputError message={form.errors.plan_ends_at} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="entrega_invoice_file">
                            Factura
                        </AdminUnderlineLabel>
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#b45309]/40 bg-[#b45309]/6 px-3 py-3 text-[12px] text-foreground">
                            <FileText className="size-4 shrink-0 text-[#b45309]" />
                            <span className="min-w-0 truncate">
                                {form.data.invoice_file?.name ??
                                    'PDF o imagen (máx. 10 MB)'}
                            </span>
                            <input
                                id="entrega_invoice_file"
                                name="invoice_file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                                className="sr-only"
                                onChange={(event) =>
                                    form.setData(
                                        'invoice_file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                        </label>
                        {mode === 'edit' && delivery?.has_invoice ? (
                            <a
                                href={deliveryInvoiceUrl(delivery.id)}
                                className="text-[11px] font-medium text-[#b45309] underline-offset-2 hover:underline"
                            >
                                Archivo actual:{' '}
                                {delivery.invoice_original_name ?? 'factura'}
                            </a>
                        ) : null}
                        <InputError message={form.errors.invoice_file} />
                    </div>
                    <div className="space-y-1.5">
                        <AdminUnderlineLabel htmlFor="entrega_xml_file">
                            XML
                        </AdminUnderlineLabel>
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#8B5CF6]/40 bg-[#8B5CF6]/8 px-3 py-3 text-[12px] text-foreground">
                            <FileCode2 className="size-4 shrink-0 text-[#8B5CF6]" />
                            <span className="min-w-0 truncate">
                                {form.data.xml_file?.name ??
                                    'Archivo .xml (máx. 5 MB)'}
                            </span>
                            <input
                                id="entrega_xml_file"
                                name="xml_file"
                                type="file"
                                accept=".xml,text/xml,application/xml"
                                className="sr-only"
                                onChange={(event) =>
                                    form.setData(
                                        'xml_file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                        </label>
                        {mode === 'edit' && delivery?.has_xml ? (
                            <a
                                href={deliveryXmlUrl(delivery.id)}
                                className="text-[11px] font-medium text-[#8B5CF6] underline-offset-2 hover:underline"
                            >
                                Archivo actual:{' '}
                                {delivery.xml_original_name ?? 'comprobante.xml'}
                            </a>
                        ) : null}
                        <InputError message={form.errors.xml_file} />
                    </div>
                </div>
            </NeuCardRaised>

            <div className="flex justify-end">
                <NeuButtonRaised
                    type="submit"
                    disabled={form.processing}
                    className="cursor-pointer px-5"
                >
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {mode === 'edit' ? 'Guardar cambios' : 'Registrar entrega'}
                </NeuButtonRaised>
            </div>
        </form>
    );
}
