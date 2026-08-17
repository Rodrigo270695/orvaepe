import { Link } from '@inertiajs/react';

import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import SeoHead from '@/components/seo/SeoHead';
import PortfolioClientsShowcase from '@/components/portfolio/PortfolioClientsShowcase';
import PortfolioSystemsShowcase from '@/components/portfolio/PortfolioSystemsShowcase';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import { getMarketingHeroNavCtas } from '@/marketing/marketingHeroNavCtas';
import { marketingSeo } from '@/marketing/seoCopy';
import type { MarketingSoftwareCategorySection } from '@/pages/software';
import type { ShowcaseClientPublic } from '@/types/showcase-client';

export default function Portafolio({
    canRegister = true,
    softwareCategories = [],
    showcaseClients = [],
}: {
    canRegister?: boolean;
    softwareCategories?: MarketingSoftwareCategorySection[];
    showcaseClients?: ShowcaseClientPublic[];
}) {
    const systemCount = softwareCategories.reduce((n, c) => n + c.systems.length, 0);
    const categoryCount = softwareCategories.length;
    const clientCount = showcaseClients.length;
    const ctas = getMarketingHeroNavCtas('portafolio');

    return (
        <>
            <SeoHead
                title={marketingSeo.portafolio.title}
                description={marketingSeo.portafolio.description}
                canonicalPath="/portafolio"
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Portafolio', path: '/portafolio' },
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
                        <section
                            id="inicio"
                            className="relative overflow-hidden scroll-mt-28 py-16 md:py-24"
                        >
                            <GeometricBackground variant="floating-shapes" opacity={0.08} />
                            <GeometricBackground variant="grid-dots" opacity={0.04} />

                            <div className="landing-section-flair mx-4 mb-12 px-4" aria-hidden />

                            <div className="relative mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
                                <LandingSectionHeader
                                    eyebrow="Portafolio"
                                    title="Sistemas que ya operan con ORVAE"
                                    description="Sistemas y empresas en operación: tarjetas grandes para entrar a cada plataforma con un clic."
                                    variant="sparkles"
                                    layout="wide"
                                    titleSize="hero"
                                    descriptionClassName="mt-4 max-w-xl text-base font-body"
                                />

                                <dl className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3">
                                    {[
                                        { label: 'Sistemas', value: systemCount },
                                        { label: 'Rubros', value: categoryCount },
                                        { label: 'Empresas', value: clientCount },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="rounded-2xl border border-border/70 bg-card/60 px-3 py-4 backdrop-blur-sm"
                                        >
                                            <dt className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                {stat.label}
                                            </dt>
                                            <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground md:text-3xl">
                                                {stat.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>

                                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                    <a
                                        href="#clientes"
                                        className="inline-flex min-h-12 min-w-[10rem] items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_6px_24px_-6px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        Ver plataformas
                                    </a>
                                    <a
                                        href="#sistemas"
                                        className="inline-flex min-h-12 min-w-[10rem] items-center justify-center rounded-xl border-2 border-[color-mix(in_oklab,var(--foreground)_22%,var(--border))] bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_55%,var(--border))] hover:bg-[color-mix(in_oklab,var(--primary)_10%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        Ver sistemas
                                    </a>
                                    {ctas.map((cta) => (
                                        <Link
                                            key={cta.href + cta.label}
                                            href={cta.href}
                                            className="inline-flex min-h-12 min-w-[10rem] items-center justify-center rounded-xl border-2 border-[color-mix(in_oklab,var(--foreground)_22%,var(--border))] bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_55%,var(--border))] hover:bg-[color-mix(in_oklab,var(--primary)_10%,var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            {cta.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="landing-section-flair mx-4 mt-12 px-4" aria-hidden />
                        </section>

                        <ScrollReveal direction="up">
                            <PortfolioClientsShowcase clients={showcaseClients} />
                        </ScrollReveal>
                        <div className="landing-section-flair mx-4 px-4" aria-hidden />
                        <ScrollReveal direction="up">
                            <PortfolioSystemsShowcase catalogSections={softwareCategories} />
                        </ScrollReveal>
                        <div className="landing-section-flair mx-4 px-4" aria-hidden />

                        <section className="relative py-16 md:py-20">
                            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                                <p className="font-mono text-xs font-semibold uppercase tracking-[0.35em] text-[var(--o-amber)]">
                                    Siguiente paso
                                </p>
                                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                                    ¿Quieres un sistema así en tu operación?
                                </h2>
                                <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
                                    Revisa planes y precios en el catálogo, o escríbenos para una demo
                                    con tu rubro.
                                </p>
                                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                    <Link
                                        href="/software"
                                        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-[1.05]"
                                    >
                                        Ir al catálogo
                                    </Link>
                                    <Link
                                        href="/contacto"
                                        className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-[color-mix(in_oklab,var(--foreground)_22%,var(--border))] bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_55%,var(--border))]"
                                    >
                                        Pedir demo
                                    </Link>
                                </div>
                            </div>
                        </section>
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
