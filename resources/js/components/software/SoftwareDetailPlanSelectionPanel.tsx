'use client';

import { CheckCircle2, CreditCard, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
    eyebrow: string;
    selectionTitle: string;
    /** Hay un plan elegido (aunque no tenga precio en texto). */
    planSelected: boolean;
    /** Texto de precio (ej. desde catálogo / SKU). */
    priceLine?: string;
    /** Línea pequeña bajo el precio (disclaimer). */
    priceCaption?: string;
    onPay: () => void;
    onAdd: () => void;
    addedCount: number;
};

export default function SoftwareDetailPlanSelectionPanel({
    eyebrow,
    selectionTitle,
    planSelected,
    priceLine,
    priceCaption,
    onPay,
    onAdd,
    addedCount,
}: Props) {
    const hasPrice = Boolean(priceLine?.trim());

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-[1.35rem] border p-6 shadow-2xl md:p-8',
                'border-[color-mix(in_oklab,var(--border)_50%,transparent)]',
                'bg-[color-mix(in_oklab,var(--card)_38%,transparent)] backdrop-blur-2xl',
                'shadow-[0_10px_50px_-18px_color-mix(in_oklab,var(--foreground)_18%,transparent),0_0_0_1px_color-mix(in_oklab,var(--primary)_14%,transparent)]',
                'transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                'hover:shadow-[0_16px_64px_-16px_color-mix(in_oklab,var(--primary)_26%,transparent)]',
            )}
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-90"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--state-info) 60%, transparent) 20%, color-mix(in oklab, var(--state-success) 58%, transparent) 40%, color-mix(in oklab, var(--state-alert) 58%, transparent) 62%, color-mix(in oklab, var(--state-danger) 56%, transparent) 80%, transparent 100%)',
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-x-0 -top-24 h-48 opacity-70 blur-3xl"
                style={{
                    background:
                        'radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in oklab, var(--state-info) 24%, transparent), transparent 72%)',
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_100%,transparent)_1px,transparent_1px)] [background-size:18px_18px]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -right-16 -bottom-24 size-56 rounded-full opacity-[0.12] blur-3xl"
                style={{
                    background:
                        'radial-gradient(circle, color-mix(in oklab, var(--primary) 40%, transparent), transparent 68%)',
                }}
                aria-hidden
            />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                <div className="min-w-0 flex-1 space-y-3">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color-mix(in_oklab,var(--state-alert)_78%,var(--muted-foreground))]">
                        {eyebrow}
                    </p>
                    <p className="text-pretty text-base font-semibold leading-snug text-[color-mix(in_oklab,var(--state-info)_40%,var(--foreground))] md:text-lg">
                        {selectionTitle}
                    </p>

                    {hasPrice ? (
                        <div className="pt-1">
                            <p
                                className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[color-mix(in_oklab,var(--state-success)_40%,var(--foreground))] tabular-nums sm:text-3xl"
                                style={{ fontFeatureSettings: '"tnum" 1' }}
                            >
                                {priceLine}
                            </p>
                            {priceCaption ? (
                                <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[var(--muted-foreground)]">
                                    {priceCaption}
                                </p>
                            ) : null}
                        </div>
                    ) : !planSelected ? (
                        <p className="text-sm text-[var(--muted-foreground)]">
                            Selecciona un plan para ver el importe estimado y continuar.
                        </p>
                    ) : (
                        <p className="text-sm text-[var(--muted-foreground)]">
                            No hay precio publicado en texto para este plan; revisa el detalle en el catálogo
                            administrado.
                        </p>
                    )}
                </div>

                <div className="flex w-full flex-shrink-0 flex-col gap-3 sm:flex-row sm:justify-end lg:w-auto lg:flex-col xl:flex-row">
                    <button
                        type="button"
                        disabled={!planSelected}
                        className={cn(
                            'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-semibold',
                            'border-[color-mix(in_oklab,var(--border)_75%,transparent)]',
                            'bg-[color-mix(in_oklab,var(--background)_55%,transparent)] text-[var(--foreground)] backdrop-blur-md',
                            'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                            'hover:shadow-[0_0_28px_-6px_color-mix(in_oklab,var(--state-info)_32%,transparent)]',
                            'active:scale-[0.98]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            !planSelected && 'pointer-events-none opacity-45',
                        )}
                        style={{
                            borderColor: 'color-mix(in oklab, var(--state-info) 35%, var(--border))',
                        }}
                        onClick={onPay}
                    >
                        <CreditCard className="size-4 opacity-90" aria-hidden />
                        Ir a pagar
                    </button>
                    <button
                        type="button"
                        disabled={!planSelected}
                        className={cn(
                            'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold',
                            'text-[var(--primary-foreground)]',
                            'shadow-[0_6px_28px_-6px_color-mix(in_oklab,var(--state-success)_55%,transparent),inset_0_1px_0_0_color-mix(in_oklab,var(--primary-foreground)_16%,transparent)]',
                            'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                            'hover:brightness-[1.08]',
                            'hover:shadow-[0_10px_40px_-8px_color-mix(in_oklab,var(--state-success)_52%,transparent)]',
                            'active:scale-[0.98]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            addedCount > 0 &&
                                'ring-2 ring-[color-mix(in_oklab,var(--primary)_38%,transparent)] ring-offset-2 ring-offset-[color-mix(in_oklab,var(--background)_80%,transparent)]',
                            !planSelected && 'pointer-events-none opacity-45',
                        )}
                        style={{
                            background:
                                'linear-gradient(135deg, color-mix(in oklab, var(--state-success) 92%, var(--state-info)), color-mix(in oklab, var(--state-info) 72%, var(--state-success)))',
                        }}
                        onClick={onAdd}
                    >
                        Agregar al carrito
                        <Sparkles className="size-4 opacity-95" aria-hidden />
                    </button>
                </div>
            </div>

            {addedCount > 0 ? (
                <div
                    className="relative z-10 mt-8 border-t border-[color-mix(in_oklab,var(--border)_65%,transparent)] pt-6"
                    role="status"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold',
                                'border-[color-mix(in_oklab,var(--state-success)_38%,transparent)]',
                                'bg-[color-mix(in_oklab,var(--state-success)_11%,transparent)]',
                                'text-[color-mix(in_oklab,var(--state-success)_94%,var(--foreground))]',
                                'shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--primary-foreground)_10%,transparent)]',
                                'animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500',
                            )}
                        >
                            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                            Agregado al carrito ({addedCount}{' '}
                            {addedCount === 1 ? 'unidad' : 'unidades'})
                        </span>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
