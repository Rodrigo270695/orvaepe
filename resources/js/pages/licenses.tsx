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
    { title: 'Elige tu licencia', text: 'Busca por marca o explora por categoría y añádela al carrito.' },
    { title: 'Paga seguro', text: 'Tarjeta o Yape con Culqi. Emitimos boleta o factura.' },
    { title: 'Recibe tu clave', text: 'Te enviamos la activación al confirmar el pago.' },
] as const;

export default function Licenses() {
    const { sections = [], canRegister = true } = usePage<PageProps>().props;

    return (
        <>
            <SeoHead
                title={marketingSeo.licencias.title}
                description={marketingSeo.licencias.description}
                canonicalPath="/licencias"
                breadcrumbs={[
                    { name: 'Inicio', path: '/' },
                    { name: 'Licencias', path: '/licencias' },
                ]}
            />

            <MarketingCatalogPage
                sections={sections}
                canRegister={canRegister}
                eyebrow="Licencias originales · Entrega digital"
                title={
                    <>
                        Licencias originales{' '}
                        <span className="bg-gradient-to-br from-foreground via-[var(--o-amber)] to-[var(--o-tech)] bg-clip-text text-transparent dark:from-[var(--o-cream2)]">
                            para tu equipo.
                        </span>
                    </>
                }
                description="Windows, Office, antivirus, Canva y más. Añade al carrito, paga en soles con tarjeta o Yape y recibe tu clave de activación."
                itemNoun={{ singular: 'licencia', plural: 'Licencias' }}
                steps={STEPS}
                searchPlaceholder="Busca Windows, Office, ESET…"
                whatsappMessage="Hola ORVAE, vengo del catálogo de licencias y quiero una cotización."
                cartCategoryLabel="Licencias"
                showImage
                closingTitle="¿No encuentras tu licencia?"
                closingText="Trabajamos con más marcas y volúmenes de las que listamos. Escríbenos y te cotizamos al momento, también para empresas."
            />
        </>
    );
}
