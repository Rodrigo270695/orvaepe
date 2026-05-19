import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

export type BillingPeriod = 'monthly' | 'annual';

export type SoftwarePlanTier = {
    key: string;
    title: string;
    plans: Partial<Record<BillingPeriod, SoftwarePricingPlan>>;
    /** Cualquier variante del tier (para ordenar / badges). */
    sample: SoftwarePricingPlan;
};

const RECURRING_SALE_MODELS = new Set(['saas_subscription', 'service_subscription']);

const BILLING_SUFFIX_RE =
    /\s*[—–-]\s*(mensual|anual|monthly|annual)\s*$/i;

export function isRecurringCatalogPlan(plan: SoftwarePricingPlan): boolean {
    const model = (plan.saleModel ?? '').toLowerCase();
    if (RECURRING_SALE_MODELS.has(model)) {
        return true;
    }

    const interval = (plan.billingInterval ?? '').toLowerCase();

    return interval === 'monthly' || interval === 'annual';
}

export function planBillingPeriod(plan: SoftwarePricingPlan): BillingPeriod | null {
    const interval = (plan.billingInterval ?? '').toLowerCase();
    if (interval === 'monthly') {
        return 'monthly';
    }
    if (interval === 'annual') {
        return 'annual';
    }

    const label = plan.label.toLowerCase();
    if (label.includes('anual') || label.includes('annual')) {
        return 'annual';
    }
    if (label.includes('mensual') || label.includes('monthly')) {
        return 'monthly';
    }

    return null;
}

export function tierKeyFromPlan(plan: SoftwarePricingPlan): string {
    const code = (plan.planCode ?? '').trim().toLowerCase();
    if (code !== '') {
        return code
            .replace(/-?(mensual|anual|monthly|annual)$/i, '')
            .replace(/^(vetsaas|saas|orvae)-/i, '')
            .trim();
    }

    return plan.label.replace(BILLING_SUFFIX_RE, '').trim().toLowerCase();
}

export function tierTitleFromPlan(plan: SoftwarePricingPlan): string {
    return plan.label.replace(BILLING_SUFFIX_RE, '').trim();
}

export function partitionSoftwarePricingPlans(plans: SoftwarePricingPlan[]): {
    recurringTiers: SoftwarePlanTier[];
    standalonePlans: SoftwarePricingPlan[];
} {
    const recurring: SoftwarePricingPlan[] = [];
    const standalone: SoftwarePricingPlan[] = [];

    for (const plan of plans) {
        if (isRecurringCatalogPlan(plan)) {
            recurring.push(plan);
        } else {
            standalone.push(plan);
        }
    }

    const tierMap = new Map<string, SoftwarePlanTier>();

    for (const plan of recurring) {
        const key = tierKeyFromPlan(plan);
        const period = planBillingPeriod(plan);

        let tier = tierMap.get(key);
        if (!tier) {
            tier = {
                key,
                title: tierTitleFromPlan(plan),
                plans: {},
                sample: plan,
            };
            tierMap.set(key, tier);
        }

        if (period) {
            tier.plans[period] = plan;
        } else if (!tier.plans.monthly && !tier.plans.annual) {
            tier.plans.monthly = plan;
        }
    }

    const recurringTiers = Array.from(tierMap.values()).sort((a, b) => {
        const priceA = a.sample.listPrice ?? Number.MAX_SAFE_INTEGER;
        const priceB = b.sample.listPrice ?? Number.MAX_SAFE_INTEGER;
        if (priceA !== priceB) {
            return priceA - priceB;
        }

        return a.title.localeCompare(b.title, 'es');
    });

    return { recurringTiers, standalonePlans: standalone };
}

export function tierHasBillingPeriod(
    tier: SoftwarePlanTier,
    period: BillingPeriod,
): boolean {
    return tier.plans[period] !== undefined;
}

export function resolvePlanForTier(
    tier: SoftwarePlanTier,
    period: BillingPeriod,
): SoftwarePricingPlan | null {
    return tier.plans[period] ?? tier.plans.monthly ?? tier.plans.annual ?? null;
}

export function pickDefaultBillingPeriod(
    tiers: SoftwarePlanTier[],
): BillingPeriod {
    const hasMonthly = tiers.some((t) => tierHasBillingPeriod(t, 'monthly'));
    const hasAnnual = tiers.some((t) => tierHasBillingPeriod(t, 'annual'));

    if (hasMonthly) {
        return 'monthly';
    }

    return hasAnnual ? 'annual' : 'monthly';
}

export function findTierForPlanId(
    tiers: SoftwarePlanTier[],
    planId: string,
): SoftwarePlanTier | null {
    for (const tier of tiers) {
        if (
            tier.plans.monthly?.id === planId ||
            tier.plans.annual?.id === planId
        ) {
            return tier;
        }
    }

    return null;
}
