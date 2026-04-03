import SeoHead from '@/components/seo/SeoHead';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import { marketingSeo } from '@/marketing/seoCopy';
import PageHero from '@/components/marketing/PageHero';
import { getMarketingHeroNavCtas } from '@/marketing/marketingHeroNavCtas';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import ClientsCarousel from '@/components/welcome/ClientsCarousel';
import MissionVision from '@/components/welcome/MissionVision';
import OfferingsSummary from '@/components/welcome/OfferingsSummary';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import TestimonialsSection from '@/components/welcome/TestimonialsSection';
import HomeFeaturedServices from '@/components/welcome/HomeFeaturedServices';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import type { ShowcaseClientPublic } from '@/types/showcase-client';

export default function Welcome({
    canRegister = true,
    showcaseClients = [],
}: {
    canRegister?: boolean;
    showcaseClients?: ShowcaseClientPublic[];
}) {
    return (
        <>
            <SeoHead
                title={marketingSeo.home.title}
                description={marketingSeo.home.description}
                canonicalPath="/"
            />

            {/* Skip link: visible solo al recibir foco (WCAG 2.1 AA) */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-[color-mix(in_oklab,var(--state-info)_50%,var(--border))] focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                Saltar al contenido principal
            </a>

            <div className="landing-page relative min-h-screen text-foreground">
                {/* Textura sutil: profundidad en claro/oscuro sin cargar peso visual */}
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
                    <PageHero
                        id="inicio"
                        eyebrow="Listo para usar hoy"
                        title={
                            <>
                                Empieza a operar{' '}
                                <span className="bg-gradient-to-br from-foreground via-[var(--o-amber)] to-[var(--o-tech)] bg-clip-text text-transparent dark:from-[var(--o-cream2)]">
                                    mañana
                                </span>
                            </>
                        }
                        description="Sistemas de contabilidad, ventas, inventario y más: ya construidos, probados y listos. Elige SaaS, licencia perpetua o módulos sueltos — en días, no en meses."
                        ctas={getMarketingHeroNavCtas('home')}
                    />
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
                        <ClientsCarousel clients={showcaseClients} />
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

