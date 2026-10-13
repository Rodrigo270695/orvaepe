import { CreditCard, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react';

import type { TallerSaaSPurchaseProps } from '../types';

const PRIMARY =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#ea580c] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c2410c] disabled:pointer-events-none disabled:opacity-50';
const SECONDARY =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#ea580c] disabled:pointer-events-none disabled:opacity-50';

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
        <div id="ts-checkout" className="mt-14 scroll-mt-32 border border-[#ea580c]/40 bg-[#121a2b] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#f97316]">
                        {selected ? 'Tu selección' : 'Siguiente paso'}
                    </p>
                    <p className="font-display mt-2 text-3xl font-extrabold text-white">
                        {selected ? selectionTitle : 'Elige un plan para continuar'}
                    </p>
                    {consultation ? (
                        <p className="mt-2 text-sm text-[#cfc6b8]">Te cotizamos el alcance por WhatsApp.</p>
                    ) : freeActivation ? (
                        <p className="mt-2 max-w-lg text-sm text-[#cfc6b8]">
                            Activación directa, sin Mercado Pago ni PayPal. Al confirmar entras a crear tu contraseña.
                        </p>
                    ) : selectionPriceLine ? (
                        <div className="mt-2">
                            <p className="font-display text-xl font-bold tabular-nums text-[#ea580c]">{selectionPriceLine}</p>
                            {selectionPriceCaption ? (
                                <p className="mt-1 text-xs text-[#b7b0a4]">{selectionPriceCaption}</p>
                            ) : null}
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-[#cfc6b8]">Todos los módulos van en todos los planes.</p>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {!selected ? (
                        <a href="#planes" className={SECONDARY}>
                            Ver planes
                        </a>
                    ) : null}
                    {consultation && consultationWhatsAppHref ? (
                        <a href={consultationWhatsAppHref} target="_blank" rel="noopener noreferrer" className={PRIMARY}>
                            <MessageCircle className="size-4" aria-hidden />
                            Contactar por WhatsApp
                        </a>
                    ) : null}
                    {freeActivation ? (
                        <button type="button" disabled={checkoutLoading} onClick={onStartCheckout} className={PRIMARY}>
                            <Sparkles className="size-4" aria-hidden />
                            {checkoutLoading ? 'Activando…' : 'Activar suscripción gratis'}
                        </button>
                    ) : null}
                    {paidCheckout ? (
                        <>
                            <button type="button" disabled={!purchaseEnabled} onClick={onAddToCart} className={SECONDARY}>
                                <ShoppingCart className="size-4" aria-hidden />
                                Agregar al carrito
                            </button>
                            <button type="button" disabled={checkoutLoading} onClick={onStartCheckout} className={PRIMARY}>
                                <CreditCard className="size-4" aria-hidden />
                                {checkoutLoading ? 'Conectando…' : 'Ir a pagar'}
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            {checkoutError?.trim() ? (
                <p className="mt-5 text-sm text-[#FCA5A5]" role="alert">
                    {checkoutError}
                </p>
            ) : null}

            {purchaseEnabled && addedCount > 0 ? (
                <p role="status" className="mt-5 text-sm font-semibold text-[#f97316]">
                    Agregado al carrito ({addedCount})
                </p>
            ) : null}
        </div>
    );
}
