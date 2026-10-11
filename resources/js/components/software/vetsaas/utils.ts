import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import { PLAN_ORDER } from './data';

export function planCodigoFromSku(plan: SoftwarePricingPlan): string {
    const cleaned = (plan.planCode ?? '')
        .toLowerCase()
        .replace(/^(vetsaas|saas|orvae)-/i, '')
        .replace(/-?(mensual|anual|monthly|annual)$/i, '')
        .trim();

    if ((PLAN_ORDER as readonly string[]).includes(cleaned)) {
        return cleaned;
    }

    const label = plan.label.toLowerCase();
    if (label.includes('free') || label.includes('gratis')) return 'free';
    if (label.includes('starter')) return 'starter';
    if (label.includes('pro')) return 'pro';
    if (label.includes('clínica') || label.includes('clinica')) return 'clinica';
    return cleaned || 'starter';
}
