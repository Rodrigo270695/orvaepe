'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useMemo, useRef, useState } from 'react';

import { featuredSaasFromCatalog, isFeaturedPortfolioSystem } from '@/components/portfolio/featuredPortfolio';
import PortfolioProjectCard from '@/components/portfolio/PortfolioProjectCard';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import HomeSection from '@/components/welcome/HomeSection';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';
import type { MarketingSoftwareCategorySection } from '@/pages/software';

import './portfolio-orvae.css';

const semanticCycle = [
    '#2563eb',
    '#0d9488',
    '#ea580c',
    '#7c3aed',
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
    const gridRef = useRef<HTMLDivElement>(null);

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
                accent: /taller/i.test(`${system.slug} ${system.name}`)
                    ? '#ea580c'
                    : /vet/i.test(`${system.slug} ${system.name}`)
                      ? '#0d9488'
                      : (categoryAccents.get(section.slug) ?? semanticCycle[0]),
            })),
        );
    }, [catalogSections, categoryAccents]);

    const visible = useMemo(() => {
        if (activeSlug === 'todos') {
            return projects;
        }
        return projects.filter((p) => p.categorySlug === activeSlug);
    }, [activeSlug, projects]);

    const featuredFromCatalog = visible.filter((p) => isFeaturedPortfolioSystem(p.system));
    const rest = visible.filter((p) => !isFeaturedPortfolioSystem(p.system));
    const featuredFallback =
        activeSlug === 'todos' && featuredFromCatalog.length === 0
            ? featuredSaasFromCatalog(catalogSections)
            : [];

    const pills = useMemo(
        () => [
            { slug: 'todos', title: 'Todos' },
            ...catalogSections.map((s) => ({ slug: s.slug, title: s.title })),
        ],
        [catalogSections],
    );

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const items = gridRef.current?.querySelectorAll('[data-portfolio-card]');
                if (!items?.length) return;
                gsap.from(items, {
                    opacity: 0,
                    y: 16,
                    scale: 0.97,
                    duration: 0.4,
                    stagger: { each: 0.05, from: 'start' },
                    ease: 'power2.out',
                    clearProps: 'transform',
                });
            });
            return () => mm.revert();
        },
        { scope: gridRef, dependencies: [activeSlug, visible.length] },
    );

    if (catalogSections.length === 0) {
        return (
            <HomeSection id="sistemas" alt aria-label="Sistemas desarrollados por ORVAE">
                <p className="text-center text-sm text-muted-foreground">
                    Pronto publicaremos aquí los sistemas desarrollados por ORVAE.
                </p>
            </HomeSection>
        );
    }

    return (
        <HomeSection id="sistemas" alt aria-label="Portafolio de productos ORVAE">
            <LandingSectionHeader
                className="mb-8 md:mb-10"
                eyebrow="Sistemas desarrollados"
                title="Portafolio de productos ORVAE"
                description="Filtra por rubro. VetSaaS y TallerSaaS van primero; el resto del catálogo sigue abajo."
                layout="wide"
                titleSize="hero"
                titleClassName="font-display text-2xl font-bold tracking-tight md:text-4xl"
                descriptionClassName="mt-3 max-w-lg text-sm font-body"
            />

            <div
                className="sticky top-[4.75rem] z-20 mb-8 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/80 p-2 backdrop-blur-xl"
                role="group"
                aria-label="Filtrar sistemas por categoría"
            >
                {pills.map((pill) => {
                    const selected = activeSlug === pill.slug;
                    return (
                        <button
                            key={pill.slug}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setActiveSlug(pill.slug)}
                            className={['pf-filter', selected && 'is-on'].filter(Boolean).join(' ')}
                        >
                            {pill.title}
                        </button>
                    );
                })}
            </div>

            <div ref={gridRef}>
                {featuredFromCatalog.length > 0 ? (
                    <div className="mb-5 grid gap-5 lg:grid-cols-2">
                        {featuredFromCatalog.map((project) => (
                            <PortfolioProjectCard
                                key={`${project.categorySlug}-${project.system.slug}`}
                                system={project.system}
                                categoryTitle={project.categoryTitle}
                                accent={project.accent}
                                featured
                            />
                        ))}
                    </div>
                ) : null}

                {featuredFallback.length > 0 ? (
                    <div className="mb-5 grid gap-5 lg:grid-cols-2">
                        {featuredFallback.map((item) => (
                            <Link
                                key={item.slug}
                                href={item.href}
                                data-portfolio-card=""
                                className="pf-card group relative flex cursor-pointer overflow-hidden rounded-[1.5rem] no-underline transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row"
                                aria-label={`Ver el sistema ${item.name}`}
                            >
                                <img
                                    src={item.image}
                                    alt=""
                                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] sm:h-auto sm:w-[52%] sm:aspect-auto"
                                />
                                <div className="flex flex-1 flex-col p-5 sm:p-6">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: item.accent }}>
                                        {item.hint}
                                    </p>
                                    <h3 className="font-display mt-1 text-lg font-bold text-foreground md:text-xl">
                                        {item.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                                    <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-foreground">
                                        Ver sistema
                                        <ArrowUpRight className="size-4" aria-hidden />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : null}

                {rest.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
        </HomeSection>
    );
}
