import { usePage } from '@inertiajs/react';

import PageHero from '@/components/marketing/PageHero';
import { getMarketingHeroNavCtas } from '@/marketing/marketingHeroNavCtas';
import MarketingUnifiedNavbar from '@/components/marketing/MarketingUnifiedNavbar';
import SeoHead from '@/components/seo/SeoHead';
import { marketingSeo } from '@/marketing/seoCopy';
import LicenseOemSkuCard, {
    type LicenseSkuItem,
} from '@/components/marketing/LicenseOemSkuCard';
import AppearanceFloatingRailToggle from '@/components/welcome/AppearanceFloatingRailToggle';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import ScrollReveal from '@/components/welcome/ScrollReveal';
import ScrollToTopButton from '@/components/welcome/ScrollToTopButton';
import Section from '@/components/welcome/Section';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';

type ServiceSection = {
    slug: string;
    title: string;
    tagline: string | null;
    description: string | null;
    items: LicenseSkuItem[];
};

type PageProps = {
    canRegister?: boolean;
    sections?: ServiceSection[];
};

export default function Services() {
    const semanticAccents = [
        'var(--state-info)',
        'var(--state-success)',
        'var(--state-alert)',
        'var(--state-danger)',
    ] as const;
    const { sections = [], canRegister = true } = usePage<PageProps>().props;

    return (
        <>
            <SeoHead
                title={marketingSeo.servicios.title}
                description={marketingSeo.servicios.description}
                canonicalPath="/servicios"
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Servicios', path: '/servicios' },
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
                    <div className="h-16 shrink-0" aria-hidden />
                    <AppearanceFloatingRailToggle />

                    <main>
                        <ScrollReveal direction="up">
                            <PageHero
                                id="inicio"
                                eyebrow="Servicios operativos"
                                title={
                                    <>
                                        Correos, integraciones y{' '}
                                        <span className="bg-gradient-to-br from-foreground via-[var(--state-alert)] to-[var(--state-info)] bg-clip-text text-transparent dark:from-[var(--o-cream2)]">
                                            operación sin fricción
                                        </span>
                                    </>
                                }
                                description="Orvae no solo vende software: entregamos servicios y acompañamiento para que tu sistema funcione desde el primer día. Elige paquetes con precio de referencia, añade al carrito y coordina el alcance al cerrar la compra."
                                ctas={getMarketingHeroNavCtas('servicios')}
                            />
                        </ScrollReveal>
                        <div className="landing-section-flair mx-4 px-4" aria-hidden />

                        {sections.length === 0 ? (
                            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                                <div className="rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--state-alert)_35%,var(--border))] bg-[color-mix(in_oklab,var(--state-alert)_9%,transparent)] p-10 text-center">
                                    <p className="text-sm font-medium text-[color-mix(in_oklab,var(--state-alert)_80%,var(--foreground))]">
                                        Catálogo de servicios en configuración
                                    </p>
                                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                                        Ejecuta las migraciones y el seeder{' '}
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                            MarketingServicesCatalogSeeder
                                        </code>{' '}
                                        para cargar secciones y precios.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_100%,transparent)_1px,transparent_1px)] [background-size:20px_20px]"
                                    aria-hidden
                                />
                                <div className="relative z-10 space-y-4 pb-16">
                                    {sections.map((section, index) => {
                                        const accent =
                                            semanticAccents[index % semanticAccents.length];
                                        const geoVariant: 'grid-dots' | 'diagonal-lines' | 'grid-hex' =
                                            index % 3 === 0
                                                ? 'grid-dots'
                                                : index % 3 === 1
                                                  ? 'diagonal-lines'
                                                  : 'grid-hex';

                                        return (
                                            <ScrollReveal key={section.slug} direction="up">
                                                <>
                                                    <Section
                                                        id={section.slug}
                                                        eyebrow="Catálogo"
                                                        title={section.title}
                                                        description={section.tagline ?? section.description ?? ''}
                                                        accent={accent}
                                                    >
                                                        <div
                                                            className="relative mt-8 overflow-hidden rounded-[1.25rem] border p-5 sm:p-7"
                                                            style={{
                                                                borderColor: `color-mix(in oklab, ${accent} 30%, var(--border))`,
                                                                background: `color-mix(in oklab, ${accent} 8%, transparent)`,
                                                            }}
                                                        >
                                                            <GeometricBackground
                                                                variant={geoVariant}
                                                                opacity={0.05}
                                                            />
                                                            <div className="relative z-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                                {section.items.map((item) => (
                                                                    <LicenseOemSkuCard
                                                                        key={item.id}
                                                                        item={item}
                                                                        productSlug={section.slug}
                                                                        sectionTitle={section.title}
                                                                        cartCategoryLabel="Servicios"
                                                                        detailHref={`/servicios/${section.slug}?sku=${item.id}`}
                                                                        accent={accent}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Section>
                                                    {index < sections.length - 1 ? (
                                                        <div
                                                            className="landing-section-flair mx-4 px-4"
                                                            aria-hidden
                                                        />
                                                    ) : null}
                                                </>
                                            </ScrollReveal>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
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
