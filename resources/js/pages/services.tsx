import { usePage } from '@inertiajs/react';

import MarketingLayout from '@/components/marketing/MarketingLayout';
import MarketingHero from '@/components/marketing/MarketingHero';
import LicenseOemSkuCard, {
    type LicenseSkuItem,
} from '@/components/marketing/LicenseOemSkuCard';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import Section from '@/components/welcome/Section';

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
    const { sections = [] } = usePage<PageProps>().props;

    return (
        <MarketingLayout title="Servicios">
            <MarketingHero
                eyebrow="Servicios"
                title={
                    <>
                        Correos, integraciones y
                        <span className="text-[var(--o-amber)]"> operación </span>
                        sin fricción
                    </>
                }
                description="Orvae no solo vende software: entregamos servicios y acompañamiento para que tu sistema funcione desde el primer día. Elige paquetes con precio de referencia, añade al carrito y coordina el alcance al cerrar la compra."
                ctas={[
                    { href: '/carrito', label: 'Ir al carrito', variant: 'primary' },
                    { href: '/contacto', label: 'Solicitar asesoría', variant: 'outline' },
                ]}
            />

            {sections.length === 0 ? (
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-card/40 p-10 text-center">
                        <p className="text-sm font-medium text-[var(--foreground)]">
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
                        {sections.map((section) => (
                            <Section
                                key={section.slug}
                                id={section.slug}
                                eyebrow="Catálogo"
                                title={section.title}
                                description={section.tagline ?? section.description ?? ''}
                            >
                                <div className="relative mt-8 overflow-hidden rounded-[1.25rem] border border-[color-mix(in_oklab,var(--border)_55%,transparent)] bg-[color-mix(in_oklab,var(--muted)_14%,transparent)] p-5 sm:p-7">
                                    <GeometricBackground variant="grid-dots" opacity={0.05} />
                                    <div className="relative z-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {section.items.map((item) => (
                                            <LicenseOemSkuCard
                                                key={item.id}
                                                item={item}
                                                productSlug={section.slug}
                                                sectionTitle={section.title}
                                                cartCategoryLabel="Servicios"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Section>
                        ))}
                    </div>
                </div>
            )}
        </MarketingLayout>
    );
}
