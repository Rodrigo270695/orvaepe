import SeoHead from '@/components/seo/SeoHead';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import { marketingSeo } from '@/marketing/seoCopy';
import PageHero from '@/components/marketing/PageHero';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import ClientsCarousel from '@/components/welcome/ClientsCarousel';
import MissionVision from '@/components/welcome/MissionVision';
import OfferingsSummary from '@/components/welcome/OfferingsSummary';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import TestimonialsSection from '@/components/welcome/TestimonialsSection';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    return (
        <>
            <SeoHead
                title={marketingSeo.home.title}
                description={marketingSeo.home.description}
                canonicalPath="/"
            />

            <div className="min-h-screen bg-background text-foreground">
                <MarketingUnifiedNavbar canRegister={canRegister} />
                <div className="h-16 shrink-0" aria-hidden />
                <AppearanceFloatingRailToggle />

                <main>
                    <PageHero
                        id="inicio"
                        eyebrow="Software desarrollado"
                        title={
                            <>
                                Sistemas desarrollados para
                                <span className="text-[var(--o-amber)]"> operar</span>
                            </>
                        }
                        description="Software ya construido y listo para usar: contabilidad, ventas, inventario y más. Elige SaaS, licencia o módulos sueltos con implementación en días o semanas."
                        ctas={[
                            { href: '#contacto', label: 'Solicitar demo', variant: 'outline' },
                            { href: '/software', label: 'Ver software', variant: 'primary' },
                            { href: '/licencias', label: 'Ver licencias', variant: 'outline' },
                        ]}
                    />
                    <ScrollReveal direction="up">
                        <OfferingsSummary />
                    </ScrollReveal>
                    <ScrollReveal direction="up">
                        <MissionVision />
                    </ScrollReveal>
                    <ScrollReveal direction="up">
                        <ClientsCarousel />
                    </ScrollReveal>
                    <ScrollReveal direction="up">
                        <TestimonialsSection />
                    </ScrollReveal>
                </main>

                <ScrollReveal direction="up">
                    <WelcomeFooter />
                </ScrollReveal>
                <ScrollToTopButton />
            </div>
        </>
    );
}

