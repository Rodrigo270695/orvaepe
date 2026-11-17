import { useMemo, useState } from 'react';

import { usePlanTiers } from '@/components/software/vetsaas/pricing/usePlanTiers';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import { WHATSAPP_HREF } from '../data';
import FoodSaaSReveal from '../FoodSaaSReveal';
import type { FoodSaaSMarketing, FoodSaaSPurchaseProps } from '../types';

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
            <div className="mx-auto max-w-6xl">
                <FoodSaaSReveal>
                    <p className="fs-kicker">Precios en soles</p>
                    <h2 className="fs-display mt-4 max-w-xl text-4xl text-[var(--fs-wine-deep)] sm:text-6xl">
                        Elige el cubierto. El piso ya está servido.
                    </h2>
                    <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-[var(--fs-muted)]">
                        Salón, pedidos, cocina y caja van en la base. Delivery, reservas, WhatsApp y SUNAT se abren según el plan de FoodSaaS.
                    </p>
                </FoodSaaSReveal>

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

                <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {marketing.plans.map((plan) => {
                        const active = activeCodigo === plan.codigo;
                        const amount = period === 'annual' && plan.precio_anual != null ? plan.precio_anual : plan.precio_mensual;
                        const suffix = period === 'annual' && plan.precio_anual != null ? ' / año' : ' / mes';
                        const sku = skuFor(plans, plan.codigo, period);

                        return (
                            <li key={plan.codigo}>
                                <button
                                    type="button"
                                    className="fs-plan flex h-full w-full cursor-pointer flex-col rounded-3xl border px-6 py-6 text-left"
                                    style={{
                                        borderColor: active ? 'var(--fs-btn)' : 'var(--fs-rule)',
                                        background: active ? 'var(--fs-btn)' : 'var(--fs-paper)',
                                        color: active ? 'var(--fs-btn-ink)' : 'var(--fs-ink)',
                                    }}
                                    aria-pressed={active}
                                    onClick={() => choose(plan.codigo)}
                                >
                                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-80">
                                        {plan.badge || plan.codigo}
                                    </span>
                                    <span className="fs-display mt-3 text-3xl">{plan.nombre}</span>
                                    <span className="mt-4 font-sans text-2xl font-semibold tabular-nums">
                                        {soles(amount)}
                                        <span className="text-base font-medium opacity-80">{suffix}</span>
                                    </span>
                                    {plan.descripcion ? (
                                        <span className="mt-3 font-sans text-sm leading-relaxed opacity-90">{plan.descripcion}</span>
                                    ) : null}
                                    {plan.highlights.length > 0 ? (
                                        <ul className="mt-5 space-y-2 font-sans text-sm leading-relaxed opacity-90">
                                            {plan.highlights.slice(0, 6).map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    ) : null}
                                    {!sku ? (
                                        <span className="mt-4 font-sans text-xs uppercase tracking-[0.14em] opacity-75">
                                            Actívalo con ventas
                                        </span>
                                    ) : null}
                                </button>
                            </li>
                        );
                    })}
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
