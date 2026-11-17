import { usePlanTiers } from '@/components/software/vetsaas/pricing/usePlanTiers';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import { WHATSAPP_HREF } from '../data';
import type { FoodSaaSPurchaseProps } from '../types';

type Props = FoodSaaSPurchaseProps & {
    plans: SoftwarePricingPlan[];
};

export default function PricingSection({ plans, ...checkout }: Props) {
    const { period, setPeriod, canToggle, visiblePlans, activeKey } = usePlanTiers(
        plans,
        checkout.selectedPlanId,
        checkout.onSelectPlanId,
    );
    const talk = checkout.consultationWhatsAppHref || WHATSAPP_HREF;

    return (
        <section id="planes" className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28" style={{ background: '#fffaf4' }}>
            <div className="mx-auto max-w-6xl">
                <p className="fs-kicker">Precios en soles</p>
                <h2 className="fs-display mt-4 max-w-xl text-4xl text-[var(--fs-wine-deep)] sm:text-6xl">
                    Elige el cubierto. El piso ya está servido.
                </h2>
                <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-[var(--fs-muted)]">
                    Salón, pedidos, cocina y caja van en la base. Delivery, reservas y SUNAT se abren según el plan publicado en el catálogo.
                </p>

                {canToggle ? (
                    <div className="mt-8 inline-flex rounded-full border border-[#c4a574] p-1 font-sans text-sm" role="group" aria-label="Ciclo de pago">
                        {(['monthly', 'annual'] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                className="cursor-pointer rounded-full px-4 py-2"
                                style={{
                                    background: period === value ? 'var(--fs-wine)' : 'transparent',
                                    color: period === value ? '#fffaf4' : 'var(--fs-wine-deep)',
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
                    <div className="mt-12 max-w-xl border border-[#c4a574] bg-[var(--fs-paper)] px-6 py-8">
                        <p className="font-sans text-base leading-relaxed text-[var(--fs-muted)]">
                            Los planes se publican desde el catálogo de ORVAE. Mientras tanto, un asesor te arma el cubierto de tu local.
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
                                            borderColor: active ? 'var(--fs-wine)' : '#c4a574',
                                            background: active ? 'var(--fs-wine)' : '#fffaf4',
                                            color: active ? '#fffaf4' : 'var(--fs-ink)',
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

                <div id="fs-checkout" className="mt-10 flex flex-col gap-4 border-t border-[#c4a574] pt-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="fs-kicker">{checkout.selectedPlan ? 'Tu selección' : 'Siguiente paso'}</p>
                        <p className="fs-display mt-2 text-3xl text-[var(--fs-wine-deep)]">
                            {checkout.selectedPlan ? checkout.selectionTitle : 'Elige un plan para activar'}
                        </p>
                        {checkout.selectionPriceLine ? (
                            <p className="mt-2 font-sans text-sm text-[var(--fs-muted)]">
                                {checkout.selectionPriceLine}
                                {checkout.selectionPriceCaption ? ` · ${checkout.selectionPriceCaption}` : ''}
                            </p>
                        ) : null}
                        {checkout.checkoutError ? (
                            <p className="mt-2 font-sans text-sm text-[#9f1239]" role="alert">
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
            </div>
        </section>
    );
}
