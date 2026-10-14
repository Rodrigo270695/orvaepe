import { useMemo } from 'react';

import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import SeoHead from '@/components/seo/SeoHead';
import { systemMatchesSearch } from '@/components/software/catalog/catalogUtils';
import SoftwareCatalogClosingCta from '@/components/software/catalog/SoftwareCatalogClosingCta';
import SoftwareCatalogHero from '@/components/software/catalog/SoftwareCatalogHero';
import SoftwareCatalogSection from '@/components/software/catalog/SoftwareCatalogSection';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import HomeMotion from '@/components/welcome/HomeMotion';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import { marketingSeo } from '@/marketing/seoCopy';
import { getSystemsByCategory, softwareCategories } from '@/marketplace/softwareCatalog';
import type { SoftwareSystem } from '@/marketplace/softwareCatalog';

import '@/components/welcome/home-orvae.css';

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
    const sections = useMemo((): MarketingSoftwareCategorySection[] => {
        if (softwareCategoriesFromCatalog.length > 0) {
            return softwareCategoriesFromCatalog;
        }

        return softwareCategories
            .map((cat) => ({
                slug: cat.slug,
                title: cat.title,
                description: cat.description,
                systems: getSystemsByCategory(cat.slug),
            }))
            .filter((cat) => cat.systems.length > 0);
    }, [softwareCategoriesFromCatalog]);

    const colorIndex = useMemo(
        () => Object.fromEntries(sections.map((s, i) => [s.slug, i])),
        [sections],
    );

    const filteredSections = useMemo(() => {
        const q = softwareCatalogSearch?.trim();

        if (!q) {
            return sections;
        }

        return sections
            .map((cat) => ({ ...cat, systems: cat.systems.filter((sys) => systemMatchesSearch(sys, q)) }))
            .filter((cat) => cat.systems.length > 0);
    }, [sections, softwareCatalogSearch]);

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

            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-[color-mix(in_oklab,var(--state-info)_50%,var(--border))] focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                Saltar al contenido principal
            </a>

            <div className="landing-page relative min-h-screen text-foreground">
                <div className="landing-grain absolute inset-0 z-0" aria-hidden />
                <div className="landing-ambient-orbs" aria-hidden>
                    <div className="landing-orb landing-orb--a" />
                    <div className="landing-orb landing-orb--b" />
                </div>
                <div className="relative z-[1]">
                    <MarketingUnifiedNavbar canRegister={canRegister} />
                    <div className="h-[5.5rem] shrink-0" aria-hidden />
                    <AppearanceFloatingRailToggle />

                    <HomeMotion>
                        <main id="main-content" className="outline-none">
                            <SoftwareCatalogHero sections={sections} />
                            <SoftwareCatalogSection
                                sections={filteredSections}
                                colorIndex={colorIndex}
                                searchQuery={softwareCatalogSearch}
                            />
                            <SoftwareCatalogClosingCta />
                        </main>
                    </HomeMotion>

                    <ScrollReveal direction="up">
                        <WelcomeFooter />
                    </ScrollReveal>
                    <ScrollToTopButton />
                </div>
            </div>
        </>
    );
}
