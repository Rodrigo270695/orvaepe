import { usePage } from '@inertiajs/react';

import SeoHead, { type SeoDefaults } from '@/components/seo/SeoHead';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import { marketingSeo } from '@/marketing/seoCopy';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import HomeFeaturedServices from '@/components/welcome/HomeFeaturedServices';
import HomeHero from '@/components/welcome/HomeHero';
import HomeSaasShowcase from '@/components/welcome/HomeSaasShowcase';
import MissionVision from '@/components/welcome/MissionVision';
import OfferingsSummary from '@/components/welcome/OfferingsSummary';
import PortfolioHomeTeaser from '@/components/welcome/PortfolioHomeTeaser';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import TestimonialsSection from '@/components/welcome/TestimonialsSection';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';

import '@/components/welcome/home-orvae.css';

function homeProductJsonLd(siteUrl: string) {
    const origin = siteUrl.replace(/\/$/, '');

    return [
        {
            '@type': 'ItemList',
            name: 'SaaS desarrollados por ORVAE',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    item: {
                        '@type': 'SoftwareApplication',
                        name: 'VetSaaS',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Web',
                        url: `${origin}/software/VETSAAS`,
                        description:
                            'Software veterinario en Perú: historia clínica, agenda, WhatsApp, SUNAT y PWA.',
                    },
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    item: {
                        '@type': 'SoftwareApplication',
                        name: 'TallerSaaS',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Web',
                        url: `${origin}/software/TALLERSAAS`,
                        description:
                            'Software para talleres mecánicos y car wash: órdenes, WhatsApp, inventario y SUNAT.',
                    },
                },
            ],
        },
    ];
}

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { seo } = usePage<{ seo: SeoDefaults }>().props;

    return (
        <>
            <SeoHead
                title={marketingSeo.home.title}
                description={marketingSeo.home.description}
                canonicalPath="/"
                keywords={marketingSeo.home.keywords}
                jsonLd={homeProductJsonLd(seo.siteUrl)}
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
                    <div className="h-20 shrink-0" aria-hidden />
                    <AppearanceFloatingRailToggle />

                    <main id="main-content" className="outline-none">
                        <HomeHero />
                        <HomeSaasShowcase />
                        <HomeFeaturedServices />
                        <div className="landing-section-flair mx-4 px-4" aria-hidden />
                        <ScrollReveal direction="up">
                            <OfferingsSummary />
                        </ScrollReveal>
                        <div className="landing-section-flair mx-4 px-4" aria-hidden />
                        <ScrollReveal direction="up">
                            <MissionVision />
                        </ScrollReveal>
                        <div className="landing-section-flair mx-4 px-4" aria-hidden />
                        <ScrollReveal direction="up">
                            <PortfolioHomeTeaser />
                        </ScrollReveal>
                        <div className="landing-section-flair mx-4 px-4" aria-hidden />
                        <ScrollReveal direction="up">
                            <TestimonialsSection />
                        </ScrollReveal>
                        <div className="landing-section-flair mx-4 px-4" aria-hidden />
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
