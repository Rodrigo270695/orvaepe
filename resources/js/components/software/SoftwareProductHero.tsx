'use client';

import { Link } from '@inertiajs/react';
import { ChevronRight, Layers, Sparkles } from 'lucide-react';

import AppLogoIcon from '@/components/app-logo-icon';

import { cn } from '@/lib/utils';

function formatCategoryLabel(slug: string): string {
    if (!slug || slug === 'general') {
        return 'Catálogo';
    }

    return slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

type Module = { name: string };

type Props = {
    name: string;
    description: string;
    shortDescription: string;
    badges: string[];
    categorySlug: string;
    modules: Module[];
};

export default function SoftwareProductHero({
    name,
    description,
    shortDescription,
    badges,
    categorySlug,
    modules,
}: Props) {
    const categoryLabel = formatCategoryLabel(categorySlug);
    const highlightBullets =
        modules.length > 0
            ? modules.slice(0, 3).map((m) => m.name)
            : [
                  'Entrega documentada y trazable',
                  'Planes según tu operación',
                  'Soporte en la implementación',
              ];

    return (
        <section
            id="inicio"
            className="relative scroll-mt-28 overflow-hidden border-b border-[color-mix(in_oklab,var(--border)_80%,transparent)]"
            aria-labelledby="software-product-title"
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.45]"
                style={{
                    background:
                        'radial-gradient(ellipse 90% 55% at 50% -15%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 55%)',
                }}
                aria-hidden
            />

            <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12">
                <nav
                    className="flex flex-wrap items-center gap-1 text-xs text-[var(--muted-foreground)]"
                    aria-label="Ubicación en el sitio"
                >
                    <Link
                        href="/software"
                        className="rounded-md font-medium text-[var(--foreground)] underline-offset-4 transition-colors hover:text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        Software
                    </Link>
                    <ChevronRight className="size-3.5 shrink-0 opacity-45" aria-hidden />
                    <span className="font-medium text-[var(--foreground)]/85">{categoryLabel}</span>
                    <ChevronRight className="size-3.5 shrink-0 opacity-45" aria-hidden />
                    <span className="max-w-[min(100%,14rem)] truncate text-[var(--muted-foreground)]">
                        {name}
                    </span>
                </nav>

                <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14 xl:gap-16">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_92%,transparent)] px-4 py-2 shadow-sm backdrop-blur-sm">
                            <AppLogoIcon className="size-5 shrink-0 fill-[color-mix(in_oklab,var(--primary)_75%,var(--foreground))]" />
                            <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                                Producto
                            </span>
                        </div>

                        <h1
                            id="software-product-title"
                            className="mt-6 font-[family-name:var(--font-display)] text-[2rem] font-bold leading-[1.08] tracking-tight text-[var(--foreground)] sm:text-4xl md:text-[2.65rem] md:leading-[1.06]"
                        >
                            {name}
                        </h1>

                        <p className="mt-5 max-w-xl font-[family-name:var(--font-body)] text-base leading-relaxed text-[var(--muted-foreground)] md:text-[17px]">
                            {description}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href="#planes"
                                className={cn(
                                    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold',
                                    'bg-[var(--primary)] text-[var(--primary-foreground)]',
                                    'shadow-[0_1px_0_color-mix(in_oklab,var(--foreground)_12%,transparent)]',
                                    'transition-all hover:brightness-[1.05] hover:shadow-md',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                )}
                            >
                                Ver planes y precios
                            </a>
                            <a
                                href="#modulos"
                                className={cn(
                                    'inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-background/80 px-5 py-3 text-sm font-semibold text-[var(--foreground)] backdrop-blur-sm',
                                    'transition-colors hover:border-[color-mix(in_oklab,var(--primary)_35%,var(--border))] hover:bg-[color-mix(in_oklab,var(--primary)_6%,transparent)]',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                )}
                            >
                                Ver módulos
                            </a>
                            <a
                                href="#tecnologias"
                                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-[var(--muted-foreground)] underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                Stack técnico
                            </a>
                        </div>
                    </div>

                    <aside
                        className="relative rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] p-6 shadow-[0_20px_50px_-24px_color-mix(in_oklab,var(--foreground)_35%,transparent)] backdrop-blur-md md:p-7"
                        aria-label="Resumen del producto"
                    >
                        <div className="flex items-center gap-2 text-[var(--foreground)]">
                            <Layers className="size-5 text-[var(--primary)]" aria-hidden />
                            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
                                En resumen
                            </h2>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                            {shortDescription}
                        </p>

                        {badges.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {badges.slice(0, 6).map((b) => (
                                    <span
                                        key={b}
                                        className="inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--primary)_28%,var(--border))] bg-[color-mix(in_oklab,var(--primary)_9%,transparent)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--primary)_95%,var(--foreground))]"
                                    >
                                        {b}
                                    </span>
                                ))}
                            </div>
                        )}

                        <ul className="mt-5 space-y-3 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] pt-5 text-sm text-[var(--muted-foreground)]">
                            {highlightBullets.map((t) => (
                                <li key={t} className="flex gap-3">
                                    <span
                                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                                        aria-hidden
                                    />
                                    <span className="leading-snug text-[var(--foreground)]/90">{t}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[color-mix(in_oklab,var(--muted)_35%,transparent)] px-3 py-2.5 text-xs text-[var(--muted-foreground)]">
                            <Sparkles className="size-3.5 shrink-0 text-[var(--primary)]" aria-hidden />
                            <span>
                                Elige un plan abajo y añádelo al carrito; el pago se conectará a tu pasarela.
                            </span>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
