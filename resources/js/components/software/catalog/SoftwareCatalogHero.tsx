import { Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, Boxes, CalendarClock, KeyRound } from 'lucide-react';

import AppLogoIcon from '@/components/app-logo-icon';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import type { MarketingSoftwareCategorySection } from '@/pages/software';

import { categoryColor, startingPrice, systemBrand } from './catalogUtils';

const pillars = [
    { icon: CalendarClock, label: 'SaaS mensual o anual', color: '#0D9488' },
    { icon: KeyRound, label: 'Licencia o código fuente', color: '#EA580C' },
    { icon: Boxes, label: 'Módulos por separado', color: '#2563EB' },
] as const;

const BRAND_DOT = { vet: '#0D9488', taller: '#EA580C' } as const;

type Props = {
    sections: MarketingSoftwareCategorySection[];
};

export default function SoftwareCatalogHero({ sections }: Props) {
    const systems = sections.flatMap((section, index) =>
        section.systems.map((system) => ({ system, category: section.title, color: categoryColor(index) })),
    );
    const brandFirst = [...systems].sort(
        (a, b) => Number(systemBrand(b.system) !== null) - Number(systemBrand(a.system) !== null),
    );
    const preview = brandFirst.slice(0, 5);
    const total = systems.length;

    return (
        <section
            id="inicio"
            aria-labelledby="software-hero-title"
            className="relative flex min-w-0 flex-col justify-center overflow-hidden scroll-mt-28"
            style={{ minHeight: 'min(80vh, 48rem)' }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(165deg, var(--background) 0%, color-mix(in oklab, var(--o-amber) 7%, var(--background)) 42%, var(--background) 100%)',
                }}
                aria-hidden
            />
            <GeometricBackground variant="floating-shapes" opacity={0.08} />
            <div
                className="home-blob home-blob--pulse absolute -right-24 -top-16 size-[30rem] opacity-60"
                data-parallax="10"
                style={{ background: 'radial-gradient(circle, color-mix(in oklab, #2563eb 50%, transparent) 0%, transparent 70%)' }}
                aria-hidden
            />
            <div
                className="home-blob home-blob--pulse absolute -left-24 top-24 size-[22rem] opacity-60"
                data-parallax="-8"
                style={{
                    background: 'radial-gradient(circle, color-mix(in oklab, #0d9488 50%, transparent) 0%, transparent 70%)',
                    animationDelay: '1.4s',
                }}
                aria-hidden
            />
            <div
                className="home-blob absolute bottom-8 left-1/3 size-[18rem] opacity-40"
                data-parallax="6"
                style={{ background: 'radial-gradient(circle, color-mix(in oklab, #ea580c 42%, transparent) 0%, transparent 70%)' }}
                aria-hidden
            />

            <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pt-14 lg:pb-20">
                <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--o-amber)_35%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--o-amber)] shadow-sm backdrop-blur-md">
                            <AppLogoIcon className="size-3.5 shrink-0 fill-[var(--o-amber)]" />
                            Software ORVAE · Perú
                        </p>

                        <h1
                            id="software-hero-title"
                            className="font-display mt-6 max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                        >
                            Sistemas listos para operar.
                            <span className="mt-2 block bg-gradient-to-br from-foreground via-[var(--o-amber)] to-[var(--o-tech)] bg-clip-text text-transparent dark:from-[var(--o-cream2)]">
                                Eliges, activas, trabajas.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
                            Software desarrollado y mantenido por ORVAE. Elige el sistema, el plan que se ajusta a tu
                            operación y empieza en días, no en meses.
                        </p>

                        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Formas de contratar">
                            {pillars.map(({ icon: Icon, label, color }) => (
                                <li
                                    key={label}
                                    className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-foreground"
                                    style={{
                                        borderColor: `color-mix(in oklab, ${color} 38%, var(--border))`,
                                        background: `color-mix(in oklab, ${color} 12%, var(--card))`,
                                    }}
                                >
                                    <Icon className="size-3.5" style={{ color }} aria-hidden />
                                    {label}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href="#catalogo"
                                data-magnetic
                                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_6px_24px_-6px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-[box-shadow,filter] duration-200 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                Ver catálogo
                                <ArrowRight className="size-4" aria-hidden />
                            </a>
                            <Link
                                href="/servicios"
                                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-[color-mix(in_oklab,var(--foreground)_22%,var(--border))] bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_55%,var(--border))] hover:bg-[color-mix(in_oklab,var(--primary)_10%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                Software a medida
                            </Link>
                            <Link
                                href="/contacto"
                                className="inline-flex min-h-12 cursor-pointer items-center justify-center px-2 text-sm font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Hablar con ventas
                            </Link>
                        </div>
                    </div>

                    {preview.length > 0 ? (
                        <div className="home-glass relative rounded-3xl p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
                                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--o-amber)]">
                                    En el catálogo
                                </p>
                                <span className="rounded-full bg-[color-mix(in_oklab,var(--o-amber)_14%,var(--card))] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                                    {total} {total === 1 ? 'sistema' : 'sistemas'}
                                </span>
                            </div>
                            <ul className="divide-y divide-border/60">
                                {preview.map(({ system, category, color }) => {
                                    const brand = systemBrand(system);
                                    const price = startingPrice(system);
                                    const dot = brand ? BRAND_DOT[brand] : color;

                                    return (
                                        <li key={system.slug}>
                                            <Link
                                                href={`/software/${system.slug}`}
                                                className="group flex min-h-14 cursor-pointer items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                <span
                                                    className="size-2.5 shrink-0 rounded-full"
                                                    style={{ background: dot, boxShadow: `0 0 0 4px color-mix(in oklab, ${dot} 18%, transparent)` }}
                                                    aria-hidden
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate font-display text-sm font-bold text-foreground">
                                                        {system.name}
                                                    </span>
                                                    <span className="block truncate text-xs text-muted-foreground">{category}</span>
                                                </span>
                                                {price ? (
                                                    <span className="shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                                                        <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                            Desde
                                                        </span>
                                                        {price.text}
                                                    </span>
                                                ) : null}
                                                <ArrowUpRight
                                                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                                                    aria-hidden
                                                />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                            {total > preview.length ? (
                                <a
                                    href="#catalogo"
                                    className="mt-3 inline-flex text-xs font-semibold text-[var(--o-amber)] underline-offset-4 hover:underline"
                                >
                                    Ver los {total} sistemas
                                </a>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-6">
                    {[
                        [String(total), total === 1 ? 'sistema activo' : 'sistemas activos'],
                        [String(sections.length), sections.length === 1 ? 'categoría' : 'categorías'],
                        ['Soporte', 'local en Perú'],
                    ].map(([k, v]) => (
                        <div key={v}>
                            <dt className="font-display text-base font-bold text-foreground sm:text-lg">{k}</dt>
                            <dd className="mt-0.5 text-xs text-muted-foreground">{v}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 0%, var(--hero-line) 15%, var(--o-amber2) 50%, var(--hero-line) 85%, transparent 100%)',
                }}
                aria-hidden
            />
        </section>
    );
}
