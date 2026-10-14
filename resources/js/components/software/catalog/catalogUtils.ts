import { normalizeSearchText } from '@/lib/normalizeSearchText';
import type { SoftwarePricingPlan, SoftwareSystem } from '@/marketplace/softwareCatalog';

export type CatalogBrand = 'vet' | 'taller' | null;

/** Colores por categoría (en orden), mismos tonos que el inicio. */
export const CATEGORY_COLORS = ['#2563EB', '#0D9488', '#EA580C', '#7C3AED', '#D97706'] as const;

export function categoryColor(index: number): string {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export function systemBrand(system: SoftwareSystem): CatalogBrand {
    const slug = system.slug.toLowerCase();

    if (slug === 'vetsaas' || slug === 'vet-saas') {
return 'vet';
}

    if (slug === 'tallersaas' || slug === 'taller-saas') {
return 'taller';
}

    return null;
}

const BRAND_COVERS: Record<'vet' | 'taller', string> = {
    vet: '/images/vetsaas-hero-pets.webp',
    taller: '/images/tallersaas/hero.jpg',
};

export function systemCover(system: SoftwareSystem): string | null {
    const fromCatalog = system.images?.find((u) => typeof u === 'string' && u.trim() !== '')?.trim();

    if (fromCatalog) {
return fromCatalog;
}

    const brand = systemBrand(system);

    return brand ? BRAND_COVERS[brand] : null;
}

function intervalSuffix(plan: SoftwarePricingPlan, price: string): string {
    if (/mes|mensual|año|anual/i.test(price)) {
        return '';
    }

    if (plan.billingInterval === 'monthly' || plan.saleModel === 'mensual') {
return ' /mes';
}

    if (plan.billingInterval === 'annual') {
return ' /año';
}

    return '';
}

/** "Desde S/ 59.90 /mes" con el plan pagado más barato; null si no hay precio. */
export function startingPrice(system: SoftwareSystem): { text: string; hasFree: boolean } | null {
    const plans = system.pricingPlans ?? [];
    const hasFree = plans.some((p) => p.isFreeSubscription || p.listPrice === 0);
    const paid = plans
        .filter((p) => typeof p.listPrice === 'number' && p.listPrice > 0)
        .sort((a, b) => (a.listPrice ?? 0) - (b.listPrice ?? 0));

    const cheapest = paid[0] ?? plans.find((p) => !p.isFreeSubscription && (p.priceNowText || p.priceText));

    if (!cheapest) {
        return hasFree ? { text: 'Gratis', hasFree } : null;
    }

    const price = cheapest.priceNowText || cheapest.priceText;

    if (!price) {
return hasFree ? { text: 'Gratis', hasFree } : null;
}

    return { text: `${price}${intervalSuffix(cheapest, price)}`, hasFree };
}

export function systemMatchesSearch(system: SoftwareSystem, rawQuery: string): boolean {
    const q = normalizeSearchText(rawQuery);

    if (!q) {
return true;
}

    const parts = [
        system.name,
        system.shortDescription,
        system.description,
        system.slug.replace(/-/g, ' '),
        ...(system.badges ?? []),
        ...(system.modules?.flatMap((m) => [m.name, m.description ?? '']) ?? []),
    ];

    return normalizeSearchText(parts.join(' ')).includes(q);
}
