import { Link } from '@inertiajs/react';
import { SearchX, X } from 'lucide-react';
import { useState } from 'react';

import HomeSection from '@/components/welcome/HomeSection';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';
import type { MarketingSoftwareCategorySection } from '@/pages/software';

import { categoryColor } from './catalogUtils';
import SoftwareProductCard from './SoftwareProductCard';

type Props = {
    /** Secciones ya filtradas por la búsqueda (?q=). */
    sections: MarketingSoftwareCategorySection[];
    /** Índice de color por slug, estable aunque la búsqueda oculte categorías. */
    colorIndex: Record<string, number>;
    searchQuery?: string | null;
};

export default function SoftwareCatalogSection({ sections, colorIndex, searchQuery }: Props) {
    const [active, setActive] = useState<string | null>(null);
    const query = searchQuery?.trim() ?? '';
    const visible = active ? sections.filter((s) => s.slug === active) : sections;
    const total = sections.reduce((n, s) => n + s.systems.length, 0);

    const pillBase =
        'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

    return (
        <HomeSection id="catalogo" alt aria-label="Catálogo de software" className="overflow-hidden">
            <div
                className="home-blob home-blob--pulse -right-24 top-10 size-[22rem] opacity-40"
                data-parallax="8"
                style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}
                aria-hidden
            />

            <div className="relative">
                <LandingSectionHeader
                    className="mb-8 md:mb-10"
                    eyebrow="Catálogo"
                    title="Elige el sistema para tu negocio"
                    description="Cada sistema tiene sus planes, módulos y demo. Entra al detalle para comparar y contratar."
                    layout="wide"
                />

                {query ? (
                    <div className="mx-auto mb-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--o-amber)_30%,var(--border))] bg-[color-mix(in_oklab,var(--o-amber)_8%,var(--card))] px-4 py-3 text-sm">
                        <span className="text-muted-foreground">Resultados para</span>
                        <span className="font-semibold text-foreground">«{query}»</span>
                        <Link
                            href="/software"
                            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 font-semibold text-[var(--o-amber)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <X className="size-3.5" aria-hidden />
                            Quitar filtro
                        </Link>
                    </div>
                ) : null}

                {sections.length === 0 ? (
                    <div className="home-glass mx-auto max-w-lg rounded-3xl px-6 py-12 text-center">
                        <SearchX className="mx-auto size-10 text-muted-foreground" strokeWidth={1.5} aria-hidden />
                        <p className="mt-4 font-display text-lg font-bold text-foreground">
                            {query ? `No encontramos sistemas para «${query}»` : 'Pronto publicaremos nuevos sistemas'}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Si no está en el catálogo, lo podemos construir a medida.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {query ? (
                                <Link
                                    href="/software"
                                    className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    Ver todo el catálogo
                                </Link>
                            ) : null}
                            <Link
                                href="/contacto"
                                className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                Contarnos tu caso
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {sections.length > 1 ? (
                            <div
                                className="mb-10 flex flex-wrap justify-center gap-2"
                                role="group"
                                aria-label="Filtrar por categoría"
                            >
                                <button
                                    type="button"
                                    onClick={() => setActive(null)}
                                    aria-pressed={active === null}
                                    className={`${pillBase} ${
                                        active === null
                                            ? 'border-foreground bg-foreground text-background'
                                            : 'border-border bg-card text-foreground hover:bg-muted'
                                    }`}
                                >
                                    Todos
                                    <span className="tabular-nums opacity-70">{total}</span>
                                </button>
                                {sections.map((section) => {
                                    const color = categoryColor(colorIndex[section.slug] ?? 0);
                                    const selected = active === section.slug;

                                    return (
                                        <button
                                            key={section.slug}
                                            type="button"
                                            onClick={() => setActive(selected ? null : section.slug)}
                                            aria-pressed={selected}
                                            className={`${pillBase} ${selected ? 'text-white' : 'bg-card text-foreground hover:bg-muted'}`}
                                            style={
                                                selected
                                                    ? { background: color, borderColor: color }
                                                    : { borderColor: `color-mix(in oklab, ${color} 35%, var(--border))` }
                                            }
                                        >
                                            {!selected ? (
                                                <span className="size-2 rounded-full" style={{ background: color }} aria-hidden />
                                            ) : null}
                                            {section.title}
                                            <span className="tabular-nums opacity-70">{section.systems.length}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : null}

                        <div className="space-y-14 md:space-y-16">
                            {visible.map((section) => {
                                const color = categoryColor(colorIndex[section.slug] ?? 0);

                                return (
                                    <div key={section.slug} id={section.slug} className="scroll-mt-28">
                                        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4">
                                            <div className="min-w-0">
                                                <p
                                                    className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]"
                                                    style={{ color }}
                                                >
                                                    Categoría
                                                </p>
                                                <h3 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                                                    {section.title}
                                                </h3>
                                                {section.description ? (
                                                    <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                                                        {section.description}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <span
                                                className="rounded-full px-3 py-1 text-xs font-semibold tabular-nums text-foreground"
                                                style={{ background: `color-mix(in oklab, ${color} 14%, var(--card))` }}
                                            >
                                                {section.systems.length}{' '}
                                                {section.systems.length === 1 ? 'sistema' : 'sistemas'}
                                            </span>
                                        </div>

                                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                            {section.systems.map((system) => (
                                                <SoftwareProductCard
                                                    key={system.slug}
                                                    system={system}
                                                    categoryTitle={section.title}
                                                    color={color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </HomeSection>
    );
}
