import { CreditCard, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react';

import CheckIcon from '../CheckIcon';
import type { VetSaaSPurchaseProps } from '../types';

type Props = VetSaaSPurchaseProps & {
    selectionPriceCaption?: string;
    addedCount: number;
};

const PRIMARY_BTN =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#3CB88A] bg-[#3CB88A] px-6 py-3.5 text-sm font-semibold text-[#041910] shadow-[0_14px_30px_-12px_rgba(60,184,138,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#5CCB9F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3CB88A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#041910] active:translate-y-px disabled:pointer-events-none disabled:opacity-50';
const SECONDARY_BTN =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-[#3CB88A] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3CB88A] active:translate-y-px disabled:pointer-events-none disabled:opacity-50';

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
            id="vs-checkout"
            className="relative mt-14 scroll-mt-32 overflow-hidden rounded-[1.75rem] border border-[#3CB88A]/35 bg-gradient-to-br from-[#0A3427] via-[#072A20] to-[#06241C] p-6 shadow-[0_30px_80px_-40px_rgba(60,184,138,0.6)] sm:p-8"
        >
            <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#3CB88A]/20 blur-3xl" aria-hidden />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#7DCAA8]">
                        {selected ? 'Tu selección' : 'Siguiente paso'}
                    </p>
                    <p className="font-display mt-2 text-2xl font-semibold text-white sm:text-3xl">
                        {selected ? selectionTitle : 'Elige un plan para continuar'}
                    </p>
                    {consultation ? (
                        <p className="mt-2 text-sm text-[#9FCDB9]">Te cotizamos el alcance por WhatsApp.</p>
                    ) : freeActivation ? (
                        <p className="mt-2 max-w-lg text-sm text-[#9FCDB9]">
                            Activación directa, sin Mercado Pago ni PayPal. Al confirmar entras a crear tu contraseña.
                        </p>
                    ) : selectionPriceLine ? (
                        <div className="mt-2">
                            <p className="font-display text-xl font-semibold tabular-nums text-[#3CB88A]">{selectionPriceLine}</p>
                            {selectionPriceCaption ? (
                                <p className="mt-1 max-w-md text-xs text-[#7DCAA8]">{selectionPriceCaption}</p>
                            ) : null}
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-[#9FCDB9]">Todos los planes incluyen IA, WhatsApp y todos los módulos.</p>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {!selected ? (
                        <a href="#planes" className={SECONDARY_BTN}>
                            Ver planes
                        </a>
                    ) : null}
                    {consultation && consultationWhatsAppHref ? (
                        <a href={consultationWhatsAppHref} target="_blank" rel="noopener noreferrer" className={PRIMARY_BTN}>
                            <MessageCircle className="size-4" aria-hidden />
                            Contactar por WhatsApp
                        </a>
                    ) : null}
                    {freeActivation ? (
                        <button type="button" disabled={checkoutLoading} onClick={onStartCheckout} className={PRIMARY_BTN}>
                            <Sparkles className="size-4" aria-hidden />
                            {checkoutLoading ? 'Activando…' : 'Activar suscripción gratis'}
                        </button>
                    ) : null}
                    {paidCheckout ? (
                        <>
                            <button
                                type="button"
                                disabled={!purchaseEnabled}
                                onClick={onAddToCart}
                                className={SECONDARY_BTN}
                            >
                                <ShoppingCart className="size-4" aria-hidden />
                                Agregar al carrito
                            </button>
                            <button type="button" disabled={checkoutLoading} onClick={onStartCheckout} className={PRIMARY_BTN}>
                                <CreditCard className="size-4" aria-hidden />
                                {checkoutLoading ? 'Conectando…' : 'Ir a pagar'}
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            {checkoutError?.trim() ? (
                <p className="relative mt-5 text-sm text-[#FCA5A5]" role="alert">
                    {checkoutError}
                </p>
            ) : null}

            {purchaseEnabled && addedCount > 0 ? (
                <p
                    role="status"
                    className="vs-bubble relative mt-5 inline-flex items-center gap-2 rounded-full border border-[#3CB88A]/50 bg-[#3CB88A]/15 px-4 py-2 text-sm font-semibold text-[#99D2BC]"
                >
                    <CheckIcon />
                    Agregado al carrito ({addedCount} {addedCount === 1 ? 'unidad' : 'unidades'})
                </p>
            ) : null}
        </div>
    );
}
