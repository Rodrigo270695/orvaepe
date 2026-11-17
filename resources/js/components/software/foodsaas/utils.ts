import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

const PLAN_CODES = ['free', 'starter', 'pro', 'restaurante', 'multi_sede'] as const;

export type FoodPlanCodigo = (typeof PLAN_CODES)[number];

export function visiblePlanBadge(badge: string | null | undefined): string | null {
    const text = badge?.trim();

    return text && !/^normal$/i.test(text) ? text : null;
}

/**
 * Mismo criterio que SaasCatalogSku::normalizePlanSlug:
 * el SKU del catálogo ORVAE se une al plan de FoodSaaS por codigo.
 */
export function planCodigoFromSku(plan: SoftwarePricingPlan): string {
    const raw = `${plan.planCode ?? ''} ${plan.label}`.toLowerCase();

    if (raw.includes('free') || raw.includes('gratis')) {
        return 'free';
    }

    if (raw.includes('multi_sede') || raw.includes('multi-sede') || raw.includes('multisede')) {
        return 'multi_sede';
    }

    if (raw.includes('restaurante')) {
        return 'restaurante';
    }

    if (raw.includes('starter')) {
        return 'starter';
    }

    if (/\bpro\b/.test(raw)) {
        return 'pro';
    }

    const cleaned = (plan.planCode ?? '')
        .toLowerCase()
        .replace(/^(foodsaas|food-saas|saas|orvae)-/i, '')
        .replace(/-?(mensual|anual|monthly|annual)$/i, '')
        .replace(/-/g, '_')
        .trim();

    if ((PLAN_CODES as readonly string[]).includes(cleaned)) {
        return cleaned;
    }

    return cleaned || 'starter';
}
