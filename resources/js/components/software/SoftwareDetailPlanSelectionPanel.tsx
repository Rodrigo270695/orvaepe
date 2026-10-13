'use client';

import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, CreditCard, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import { cn } from '@/lib/utils';

import '@/components/checkout/checkout-orvae.css';

type Props = {
    eyebrow: string;
    selectionTitle: string;
    /** Hay un plan elegido (aunque no tenga precio en texto). */
    planSelected: boolean;
    /** Checkout en web (plan de pago o activación gratuita). */
    webCheckoutEnabled?: boolean;
    /** Suscripción SaaS sin cobro (sin pasarela). */
    isFreeSubscription?: boolean;
    /** Si es false (precio 0 / solo cotización), se ocultan pago y carrito. */
    purchaseEnabled?: boolean;
    /** Enlace wa.me cuando no hay checkout web. */
    whatsappHref?: string;
    /** Texto de precio (ej. desde catálogo / SKU). */
    priceLine?: string;
    /** Línea pequeña bajo el precio (disclaimer). */
    priceCaption?: string;
    /** Checkout en curso (deshabilita acciones). */
    payInProgress?: boolean;
    /** Mensaje de error de pasarela o red. */
    payError?: string | null;
    onPay: () => void;
    onAdd: () => void;
    addedCount: number;
};

export default function SoftwareDetailPlanSelectionPanel({
    eyebrow,
    selectionTitle,
    planSelected,
    webCheckoutEnabled = false,
    isFreeSubscription = false,
    purchaseEnabled = true,
    whatsappHref,
    priceLine,
    priceCaption,
    payInProgress = false,
    payError = null,
    onPay,
    onAdd,
    addedCount,
}: Props) {
    const hasPrice = Boolean(priceLine?.trim());
    const showConsultation = planSelected && !webCheckoutEnabled;
    const showFreeActivation = planSelected && isFreeSubscription;
    const showPaidCheckout = planSelected && webCheckoutEnabled && !isFreeSubscription;
    const added = purchaseEnabled && addedCount > 0;

    return (
        <div className="co-glass relative overflow-hidden rounded-3xl">
            <div className="co-line" aria-hidden />
            <div className="p-6 md:p-8">
                {showPaidCheckout || showFreeActivation ? (
                    <CheckoutSteps current={added ? 1 : 0} className="mb-7 max-w-2xl" />
                ) : null}

                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                    <div className="min-w-0 flex-1 space-y-2.5">
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c2410c] dark:text-[#fb923c]">
                            {eyebrow}
                        </p>
                        <p className="text-pretty text-lg font-bold leading-snug text-foreground md:text-xl">
                            {selectionTitle}
                        </p>

                        {showConsultation ? (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Este plan no tiene precio publicado en la web. Te cotizamos el alcance según tu
                                proyecto.
                            </p>
                        ) : showFreeActivation ? (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Activación directa, sin pasarela de pago. Al confirmar procesamos tu suscripción
                                gratuita.
                            </p>
                        ) : hasPrice ? (
                            <div className="pt-1">
                                <p
                                    className="font-display text-3xl font-bold tracking-tight text-foreground tabular-nums sm:text-4xl"
                                    style={{ fontFeatureSettings: '"tnum" 1' }}
                                >
                                    {priceLine}
                                </p>
                                {priceCaption ? (
                                    <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
                                        {priceCaption}
                                    </p>
                                ) : null}
                            </div>
                        ) : !planSelected ? (
                            <p className="text-sm text-muted-foreground">
                                Selecciona un plan para ver el importe y continuar.
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No hay precio publicado en texto para este plan; revisa el detalle en el
                                catálogo.
                            </p>
                        )}
                    </div>

                    <div className="flex w-full flex-shrink-0 flex-col gap-3 sm:flex-row sm:justify-end lg:w-auto">
                        {showConsultation && whatsappHref ? (
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[0.875rem] px-6 py-3 text-sm font-semibold sm:w-auto',
                                    'bg-[#0e7266] text-white shadow-[0_12px_26px_-14px_#0e7266] transition-colors hover:bg-[#0b5d53]',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7266] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                )}
                            >
                                <MessageCircle className="size-4 shrink-0" aria-hidden />
                                Cotizar por WhatsApp
                            </a>
                        ) : showFreeActivation ? (
                            <button
                                type="button"
                                disabled={!planSelected || payInProgress}
                                className="co-cta w-full sm:w-auto"
                                onClick={onPay}
                            >
                                <Sparkles className="size-4" aria-hidden />
                                {payInProgress ? 'Activando…' : 'Activar suscripción gratis'}
                            </button>
                        ) : showPaidCheckout ? (
                            <>
                                <button
                                    type="button"
                                    disabled={!planSelected || payInProgress}
                                    className="co-ghost w-full sm:w-auto"
                                    onClick={onPay}
                                >
                                    <CreditCard className="size-4" aria-hidden />
                                    {payInProgress ? 'Conectando…' : 'Comprar ahora'}
                                </button>
                                <button
                                    type="button"
                                    disabled={!planSelected || !purchaseEnabled}
                                    className="co-cta w-full sm:w-auto"
                                    onClick={onAdd}
                                >
                                    <ShoppingCart className="size-4" aria-hidden />
                                    Agregar al carrito
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>

                {payError?.trim() ? (
                    <p
                        className="mt-6 rounded-xl border border-[color-mix(in_oklab,var(--destructive)_35%,var(--border))] bg-[color-mix(in_oklab,var(--destructive)_8%,var(--background))] px-3.5 py-3 text-sm text-foreground"
                        role="alert"
                    >
                        {payError}
                    </p>
                ) : null}

                {added ? (
                    <div
                        className="co-pop mt-7 flex flex-col gap-3 rounded-2xl border border-[color-mix(in_oklab,#0d9488_35%,var(--border))] bg-[color-mix(in_oklab,#0d9488_8%,var(--background))] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                        role="status"
                    >
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                            <CheckCircle2 className="size-5 shrink-0 text-[#0d9488]" aria-hidden />
                            Agregado al carrito ({addedCount} {addedCount === 1 ? 'unidad' : 'unidades'})
                        </p>
                        <Link href="/carrito" className="co-cta min-h-11 px-5 py-2.5 text-sm">
                            Ver carrito y pagar
                            <ArrowRight className="size-4" aria-hidden />
                        </Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
