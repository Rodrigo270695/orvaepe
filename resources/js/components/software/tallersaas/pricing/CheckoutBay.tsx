import { CreditCard, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react';

import type { TallerSaaSPurchaseProps } from '../types';

type Props = TallerSaaSPurchaseProps;

export default function CheckoutBay({
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
            id="ts-checkout"
            className="mt-14 scroll-mt-32 border p-6 sm:p-8"
            style={{
                borderColor: 'color-mix(in srgb, var(--ts-ember) 40%, var(--ts-line))',
                background: 'var(--ts-surface)',
            }}
        >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--ts-ember)' }}>
                        {selected ? 'Tu selección' : 'Siguiente paso'}
                    </p>
                    <p className="font-display mt-2 text-3xl font-extrabold" style={{ color: 'var(--ts-ink-strong)' }}>
                        {selected ? selectionTitle : 'Elige un plan para continuar'}
                    </p>
                    {consultation ? (
                        <p className="mt-2 text-sm" style={{ color: 'var(--ts-muted)' }}>
                            Te cotizamos el alcance por WhatsApp.
                        </p>
                    ) : freeActivation ? (
                        <p className="mt-2 max-w-lg text-sm" style={{ color: 'var(--ts-muted)' }}>
                            Activación directa, sin Mercado Pago ni PayPal. Al confirmar entras a crear tu contraseña.
                        </p>
                    ) : selectionPriceLine ? (
                        <div className="mt-2">
                            <p className="font-display text-xl font-bold tabular-nums" style={{ color: 'var(--ts-ember)' }}>
                                {selectionPriceLine}
                            </p>
                            {selectionPriceCaption ? (
                                <p className="mt-1 text-xs" style={{ color: 'var(--ts-muted)' }}>
                                    {selectionPriceCaption}
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        <p className="mt-2 text-sm" style={{ color: 'var(--ts-muted)' }}>
                            Todos los módulos van en todos los planes.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {!selected ? (
                        <a href="#planes" className="ts-btn-ghost">
                            Ver planes
                        </a>
                    ) : null}
                    {consultation && consultationWhatsAppHref ? (
                        <a href={consultationWhatsAppHref} target="_blank" rel="noopener noreferrer" className="ts-btn">
                            <MessageCircle className="size-4" aria-hidden />
                            Contactar por WhatsApp
                        </a>
                    ) : null}
                    {freeActivation ? (
                        <button type="button" disabled={checkoutLoading} onClick={onStartCheckout} className="ts-btn">
                            <Sparkles className="size-4" aria-hidden />
                            {checkoutLoading ? 'Activando…' : 'Activar suscripción gratis'}
                        </button>
                    ) : null}
                    {paidCheckout ? (
                        <>
                            <button type="button" disabled={!purchaseEnabled} onClick={onAddToCart} className="ts-btn-ghost">
                                <ShoppingCart className="size-4" aria-hidden />
                                Agregar al carrito
                            </button>
                            <button type="button" disabled={checkoutLoading} onClick={onStartCheckout} className="ts-btn">
                                <CreditCard className="size-4" aria-hidden />
                                {checkoutLoading ? 'Conectando…' : 'Ir a pagar'}
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            {checkoutError?.trim() ? (
                <p className="mt-5 text-sm text-[#b91c1c] dark:text-[#FCA5A5]" role="alert">
                    {checkoutError}
                </p>
            ) : null}

            {purchaseEnabled && addedCount > 0 ? (
                <p role="status" className="mt-5 text-sm font-semibold" style={{ color: 'var(--ts-ember)' }}>
                    Agregado al carrito ({addedCount})
                </p>
            ) : null}
        </div>
    );
}
