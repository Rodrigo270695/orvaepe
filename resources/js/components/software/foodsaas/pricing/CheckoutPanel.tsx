import { CreditCard, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react';

import type { FoodSaaSPurchaseProps } from '../types';

type Props = FoodSaaSPurchaseProps;

export default function CheckoutPanel({
    selectedPlan,
    purchaseEnabled,
    webCheckoutEnabled,
    isFreeSubscription,
    checkoutLoading,
    checkoutError,
    selectionTitle,
    selectionPriceLine,
    selectionPriceCaption,
    consultationWhatsAppHref,
    addedCount,
    onAddToCart,
    onStartCheckout,
}: Props) {
    const selected = Boolean(selectedPlan);
    const consultation = selected && !webCheckoutEnabled;
    const freeActivation = selected && isFreeSubscription;
    const paidCheckout = selected && webCheckoutEnabled && !isFreeSubscription;

    return (
        <div
            id="fs-checkout"
            className="relative mt-14 scroll-mt-32 overflow-hidden rounded-[1.75rem] border p-6 sm:p-8"
            style={{
                borderColor: 'color-mix(in srgb, var(--fs-wine) 45%, transparent)',
                background: 'var(--fs-band)',
                color: 'var(--fs-on-band)',
            }}
        >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <p className="fs-kicker" style={{ color: 'var(--fs-on-band)' }}>
                        {selected ? 'Tu selección' : 'Siguiente paso'}
                    </p>
                    <p className="fs-display mt-2 text-2xl sm:text-3xl">{selected ? selectionTitle : 'Elige un plan para continuar'}</p>
                    {consultation ? (
                        <p className="mt-2 font-sans text-sm opacity-80">Te cotizamos el alcance por WhatsApp.</p>
                    ) : freeActivation ? (
                        <p className="mt-2 max-w-lg font-sans text-sm opacity-80">
                            Activación directa, sin pasarela. Al confirmar entras a crear tu contraseña.
                        </p>
                    ) : selectionPriceLine ? (
                        <div className="mt-2">
                            <p className="font-sans text-xl font-semibold tabular-nums">{selectionPriceLine}</p>
                            {selectionPriceCaption ? (
                                <p className="mt-1 max-w-md font-sans text-xs opacity-75">{selectionPriceCaption}</p>
                            ) : null}
                        </div>
                    ) : (
                        <p className="mt-2 font-sans text-sm opacity-80">
                            Salón, pedidos, cocina y caja van en la base. El resto se abre según el plan.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {!selected ? (
                        <a href="#planes" className="fs-btn-ghost" style={{ color: 'var(--fs-on-band)', borderColor: 'currentColor' }}>
                            Ver planes
                        </a>
                    ) : null}
                    {consultation && consultationWhatsAppHref ? (
                        <a href={consultationWhatsAppHref} target="_blank" rel="noopener noreferrer" className="fs-btn">
                            <MessageCircle className="size-4" aria-hidden />
                            Contactar por WhatsApp
                        </a>
                    ) : null}
                    {freeActivation ? (
                        <button type="button" className="fs-btn" disabled={checkoutLoading} onClick={onStartCheckout}>
                            <Sparkles className="size-4" aria-hidden />
                            {checkoutLoading ? 'Activando…' : 'Activar suscripción gratis'}
                        </button>
                    ) : null}
                    {paidCheckout ? (
                        <>
                            <button
                                type="button"
                                className="fs-btn-ghost"
                                style={{ color: 'var(--fs-on-band)', borderColor: 'currentColor' }}
                                disabled={!purchaseEnabled}
                                onClick={onAddToCart}
                            >
                                <ShoppingCart className="size-4" aria-hidden />
                                Agregar al carrito
                            </button>
                            <button type="button" className="fs-btn" disabled={checkoutLoading} onClick={onStartCheckout}>
                                <CreditCard className="size-4" aria-hidden />
                                {checkoutLoading ? 'Conectando…' : 'Ir a pagar'}
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            {checkoutError?.trim() ? (
                <p className="mt-5 font-sans text-sm text-[var(--fs-danger)]" role="alert">
                    {checkoutError}
                </p>
            ) : null}

            {purchaseEnabled && addedCount > 0 ? (
                <p role="status" className="mt-5 inline-flex items-center gap-2 rounded-full border border-current/30 px-4 py-2 font-sans text-sm font-semibold">
                    Agregado al carrito ({addedCount} {addedCount === 1 ? 'unidad' : 'unidades'})
                </p>
            ) : null}
        </div>
    );
}
