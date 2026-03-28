import { Link } from '@inertiajs/react';

import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import SeoHead from '@/components/seo/SeoHead';
import SoftwareCategories from '@/components/software/SoftwareCategories';
import SoftwareDevelopmentHero from '@/components/software/SoftwareDevelopmentHero';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import { marketingSeo } from '@/marketing/seoCopy';
import type { SoftwareSystem } from '@/marketplace/softwareCatalog';

export type MarketingSoftwareCategorySection = {
    slug: string;
    title: string;
    description: string;
    systems: SoftwareSystem[];
};

export default function Software({
    canRegister = true,
    softwareCategories: softwareCategoriesFromCatalog = [],
    softwareCatalogSearch = null,
}: {
    canRegister?: boolean;
    softwareCategories?: MarketingSoftwareCategorySection[];
    softwareCatalogSearch?: string | null;
}) {
    return (
        <>
            <SeoHead
                title={marketingSeo.software.title}
                description={marketingSeo.software.description}
                canonicalPath="/software"
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Software', path: '/software' },
                ]}
            />

            <div className="landing-page relative min-h-screen text-foreground">
                <div className="landing-grain absolute inset-0 z-0" aria-hidden />
                <div className="landing-ambient-orbs" aria-hidden>
                    <div className="landing-orb landing-orb--a" />
                    <div className="landing-orb landing-orb--b" />
                </div>
                <div className="relative z-[1]">
                <MarketingUnifiedNavbar canRegister={canRegister} />
                <div className="h-20 shrink-0" aria-hidden />
                <AppearanceFloatingRailToggle />

                <main>
                    <ScrollReveal direction="up">
                        <SoftwareDevelopmentHero />
                    </ScrollReveal>
                    <div className="landing-section-flair mx-4 px-4" aria-hidden />

                    {softwareCatalogSearch ? (
                        <div className="mx-auto max-w-6xl px-4 pb-2">
                            <p className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_22%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_8%,transparent)] px-4 py-3 text-sm text-foreground">
                                <span className="text-muted-foreground">Filtrando por:</span>{' '}
                                <span className="font-semibold">«{softwareCatalogSearch}»</span>
                                <Link
                                    href="/software"
                                    className="ml-3 font-semibold text-[var(--state-info)] underline-offset-4 hover:underline"
                                >
                                    Quitar filtro
                                </Link>
                            </p>
                        </div>
                    ) : null}

                    <SoftwareCategories
                        catalogSections={
                            softwareCategoriesFromCatalog.length > 0
                                ? softwareCategoriesFromCatalog
                                : undefined
                        }
                        searchQuery={softwareCatalogSearch}
                    />
                </main>

                <ScrollReveal direction="up">
                    <WelcomeFooter />
                </ScrollReveal>

                <ScrollToTopButton />
                </div>
            </div>
        </>
    );
}

