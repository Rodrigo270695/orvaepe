import { Head } from '@inertiajs/react';

import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import SoftwareCategories from '@/components/software/SoftwareCategories';
import SoftwareDevelopmentHero from '@/components/software/SoftwareDevelopmentHero';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import CTASection from '@/components/welcome/sections/CTASection';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
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
}: {
    canRegister?: boolean;
    softwareCategories?: MarketingSoftwareCategorySection[];
}) {
    return (
        <>
            <Head title="Orvae ERP — Software desarrollado" />

            <div className="min-h-screen bg-background text-foreground">
                <MarketingUnifiedNavbar canRegister={canRegister} />
                <div className="h-16 shrink-0" aria-hidden />
                <AppearanceFloatingRailToggle />

                <main>
                    <ScrollReveal direction="up">
                        <SoftwareDevelopmentHero />
                    </ScrollReveal>

                    <SoftwareCategories
                        catalogSections={
                            softwareCategoriesFromCatalog.length > 0
                                ? softwareCategoriesFromCatalog
                                : undefined
                        }
                    />
                </main>

                <ScrollReveal direction="up">
                    <CTASection />
                </ScrollReveal>

                <ScrollReveal direction="up">
                    <WelcomeFooter />
                </ScrollReveal>

                <ScrollToTopButton />
            </div>
        </>
    );
}

