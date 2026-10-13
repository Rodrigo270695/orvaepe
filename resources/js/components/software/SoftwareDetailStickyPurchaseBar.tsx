'use client';

import { CreditCard, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

import '@/components/checkout/checkout-orvae.css';

export default function SoftwareDetailStickyPurchaseBar({
    selectedPlanLabel,
    priceLine,
    planReady,
    webCheckoutEnabled = false,
    isFreeSubscription = false,
    purchaseEnabled = true,
    whatsappHref,
    payInProgress = false,
    payError = null,
    onPay,
    onAdd,
}: {
    selectedPlanLabel: string;
    /** Una línea corta de precio (opcional). */
    priceLine?: string;
    planReady: boolean;
    webCheckoutEnabled?: boolean;
    isFreeSubscription?: boolean;
    purchaseEnabled?: boolean;
    whatsappHref?: string;
    payInProgress?: boolean;
    payError?: string | null;
    onPay: () => void;
    onAdd: () => void;
}) {
    const hasPrice = Boolean(priceLine?.trim());
    const showConsultation = planReady && !webCheckoutEnabled;
    const showFreeActivation = planReady && isFreeSubscription;
    const showPaidCheckout = planReady && webCheckoutEnabled && !isFreeSubscription;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
            <div className="co-glass relative overflow-hidden rounded-2xl">
                <div className="co-line" aria-hidden />
                <div className="flex flex-col gap-2.5 p-3">
                    <div className="flex min-w-0 items-baseline justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                            {selectedPlanLabel}
                        </p>
                        {hasPrice ? (
                            <p
                                className="shrink-0 font-display text-base font-bold tabular-nums text-foreground"
                                style={{ fontFeatureSettings: '"tnum" 1' }}
                            >
                                {priceLine}
                            </p>
                        ) : showFreeActivation ? (
                            <p className="shrink-0 text-sm font-bold text-[#0f766e] dark:text-[#2dd4bf]">Gratis</p>
                        ) : null}
                    </div>

                    {payError?.trim() ? (
                        <p className="text-xs leading-relaxed text-[var(--state-danger)]" role="alert">
                            {payError}
                        </p>
                    ) : null}

                    <div className="flex items-stretch gap-2">
                        {showConsultation && whatsappHref ? (
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[0.875rem] px-3 text-sm font-semibold',
                                    'bg-[#0e7266] text-white transition-colors hover:bg-[#0b5d53]',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7266] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                )}
                            >
                                <MessageCircle className="size-4 shrink-0" aria-hidden />
                                Cotizar por WhatsApp
                            </a>
                        ) : showFreeActivation ? (
                            <button
                                type="button"
                                disabled={!planReady || payInProgress}
                                className="co-cta w-full px-3"
                                onClick={onPay}
                            >
                                <Sparkles className="size-4" aria-hidden />
                                {payInProgress ? 'Activando…' : 'Activar gratis'}
                            </button>
                        ) : showPaidCheckout ? (
                            <>
                                <button
                                    type="button"
                                    disabled={!planReady || payInProgress}
                                    className="co-ghost flex-1 px-3"
                                    onClick={onPay}
                                >
                                    <CreditCard className="size-4 shrink-0" aria-hidden />
                                    {payInProgress ? 'Conectando…' : 'Comprar'}
                                </button>
                                <button
                                    type="button"
                                    disabled={!planReady || !purchaseEnabled}
                                    className="co-cta flex-[1.3] px-3"
                                    onClick={onAdd}
                                >
                                    <ShoppingCart className="size-4 shrink-0" aria-hidden />
                                    Al carrito
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
