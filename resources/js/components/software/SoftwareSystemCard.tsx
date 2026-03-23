'use client';

import { ArrowRight } from 'lucide-react';

import type { SoftwareSystem } from '@/marketplace/softwareCatalog';

type Props = {
    system: SoftwareSystem;
};

export default function SoftwareSystemCard({ system }: Props) {
    const primaryPlan = system.pricingPlans?.[0] ?? null;
    const planAny = primaryPlan as
        | (typeof primaryPlan & {
              oldPriceText?: string;
              newPriceText?: string;
              price_before?: string | number;
              price_now?: string | number;
              precio_antes?: string | number;
              precio_ahora?: string | number;
              precioAntes?: string | number;
              precioAhora?: string | number;
          })
        | null;

    const priceBefore =
        primaryPlan?.priceBeforeText ??
        (primaryPlan?.priceBefore !== undefined
            ? String(primaryPlan.priceBefore)
            : planAny?.oldPriceText ??
              (planAny?.price_before !== undefined ? String(planAny.price_before) : undefined)) ??
        (planAny?.precio_antes !== undefined
            ? String(planAny.precio_antes)
            : planAny?.precioAntes !== undefined
              ? String(planAny.precioAntes)
              : undefined);

    const priceNow =
        primaryPlan?.priceNowText ??
        (primaryPlan?.priceNow !== undefined
            ? String(primaryPlan.priceNow)
            : planAny?.newPriceText ??
              (planAny?.price_now !== undefined ? String(planAny.price_now) : undefined)) ??
        (planAny?.precio_ahora !== undefined
            ? String(planAny.precio_ahora)
            : planAny?.precioAhora !== undefined
              ? String(planAny.precioAhora)
              : undefined);

    return (
        <article
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-card/75 p-6 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-[color-mix(in_oklab,var(--primary)_28%,var(--border))] hover:bg-card/90 hover:shadow-[0_20px_50px_-12px_color-mix(in_oklab,var(--foreground)_12%,transparent)]"
            style={{
                boxShadow:
                    '0 0 0 1px var(--hero-card-inset) inset, 0 10px 40px rgba(0,0,0,0.04)',
            }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'radial-gradient(ellipse at 12% 0%, color-mix(in oklab, var(--primary) 12%, transparent) 0%, transparent 55%)',
                }}
                aria-hidden
            />

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                        {system.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        {system.shortDescription}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {system.badges.map((b) => (
                    <span
                        key={b}
                        className="rounded-full border border-[color-mix(in_oklab,var(--primary)_28%,var(--border))] bg-[color-mix(in_oklab,var(--primary)_9%,transparent)] px-3 py-1 text-xs font-semibold text-[color-mix(in_oklab,var(--primary)_92%,var(--foreground))]"
                    >
                        {b}
                    </span>
                ))}
            </div>

            {(priceBefore || priceNow) && (
                <div className="mt-5 flex items-end justify-between gap-4">
                    <div className="flex flex-col">
                        {priceBefore && (
                            <div className="text-sm font-semibold text-[var(--muted-foreground)]">
                                <span className="mr-2 opacity-70 line-through">{priceBefore}</span>
                            </div>
                        )}

                        <div className="text-left">
                            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                {priceNow && (
                                    <p className="text-2xl font-bold tabular-nums text-[var(--foreground)]">
                                        {priceNow}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div aria-hidden className="h-px flex-1" />
                </div>
            )}

            <div className="mt-6">
                <a
                    href={`/software/${system.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[color-mix(in_oklab,var(--primary)_32%,var(--border))] bg-background/80 px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[color-mix(in_oklab,var(--primary)_45%,var(--border))] hover:bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
                >
                    Ver detalles y planes
                    <ArrowRight className="size-4 opacity-80" aria-hidden />
                </a>
            </div>
        </article>
    );
}
