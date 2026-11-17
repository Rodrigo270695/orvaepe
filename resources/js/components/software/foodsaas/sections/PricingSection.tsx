import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';

import { usePlanTiers } from '@/components/software/vetsaas/pricing/usePlanTiers';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import { WHATSAPP_HREF } from '../data';
import FoodSaaSReveal from '../FoodSaaSReveal';
import type { FoodSaaSMarketing, FoodSaaSMarketingPlan, FoodSaaSPurchaseProps } from '../types';

type Props = FoodSaaSPurchaseProps & {
    plans: SoftwarePricingPlan[];
    marketing?: FoodSaaSMarketing | null;
};

function soles(value: number | null): string {
    if (value == null) {
        return 'A consultar';
    }

    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value);
}

const LIMIT_ROWS: Array<[string, string]> = [
    ['max_sedes', 'Sedes'],
    ['max_usuarios', 'Usuarios'],
    ['max_mesas', 'Mesas'],
    ['max_productos', 'Productos'],
    ['max_pedidos_mes', 'Pedidos / mes'],
    ['modulo_delivery', 'Delivery'],
    ['modulo_reservas', 'Reservas'],
    ['boletas_electronicas', 'Boleta SUNAT'],
    ['facturas_electronicas', 'Factura SUNAT'],
    ['max_comprobantes_mes', 'Comprobantes / mes'],
];

function featureValue(value: number | boolean | string | null | undefined): string {
    if (typeof value === 'boolean') {
        return value ? 'Sí' : 'No';
    }
    if (typeof value === 'number') {
        if (value < 0) {
            return 'Ilimitado';
        }
        if (value === 0) {
            return 'No incluye';
        }

        return new Intl.NumberFormat('es-PE').format(value);
    }

    return value == null || value === '' ? '—' : String(value);
}

function skuFor(plans: SoftwarePricingPlan[], codigo: string, period: 'monthly' | 'annual'): SoftwarePricingPlan | undefined {
    const needle = codigo.toLowerCase();

    return plans.find((plan) => {
        const code = `${plan.planCode ?? ''} ${plan.label}`.toLowerCase();
        if (!code.includes(needle)) {
            return false;
        }
        const annual = plan.billingInterval === 'annual' || /anual|annual/.test(code);

        return period === 'annual' ? annual : !annual;
    });
}

function FoodPlanCard({
    plan,
    period,
    active,
    featured,
    linked,
    onChoose,
}: {
    plan: FoodSaaSMarketingPlan;
    period: 'monthly' | 'annual';
    active: boolean;
    featured: boolean;
    linked: boolean;
    onChoose: () => void;
}) {
    const annual = period === 'annual' && plan.precio_anual != null;
    const amount = annual ? plan.precio_anual : plan.precio_mensual;
    const free = amount == null || amount <= 0;

    return (
        <li className="h-full">
            <article
                className="flex h-full flex-col rounded-[1.6rem] border p-5"
                style={{
                    borderColor: active || featured ? 'var(--fs-wine)' : 'var(--fs-rule)',
                    background: featured ? 'var(--fs-band)' : 'var(--fs-paper)',
                    color: featured ? 'var(--fs-on-band)' : 'var(--fs-ink)',
                    boxShadow: active ? '0 0 0 2px var(--fs-wine)' : undefined,
                }}
            >
                <div className="flex items-start justify-between gap-2">
                    <h3 className="fs-display text-2xl">{plan.nombre}</h3>
                    {plan.badge ? (
                        <span
                            className="shrink-0 rounded-full px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide"
                            style={{
                                background: featured ? 'var(--fs-on-band)' : 'transparent',
                                color: featured ? 'var(--fs-band)' : 'var(--fs-wine)',
                                border: featured ? 'none' : '1px solid var(--fs-rule)',
                            }}
                        >
                            {plan.badge}
                        </span>
                    ) : null}
                </div>
                {plan.descripcion ? (
                    <p className="mt-2 min-h-10 font-sans text-sm leading-snug opacity-80">{plan.descripcion}</p>
                ) : (
                    <p className="mt-2 min-h-10 font-sans text-sm leading-snug opacity-80">
                        {free ? 'Para conocer el sistema sin compromiso.' : 'Salón, cocina y caja listos para abrir el turno.'}
                    </p>
                )}
                <p className="mt-5 font-sans text-3xl font-semibold tabular-nums">
                    {free ? 'Gratis' : soles(amount)}
                    {free ? null : <span className="ml-1 text-sm font-medium opacity-75">{annual ? '/ año' : '/ mes'}</span>}
                </p>
                <p className="mt-1 font-sans text-xs opacity-70">{free ? 'Sin tarjeta ni pasarela de pago' : 'IGV incluido'}</p>
                {plan.trial_days > 0 ? (
                    <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 font-sans text-xs">
                        <span className="size-1.5 rounded-full bg-current" aria-hidden />
                        {plan.trial_days} días de prueba
                    </p>
                ) : null}
                <button
                    type="button"
                    onClick={onChoose}
                    aria-pressed={active}
                    className="mt-5 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-sans text-sm font-semibold"
                    style={{
                        background: active || featured ? 'var(--fs-btn)' : 'transparent',
                        color: active || featured ? 'var(--fs-btn-ink)' : 'inherit',
                        border: active || featured ? 'none' : '1px solid var(--fs-rule)',
                    }}
                >
                    {active ? (
                        <>
                            <Check className="size-4" aria-hidden /> Plan elegido
                        </>
                    ) : (
                        'Elegir plan'
                    )}
                </button>
                <dl className="mt-5 border-t border-current/15 text-sm">
                    {LIMIT_ROWS.map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between gap-3 border-b border-current/10 py-2">
                            <dt className="opacity-75">{label}</dt>
                            <dd className="font-semibold tabular-nums">{featureValue(plan.features[key])}</dd>
                        </div>
                    ))}
                </dl>
                {linked ? null : (
                    <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.14em] opacity-70">Actívalo con ventas</p>
                )}
            </article>
        </li>
    );
}

export default function PricingSection({ plans, marketing, ...checkout }: Props) {
    const remote = marketing?.plans ?? [];

    if (remote.length > 0) {
        return <RemotePlans plans={plans} marketing={marketing!} checkout={checkout} />;
    }

    return <CatalogPlans plans={plans} checkout={checkout} />;
}

function RemotePlans({
    plans,
    marketing,
    checkout,
}: {
    plans: SoftwarePricingPlan[];
    marketing: FoodSaaSMarketing;
    checkout: FoodSaaSPurchaseProps;
}) {
    const talk = checkout.consultationWhatsAppHref || WHATSAPP_HREF;
    const canToggle = marketing.plans.some((plan) => plan.precio_anual != null && plan.precio_anual > 0);
    const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');
    const [picked, setPicked] = useState<string | null>(null);

    const activeCodigo = useMemo(() => {
        if (picked) {
            return picked;
        }
        const selected = plans.find((plan) => plan.id === checkout.selectedPlanId);
        const code = selected?.planCode?.toLowerCase() ?? '';
        const hit = marketing.plans.find((plan) => code.includes(plan.codigo));

        return hit?.codigo ?? null;
    }, [picked, plans, checkout.selectedPlanId, marketing.plans]);

    const choose = (codigo: string) => {
        setPicked(codigo);
        const sku = skuFor(plans, codigo, period);
        if (sku) {
            checkout.onSelectPlanId(sku.id);
        }
    };

    return (
        <section id="planes" className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28" style={{ background: 'var(--fs-paper-2)' }}>
            <div className="mx-auto max-w-7xl">
                <FoodSaaSReveal>
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="fs-kicker">Precios en soles · IGV incluido</p>
                        <h2 className="fs-display mt-4 text-4xl text-[var(--fs-wine-deep)] sm:text-6xl">
                            El piso va en todos. Cambia el tamaño de la casa.
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl font-sans text-sm leading-relaxed text-[var(--fs-muted)]">
                            Salón, pedidos, cocina y caja van en la base.                         Delivery, reservas y SUNAT se abren según el plan.
                        </p>
                    </div>
                </FoodSaaSReveal>

                {canToggle ? (
                    <div className="mx-auto mt-8 flex w-fit rounded-full border border-[var(--fs-rule)] p-1 font-sans text-sm" role="group" aria-label="Ciclo de pago">
                        {(['monthly', 'annual'] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                className="cursor-pointer rounded-full px-4 py-2"
                                style={{
                                    background: period === value ? 'var(--fs-btn)' : 'transparent',
                                    color: period === value ? 'var(--fs-btn-ink)' : 'var(--fs-wine-deep)',
                                }}
                                aria-pressed={period === value}
                                onClick={() => {
                                    setPeriod(value);
                                    if (activeCodigo) {
                                        const sku = skuFor(plans, activeCodigo, value);
                                        if (sku) {
                                            checkout.onSelectPlanId(sku.id);
                                        }
                                    }
                                }}
                            >
                                {value === 'monthly' ? 'Mensual' : 'Anual'}
                            </button>
                        ))}
                    </div>
                ) : null}

                <ul className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {marketing.plans.map((plan) => (
                        <FoodPlanCard
                            key={plan.codigo}
                            plan={plan}
                            period={period}
                            active={activeCodigo === plan.codigo}
                            featured={plan.codigo === 'pro'}
                            linked={Boolean(skuFor(plans, plan.codigo, period))}
                            onChoose={() => choose(plan.codigo)}
                        />
                    ))}
                </ul>

                {marketing.comparison.length > 0 ? (
                    <div className="mt-14 overflow-x-auto">
                        <table className="w-full min-w-[40rem] border-collapse font-sans text-sm">
                            <caption className="fs-kicker mb-4 text-left">Qué abre cada plan</caption>
                            <thead>
                                <tr>
                                    <th className="border-b border-[var(--fs-rule)] px-3 py-3 text-left font-medium text-[var(--fs-muted)]">Incluye</th>
                                    {marketing.plans.map((plan) => (
                                        <th key={plan.codigo} className="border-b border-[var(--fs-rule)] px-3 py-3 text-left font-semibold text-[var(--fs-ink)]">
                                            {plan.nombre}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {marketing.comparison.map((row) => (
                                    <tr key={row.key}>
                                        <th className="border-b border-[var(--fs-rule)] px-3 py-3 text-left font-medium text-[var(--fs-muted)]">{row.label}</th>
                                        {marketing.plans.map((plan) => (
                                            <td key={plan.codigo} className="border-b border-[var(--fs-rule)] px-3 py-3 text-[var(--fs-ink)]">
                                                {row.values[plan.codigo] ?? '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                <CheckoutBar
                    checkout={checkout}
                    talk={talk}
                    ready={Boolean(checkout.selectedPlan) || activeCodigo !== null}
                    idleTitle={
                        activeCodigo
                            ? `${marketing.plans.find((plan) => plan.codigo === activeCodigo)?.nombre ?? 'Plan'} · actívalo con ventas`
                            : undefined
                    }
                />
            </div>
        </section>
    );
}

function CatalogPlans({ plans, checkout }: { plans: SoftwarePricingPlan[]; checkout: FoodSaaSPurchaseProps }) {
    const { period, setPeriod, canToggle, visiblePlans, activeKey } = usePlanTiers(
        plans,
        checkout.selectedPlanId,
        checkout.onSelectPlanId,
    );
    const talk = checkout.consultationWhatsAppHref || WHATSAPP_HREF;

    return (
        <section id="planes" className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28" style={{ background: 'var(--fs-paper-2)' }}>
            <div className="mx-auto max-w-6xl">
                <p className="fs-kicker">Precios en soles</p>
                <h2 className="fs-display mt-4 max-w-xl text-4xl text-[var(--fs-wine-deep)] sm:text-6xl">
                    Elige el cubierto. El piso ya está servido.
                </h2>
                <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-[var(--fs-muted)]">
                    Salón, pedidos, cocina y caja van en la base. Delivery, reservas y SUNAT se abren según el plan publicado en FoodSaaS.
                </p>

                {canToggle ? (
                    <div className="mt-8 inline-flex rounded-full border border-[var(--fs-rule)] p-1 font-sans text-sm" role="group" aria-label="Ciclo de pago">
                        {(['monthly', 'annual'] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                className="cursor-pointer rounded-full px-4 py-2"
                                style={{
                                    background: period === value ? 'var(--fs-btn)' : 'transparent',
                                    color: period === value ? 'var(--fs-btn-ink)' : 'var(--fs-wine-deep)',
                                }}
                                aria-pressed={period === value}
                                onClick={() => setPeriod(value)}
                            >
                                {value === 'monthly' ? 'Mensual' : 'Anual'}
                            </button>
                        ))}
                    </div>
                ) : null}

                {visiblePlans.length === 0 ? (
                    <div className="mt-12 max-w-xl border border-[var(--fs-rule)] bg-[var(--fs-paper)] px-6 py-8">
                        <p className="font-sans text-base leading-relaxed text-[var(--fs-muted)]">
                            FoodSaaS todavía no publicó planes públicos. Un asesor te arma el cubierto de tu local.
                        </p>
                        <a href={talk} className="fs-btn mt-6" target="_blank" rel="noopener noreferrer">
                            Hablar con ventas
                        </a>
                    </div>
                ) : (
                    <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {visiblePlans.map(({ key, title, plan }) => {
                            const active = activeKey === key;
                            const price = plan.priceNowText || plan.priceText;

                            return (
                                <li key={key}>
                                    <button
                                        type="button"
                                        className="fs-plan flex h-full w-full cursor-pointer flex-col rounded-3xl border px-6 py-6 text-left"
                                        style={{
                                            borderColor: active ? 'var(--fs-btn)' : 'var(--fs-rule)',
                                            background: active ? 'var(--fs-btn)' : 'var(--fs-paper)',
                                            color: active ? 'var(--fs-btn-ink)' : 'var(--fs-ink)',
                                        }}
                                        aria-pressed={active}
                                        onClick={() => checkout.onSelectPlanId(plan.id)}
                                    >
                                        <span className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-80">{title}</span>
                                        <span className="fs-display mt-3 text-3xl">{plan.label}</span>
                                        <span className="mt-4 font-sans text-2xl font-semibold tabular-nums">{price}</span>
                                        {plan.highlights.length > 0 ? (
                                            <ul className="mt-5 space-y-2 font-sans text-sm leading-relaxed opacity-90">
                                                {plan.highlights.slice(0, 5).map((item) => (
                                                    <li key={item}>{item}</li>
                                                ))}
                                            </ul>
                                        ) : null}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <CheckoutBar checkout={checkout} talk={talk} ready={Boolean(checkout.selectedPlan)} />
            </div>
        </section>
    );
}

function CheckoutBar({
    checkout,
    talk,
    ready,
    idleTitle,
}: {
    checkout: FoodSaaSPurchaseProps;
    talk: string;
    ready: boolean;
    idleTitle?: string;
}) {
    return (
        <div id="fs-checkout" className="mt-10 flex flex-col gap-4 border-t border-[var(--fs-rule)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="fs-kicker">{ready ? 'Tu selección' : 'Siguiente paso'}</p>
                <p className="fs-display mt-2 text-3xl text-[var(--fs-wine-deep)]">
                    {checkout.selectedPlan ? checkout.selectionTitle : idleTitle || 'Elige un plan para activar'}
                </p>
                {checkout.selectionPriceLine ? (
                    <p className="mt-2 font-sans text-sm text-[var(--fs-muted)]">
                        {checkout.selectionPriceLine}
                        {checkout.selectionPriceCaption ? ` · ${checkout.selectionPriceCaption}` : ''}
                    </p>
                ) : null}
                {checkout.checkoutError ? (
                    <p className="mt-2 font-sans text-sm text-[var(--fs-danger)]" role="alert">
                        {checkout.checkoutError}
                    </p>
                ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
                {checkout.selectedPlan && checkout.webCheckoutEnabled ? (
                    <button type="button" className="fs-btn" disabled={checkout.checkoutLoading} onClick={checkout.onStartCheckout}>
                        {checkout.isFreeSubscription ? 'Activar' : 'Continuar al pago'}
                    </button>
                ) : null}
                {checkout.selectedPlan && checkout.purchaseEnabled && !checkout.webCheckoutEnabled ? (
                    <button type="button" className="fs-btn" onClick={checkout.onAddToCart}>
                        Agregar al carrito{checkout.addedCount > 0 ? ` (${checkout.addedCount})` : ''}
                    </button>
                ) : null}
                <a href={talk} className="fs-btn-ghost" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                </a>
            </div>
        </div>
    );
}
