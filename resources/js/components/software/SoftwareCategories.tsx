'use client';

import { Link } from '@inertiajs/react';
import { useMemo } from 'react';

import SoftwareSystemCard from '@/components/software/SoftwareSystemCard';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import { normalizeSearchText } from '@/lib/normalizeSearchText';
import {
    getSystemsByCategory,
    softwareCategories,
} from '@/marketplace/softwareCatalog';
import type { SoftwareSystem } from '@/marketplace/softwareCatalog';
import type { MarketingSoftwareCategorySection } from '@/pages/software';

function systemMatchesSearch(system: SoftwareSystem, rawQuery: string): boolean {
    const q = normalizeSearchText(rawQuery);
    if (!q) {
        return true;
    }

    const parts = [
        system.name,
        system.shortDescription,
        system.description,
        system.slug.replace(/-/g, ' '),
        ...(system.badges ?? []),
        ...(system.modules?.flatMap((m) => [m.name, m.description ?? '']) ?? []),
    ];

    return normalizeSearchText(parts.join(' ')).includes(q);
}

type Props = {
    /** Si viene del backend (catálogo admin), solo sistemas propios elegibles */
    catalogSections?: MarketingSoftwareCategorySection[];
    /** Filtro desde URL ?q= (SearchAction / buscador global) */
    searchQuery?: string | null;
};

export default function SoftwareCategories({ catalogSections, searchQuery }: Props) {
    const semanticAccents = [
        'var(--state-info)',
        'var(--state-success)',
        'var(--state-alert)',
        'var(--state-danger)',
    ] as const;

    const sections = useMemo((): MarketingSoftwareCategorySection[] => {
        if (catalogSections && catalogSections.length > 0) {
            return catalogSections;
        }
        return softwareCategories.map((cat) => ({
            slug: cat.slug,
            title: cat.title,
            description: cat.description,
            systems: getSystemsByCategory(cat.slug),
        }));
    }, [catalogSections]);

    const filteredSections = useMemo(() => {
        const q = searchQuery?.trim();
        if (!q) {
            return sections;
        }

        return sections
            .map((cat) => ({
                ...cat,
                systems: cat.systems.filter((sys) => systemMatchesSearch(sys, q)),
            }))
            .filter((cat) => cat.systems.length > 0);
    }, [sections, searchQuery]);

    if (searchQuery?.trim() && filteredSections.length === 0) {
        return (
            <section
                id="catalogo-software"
                className="scroll-mt-28 border-t border-border bg-[color-mix(in_oklab,var(--landing-surface-2)_88%,transparent)] py-16 md:py-24 dark:bg-[color-mix(in_oklab,var(--landing-surface-2)_78%,transparent)]"
            >
                <div className="mx-auto max-w-2xl px-4 text-center">
                    <p className="text-muted-foreground">
                        No hay productos que coincidan con «{searchQuery.trim()}».
                    </p>
                    <Link
                        href="/software"
                        className="mt-4 inline-flex text-sm font-semibold text-[var(--state-info)] underline-offset-4 hover:underline"
                    >
                        Ver todo el catálogo
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <>
            {filteredSections.map((cat, idx) => {
                const systems = cat.systems;
                const accent = semanticAccents[idx % semanticAccents.length];
                const bgVariant: 'grid-hex' | 'circles-blur' | 'diagonal-lines' =
                    idx % 3 === 0
                        ? 'grid-hex'
                        : idx % 3 === 1
                          ? 'circles-blur'
                          : 'diagonal-lines';

                return (
                    <ScrollReveal key={cat.slug} direction="up">
                        <section
                            id={cat.slug}
                            className="relative overflow-hidden scroll-mt-28 border-t border-border bg-[color-mix(in_oklab,var(--landing-surface-2)_88%,transparent)] py-16 backdrop-blur-[1px] md:py-24 dark:bg-[color-mix(in_oklab,var(--landing-surface-2)_78%,transparent)]"
                        >
                            {/* Capas geométricas detrás de la categoría */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                                style={{
                                    background:
                                        `radial-gradient(circle at 10% 0%, color-mix(in oklab, ${accent} 18%, transparent) 0%, transparent 55%), radial-gradient(circle at 80% 30%, color-mix(in oklab, var(--o-warm) 18%, transparent) 0%, transparent 50%)`,
                                }}
                                aria-hidden
                            />
                            <GeometricBackground variant={bgVariant} opacity={0.06} />
                            <GeometricBackground variant="grid-dots" opacity={0.04} />

                            <div className="relative z-10 mx-auto w-full max-w-6xl px-4">
                                <header className="mb-12 text-center md:mb-16">
                                    <p
                                        className="font-mono text-xs font-semibold uppercase tracking-[0.4em]"
                                        style={{ color: accent }}
                                    >
                                        Categoría
                                    </p>
                                    <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                        {cat.title}
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-2xl font-body text-muted-foreground">
                                        {cat.description || ' '}
                                    </p>
                                </header>

                                <div className="grid gap-5 md:grid-cols-2">
                                    {systems.map((sys) => (
                                        <SoftwareSystemCard
                                            key={sys.slug}
                                            system={sys}
                                            accent={accent}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </ScrollReveal>
                );
            })}
        </>
    );
}

