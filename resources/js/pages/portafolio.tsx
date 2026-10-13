import { usePage } from '@inertiajs/react';

import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import { featuredSaasFromCatalog } from '@/components/portfolio/featuredPortfolio';
import PortfolioClientsShowcase from '@/components/portfolio/PortfolioClientsShowcase';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import PortfolioSystemsShowcase from '@/components/portfolio/PortfolioSystemsShowcase';
import SeoHead, { type SeoDefaults } from '@/components/seo/SeoHead';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import HomeClosingCta from '@/components/welcome/HomeClosingCta';
import HomeColorStrip from '@/components/welcome/HomeColorStrip';
import HomeMotion from '@/components/welcome/HomeMotion';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import { marketingSeo } from '@/marketing/seoCopy';
import type { MarketingSoftwareCategorySection } from '@/pages/software';
import type { ShowcaseClientPublic } from '@/types/showcase-client';

import '@/components/welcome/home-orvae.css';

function portfolioJsonLd(
    siteUrl: string,
    systems: { name: string; slug: string; shortDescription: string }[],
) {
    const origin = siteUrl.replace(/\/$/, '');
    return [
        {
            '@type': 'ItemList',
            name: 'Portafolio de software ORVAE',
            itemListElement: systems.slice(0, 12).map((system, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'SoftwareApplication',
                    name: system.name,
                    applicationCategory: 'BusinessApplication',
                    operatingSystem: 'Web',
                    url: `${origin}/software/${system.slug}`,
                    description: system.shortDescription,
                },
            })),
        },
    ];
}

export default function Portafolio({
    canRegister = true,
    softwareCategories = [],
    showcaseClients = [],
}: {
    canRegister?: boolean;
    softwareCategories?: MarketingSoftwareCategorySection[];
    showcaseClients?: ShowcaseClientPublic[];
}) {
    const { seo } = usePage<{ seo: SeoDefaults }>().props;
    const systemCount = softwareCategories.reduce((n, c) => n + c.systems.length, 0);
    const categoryCount = softwareCategories.length;
    const clientCount = showcaseClients.length;
    const featured = featuredSaasFromCatalog(softwareCategories);
    const systems = softwareCategories.flatMap((c) => c.systems);

    return (
        <>
            <SeoHead
                title={marketingSeo.portafolio.title}
                description={marketingSeo.portafolio.description}
                canonicalPath="/portafolio"
                keywords={marketingSeo.portafolio.keywords}
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Portafolio', path: '/portafolio' },
                ]}
                jsonLd={portfolioJsonLd(seo.siteUrl, systems)}
            />

            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:shadow-lg"
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
                            <PortfolioHero
                                systemCount={systemCount}
                                categoryCount={categoryCount}
                                clientCount={clientCount}
                                featured={featured}
                            />
                            <HomeColorStrip />
                            <PortfolioSystemsShowcase catalogSections={softwareCategories} />
                            <PortfolioClientsShowcase clients={showcaseClients} />
                            <HomeClosingCta />
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
