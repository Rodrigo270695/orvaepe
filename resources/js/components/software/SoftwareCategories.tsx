'use client';

import ScrollReveal from '@/components/welcome/ScrollReveal';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import {
    getSystemsByCategory,
    softwareCategories,
} from '@/marketplace/softwareCatalog';
import SoftwareSystemCard from '@/components/software/SoftwareSystemCard';
import type { MarketingSoftwareCategorySection } from '@/pages/software';

type Props = {
    /** Si viene del backend (catálogo admin), solo sistemas propios elegibles */
    catalogSections?: MarketingSoftwareCategorySection[];
};

export default function SoftwareCategories({ catalogSections }: Props) {
    const sections: MarketingSoftwareCategorySection[] =
        catalogSections && catalogSections.length > 0
            ? catalogSections
            : softwareCategories.map((cat) => ({
                  slug: cat.slug,
                  title: cat.title,
                  description: cat.description,
                  systems: getSystemsByCategory(cat.slug),
              }));

    return (
        <>
            {sections.map((cat, idx) => {
                const systems = cat.systems;
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
                            className="relative overflow-hidden scroll-mt-28 border-t border-border bg-background/30 py-16 md:py-24"
                        >
                            {/* Capas geométricas detrás de la categoría */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                                style={{
                                    background:
                                        'radial-gradient(circle at 10% 0%, color-mix(in oklab, var(--o-amber) 20%, transparent) 0%, transparent 55%), radial-gradient(circle at 80% 30%, color-mix(in oklab, var(--o-warm) 18%, transparent) 0%, transparent 50%)',
                                }}
                                aria-hidden
                            />
                            <GeometricBackground variant={bgVariant} opacity={0.06} />
                            <GeometricBackground variant="grid-dots" opacity={0.04} />

                            <div className="relative z-10 mx-auto w-full max-w-6xl px-4">
                                <header className="mb-12 text-center md:mb-16">
                                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.4em] text-[var(--o-amber)]">
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
                                        <SoftwareSystemCard key={sys.slug} system={sys} />
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

