'use client';

import { CreditCard, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

export default function SoftwareDetailStickyPurchaseBar({
    selectedPlanLabel,
    priceLine,
    planReady,
    onPay,
    onAdd,
}: {
    selectedPlanLabel: string;
    /** Una línea corta de precio (opcional). */
    priceLine?: string;
    planReady: boolean;
    onPay: () => void;
    onAdd: () => void;
}) {
    const hasPrice = Boolean(priceLine?.trim());

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[color-mix(in_oklab,var(--background)_92%,transparent)] to-transparent"
                aria-hidden
            />
            <div
                className={cn(
                    'relative mx-auto w-full max-w-6xl border-t px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
                    'border-[color-mix(in_oklab,var(--border)_55%,transparent)]',
                    'bg-[color-mix(in_oklab,var(--card)_55%,transparent)] backdrop-blur-2xl',
                    'shadow-[0_-8px_40px_-12px_color-mix(in_oklab,var(--foreground)_14%,transparent)]',
                )}
            >
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--primary)_45%,transparent)] to-transparent opacity-80"
                    aria-hidden
                />
                <div className="relative flex flex-col gap-3 py-3">
                    <div className="min-w-0">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                            Selección actual
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-[var(--foreground)]">
                            {selectedPlanLabel}
                        </p>
                        {hasPrice ? (
                            <p
                                className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold tabular-nums text-[color-mix(in_oklab,var(--primary)_90%,var(--foreground))]"
                                style={{ fontFeatureSettings: '"tnum" 1' }}
                            >
                                {priceLine}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex flex-shrink-0 items-stretch gap-2">
                        <button
                            type="button"
                            disabled={!planReady}
                            className={cn(
                                'inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold',
                                'border-[color-mix(in_oklab,var(--border)_80%,transparent)]',
                                'bg-[color-mix(in_oklab,var(--background)_65%,transparent)] text-[var(--foreground)]',
                                'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                                'hover:border-[color-mix(in_oklab,var(--primary)_40%,var(--border))]',
                                'hover:bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]',
                                'active:scale-[0.98]',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                !planReady && 'pointer-events-none opacity-45',
                            )}
                            onClick={onPay}
                        >
                            <CreditCard className="size-3.5 shrink-0 opacity-90" aria-hidden />
                            Ir a pagar
                        </button>
                        <button
                            type="button"
                            disabled={!planReady}
                            className={cn(
                                'inline-flex flex-[1.15] cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold',
                                'bg-[var(--primary)] text-[var(--primary-foreground)]',
                                'shadow-[0_4px_22px_-6px_color-mix(in_oklab,var(--primary)_50%,transparent)]',
                                'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                                'hover:brightness-[1.07]',
                                'active:scale-[0.98]',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                !planReady && 'pointer-events-none opacity-45',
                            )}
                            onClick={onAdd}
                        >
                            Agregar
                            <Sparkles className="size-3.5" aria-hidden />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
