'use client';

import { useMemo, useState } from 'react';

import PortfolioProjectCard from '@/components/portfolio/PortfolioProjectCard';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';
import type { MarketingSoftwareCategorySection } from '@/pages/software';

const semanticCycle = [
    'var(--state-info)',
    'var(--state-success)',
    'var(--state-alert)',
    'var(--state-danger)',
] as const;

type Project = {
    system: MarketingSoftwareCategorySection['systems'][number];
    categorySlug: string;
    categoryTitle: string;
    accent: string;
};

type Props = {
    catalogSections: MarketingSoftwareCategorySection[];
};

export default function PortfolioSystemsShowcase({ catalogSections }: Props) {
    const [activeSlug, setActiveSlug] = useState<string>('todos');

    const categoryAccents = useMemo(() => {
        const map = new Map<string, string>();
        catalogSections.forEach((section, index) => {
            map.set(section.slug, semanticCycle[index % semanticCycle.length]);
        });
        return map;
    }, [catalogSections]);

    const projects = useMemo<Project[]>(() => {
        return catalogSections.flatMap((section) =>
            section.systems.map((system) => ({
                system,
                categorySlug: section.slug,
                categoryTitle: section.title,
                accent: categoryAccents.get(section.slug) ?? semanticCycle[0],
            })),
        );
    }, [catalogSections, categoryAccents]);

    const visible = useMemo(() => {
        if (activeSlug === 'todos') {
            return projects;
        }
        return projects.filter((p) => p.categorySlug === activeSlug);
    }, [activeSlug, projects]);

    const featured = activeSlug === 'todos' ? visible[0] : null;
    const rest = featured ? visible.slice(1) : visible;

    const pills = useMemo(
        () => [
            { slug: 'todos', title: 'Todos' },
            ...catalogSections.map((s) => ({ slug: s.slug, title: s.title })),
        ],
        [catalogSections],
    );

    if (catalogSections.length === 0) {
        return (
            <section
                id="sistemas"
                className="relative scroll-mt-28 border-t border-border py-16 md:py-24"
            >
                <div className="mx-auto max-w-2xl px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Pronto publicaremos aquí los sistemas desarrollados por ORVAE.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section
            id="sistemas"
            className="relative scroll-mt-28 border-t border-border bg-[color-mix(in_oklab,var(--landing-surface-2)_90%,var(--background))] py-16 backdrop-blur-[1px] md:py-24 dark:bg-[color-mix(in_oklab,var(--landing-surface-2)_82%,var(--background))]"
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--state-info)_35%,transparent)] to-transparent"
                aria-hidden
            />
            <GeometricBackground variant="diagonal-lines" opacity={0.05} />
            <GeometricBackground variant="grid-dots" opacity={0.04} />

            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="mb-10 text-center md:mb-12">
                    <LandingSectionHeader
                        eyebrow="Sistemas desarrollados"
                        title="Portafolio de productos ORVAE"
                        description="Filtra por rubro y abre cada sistema: capturas, módulos y el detalle comercial en un clic."
                        variant="sparkles"
                        layout="sparkles"
                        titleClassName="font-display text-2xl font-bold tracking-tight md:text-3xl"
                        descriptionClassName="mt-3 max-w-lg text-sm font-body"
                    />

                    <div
                        className="mt-6 flex flex-wrap items-center justify-center gap-2"
                        role="group"
                        aria-label="Filtrar sistemas por categoría"
                    >
                        {pills.map((pill, index) => {
                            const accent = semanticCycle[index % semanticCycle.length];
                            const selected = activeSlug === pill.slug;
                            return (
                                <button
                                    key={pill.slug}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => setActiveSlug(pill.slug)}
                                    className={[
                                        'rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all duration-200',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                        selected
                                            ? 'shadow-[0_8px_20px_-12px_color-mix(in_oklab,var(--foreground)_28%,transparent)]'
                                            : 'bg-background/60 text-muted-foreground backdrop-blur-sm hover:-translate-y-px dark:bg-[color-mix(in_oklab,var(--card)_75%,transparent)]',
                                    ].join(' ')}
                                    style={{
                                        borderColor: `color-mix(in oklab, ${accent} ${selected ? 55 : 40}%, var(--border))`,
                                        color: selected
                                            ? `color-mix(in oklab, ${accent} 88%, var(--foreground))`
                                            : `color-mix(in oklab, ${accent} 75%, var(--foreground))`,
                                        background: selected
                                            ? `color-mix(in oklab, ${accent} 14%, var(--background))`
                                            : undefined,
                                    }}
                                >
                                    {pill.title}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {featured ? (
                    <div className="mb-6">
                        <PortfolioProjectCard
                            system={featured.system}
                            categoryTitle={featured.categoryTitle}
                            accent={featured.accent}
                            featured
                        />
                    </div>
                ) : null}

                {rest.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-2">
                        {rest.map((project) => (
                            <PortfolioProjectCard
                                key={`${project.categorySlug}-${project.system.slug}`}
                                system={project.system}
                                categoryTitle={project.categoryTitle}
                                accent={project.accent}
                            />
                        ))}
                    </div>
                ) : null}

                {visible.length === 0 ? (
                    <p className="rounded-2xl border border-border/60 bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
                        No hay sistemas en esta categoría por ahora.
                    </p>
                ) : null}
            </div>
        </section>
    );
}
