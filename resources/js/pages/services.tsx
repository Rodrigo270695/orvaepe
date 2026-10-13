import { usePage } from '@inertiajs/react';

import MarketingCatalogPage from '@/components/catalog/MarketingCatalogPage';
import type { CatalogSection } from '@/components/catalog/MarketingCatalogPage';
import SeoHead from '@/components/seo/SeoHead';
import { marketingSeo } from '@/marketing/seoCopy';

type PageProps = {
    canRegister?: boolean;
    sections?: CatalogSection[];
};

const STEPS = [
    { title: 'Elige el paquete', text: 'Cada servicio tiene precio de referencia y alcance claro.' },
    { title: 'Paga seguro', text: 'Tarjeta o Yape con Culqi. Emitimos boleta o factura.' },
    { title: 'Coordinamos y ejecutamos', text: 'Te contactamos para afinar el alcance y agendar el trabajo.' },
] as const;

export default function Services() {
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

            <MarketingCatalogPage
                sections={sections}
                canRegister={canRegister}
                eyebrow="Servicios ORVAE"
                title={
                    <>
                        Correos, integraciones y{' '}
                        <span className="bg-gradient-to-br from-foreground via-[var(--o-amber)] to-[var(--o-tech)] bg-clip-text text-transparent dark:from-[var(--o-cream2)]">
                            operación sin fricción.
                        </span>
                    </>
                }
                description="No solo vendemos software: te acompañamos para que funcione desde el primer día. Paquetes con precio de referencia; al cerrar la compra coordinamos el alcance contigo."
                itemNoun={{ singular: 'servicio', plural: 'Servicios' }}
                steps={STEPS}
                searchPlaceholder="Busca correo, integración, soporte…"
                whatsappMessage="Hola ORVAE, vengo de la página de servicios y quiero una cotización."
                cartCategoryLabel="Servicios"
                detailHref={(section, item) => `/servicios/${section.slug}?sku=${item.id}`}
                closingTitle="¿Necesitas algo a tu medida?"
                closingText="Si tu caso no encaja en un paquete, cuéntanos qué necesitas y armamos una propuesta con alcance y tiempos claros."
            />
        </>
    );
}
