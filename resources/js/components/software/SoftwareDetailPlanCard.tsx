'use client';

import { Check } from 'lucide-react';

import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

export default function SoftwareDetailPlanCard({
    plan,
    isActive,
    accent = 'var(--state-info)',
    saleModelLabel,
    planPriceBefore,
    planPriceNow,
    showPriceAmount = true,
    onChoose,
}: {
    plan: SoftwarePricingPlan;
    isActive: boolean;
    accent?: string;
    saleModelLabel: string;
    planPriceBefore?: string;
    planPriceNow?: string;
    /** Si es false (precio 0 o solo cotización), no se muestra importe numérico. */
    showPriceAmount?: boolean;
    onChoose: () => void;
}) {
    return (
        <div
            className={[
                'group relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-0.5',
                isActive
                    ? 'border-[color-mix(in_oklab,var(--primary)_42%,var(--border))] bg-background/85 shadow-[0_8px_32px_-8px_color-mix(in_oklab,var(--foreground)_12%,transparent)]'
                    : 'border-[var(--border)] bg-background/60 hover:border-[color-mix(in_oklab,var(--primary)_28%,var(--border))] hover:shadow-[0_10px_36px_-10px_color-mix(in_oklab,var(--foreground)_14%,transparent)]',
            ].join(' ')}
            style={{
                borderLeft: `3px solid color-mix(in oklab, ${accent} 55%, var(--border))`,
            }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        `radial-gradient(ellipse at 50% 0%, color-mix(in oklab, ${accent} 15%, transparent) 0%, transparent 52%)`,
                }}
                aria-hidden
            />

            {isActive && (
                <div
                    className="pointer-events-none absolute -inset-px opacity-[0.18] blur-xl"
                    style={{
                        background:
                            `conic-gradient(from 190deg at 50% 0%, color-mix(in oklab, ${accent} 36%, transparent), transparent 40%, color-mix(in oklab, ${accent} 16%, transparent), transparent 72%)`,
                    }}
                    aria-hidden
                />
            )}

            <div className="relative">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-[var(--foreground)]">{plan.label}</h3>
                    <button
                        type="button"
                        disabled={isActive}
                        className={[
                            'inline-flex min-h-9 min-w-[5.5rem] items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            isActive
                                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] cursor-default opacity-95'
                                : 'bg-background text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)] hover:border-[color-mix(in_oklab,var(--primary)_32%,var(--border))] hover:bg-[color-mix(in_oklab,var(--primary)_6%,transparent)]',
                        ].join(' ')}
                        style={
                            isActive
                                ? {
                                      background: accent,
                                      color: 'color-mix(in oklab, white 94%, var(--foreground))',
                                  }
                                : {
                                      borderColor: `color-mix(in oklab, ${accent} 32%, var(--border))`,
                                  }
                        }
                        onClick={onChoose}
                    >
                        {isActive ? (
                            <>
                                <Check className="size-3.5" />
                                Seleccionado
                            </>
                        ) : (
                            'Elegir'
                        )}
                    </button>
                </div>

                <div className="mt-3">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)] opacity-85">
                        {saleModelLabel}
                    </p>

                    {showPriceAmount && planPriceBefore ? (
                        <p className="mt-2 text-sm font-semibold text-[var(--muted-foreground)] opacity-80 line-through">
                            {planPriceBefore}
                        </p>
                    ) : null}

                    {showPriceAmount ? (
                        <p className="mt-1 text-3xl font-bold text-[var(--foreground)] tabular-nums">
                            {planPriceNow ?? plan.priceText}
                        </p>
                    ) : (
                        <div className="mt-1 space-y-1">
                            <p className="text-lg font-semibold leading-snug text-[var(--muted-foreground)]">
                                Precio bajo cotización
                            </p>
                            <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                                Coordina alcance e importe con nosotros por WhatsApp.
                            </p>
                        </div>
                    )}
                </div>

                <ul className="mt-4 space-y-2">
                    {plan.highlights.map((h) => (
                        <li
                            key={h}
                            className="text-xs leading-relaxed text-[var(--muted-foreground)]"
                        >
                            - {h}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

