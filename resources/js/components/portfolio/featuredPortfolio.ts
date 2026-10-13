import type { MarketingSoftwareCategorySection } from '@/pages/software';
import type { SoftwareSystem } from '@/marketplace/softwareCatalog';

export type FeaturedSaasCard = {
    slug: string;
    name: string;
    hint: string;
    description: string;
    href: string;
    image: string;
    accent: string;
};

const FALLBACK: FeaturedSaasCard[] = [
    {
        slug: 'VETSAAS',
        name: 'VetSaaS',
        hint: 'Clínicas veterinarias',
        description: 'Historia clínica, agenda, WhatsApp y SUNAT en el subdominio de tu clínica.',
        href: '/software/VETSAAS',
        image: '/images/vetsaas-hero-pets.webp',
        accent: '#0d9488',
    },
    {
        slug: 'TALLERSAAS',
        name: 'TallerSaaS',
        hint: 'Talleres y car wash',
        description: 'Órdenes, lavado, repuestos y boleta en el mismo piso del taller.',
        href: '/software/TALLERSAAS',
        image: '/images/tallersaas/hero.jpg',
        accent: '#ea580c',
    },
];

export function isFeaturedPortfolioSystem(system: Pick<SoftwareSystem, 'slug' | 'name'>): boolean {
    return /vetsaas|tallersaas/i.test(`${system.slug} ${system.name}`);
}

export function featuredSaasFromCatalog(
    sections: MarketingSoftwareCategorySection[],
): FeaturedSaasCard[] {
    const systems = sections.flatMap((s) => s.systems);
    return FALLBACK.map((base) => {
        const found = systems.find((sys) => isFeaturedPortfolioSystem(sys) && new RegExp(base.slug, 'i').test(`${sys.slug} ${sys.name}`));
        if (!found) {
            return base;
        }
        const cover = found.images?.find((u) => typeof u === 'string' && u.trim() !== '')?.trim();
        return {
            ...base,
            name: found.name || base.name,
            description: found.shortDescription || base.description,
            href: `/software/${found.slug}`,
            image: cover || base.image,
        };
    });
}
