import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import { COMPARISON, PLAN_META, PLAN_ORDER, type TallerPlanCodigo } from './data';
import type { TallerSaaSMarketing } from './types';

export type ComparisonTable = {
    columns: { codigo: string; nombre: string }[];
    rows: { key: string; label: string; values: Record<string, string> }[];
};

/** Tabla de límites: datos del panel de TallerSaaS si llegaron; si no, la copia fija de data.ts. */
export function comparisonTable(marketing: TallerSaaSMarketing | null | undefined): ComparisonTable {
    if (marketing && marketing.plans.length > 0 && marketing.comparison.length > 0) {
        return {
            columns: marketing.plans.map((plan) => ({ codigo: plan.codigo, nombre: plan.nombre })),
            rows: marketing.comparison,
        };
    }

    return {
        columns: PLAN_ORDER.map((codigo) => ({ codigo, nombre: PLAN_META[codigo].nombre })),
        rows: COMPARISON.map(({ label, ...values }) => ({ key: label, label, values })),
    };
}

export function planCodigoFromSku(plan: SoftwarePricingPlan): TallerPlanCodigo {
    const cleaned = (plan.planCode ?? '')
        .toLowerCase()
        .replace(/^(tallersaas|saas|orvae)-/i, '')
        .replace(/-?(mensual|anual|monthly|annual|free)_?/gi, ' ')
        .replace(/[_-]+/g, ' ')
        .trim();

    if (cleaned.includes('experto')) return 'experto';
    if (cleaned.includes('basico') || cleaned.includes('básico')) return 'basico';
    if (/\bpro\b/.test(cleaned)) return 'pro';
    if (cleaned.includes('free') || cleaned.includes('gratis')) return 'free';

    const label = plan.label.toLowerCase();
    if (label.includes('experto')) return 'experto';
    if (label.includes('básico') || label.includes('basico')) return 'basico';
    if (label.includes('gratis') || label.includes('free')) return 'free';
    if (label.includes('pro')) return 'pro';

    return 'basico';
}

export function planMeta(plan: SoftwarePricingPlan) {
    return PLAN_META[planCodigoFromSku(plan)];
}

export function sortPlans<T extends { codigo?: string; plan?: SoftwarePricingPlan }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
        const ac = (a.codigo ?? (a.plan ? planCodigoFromSku(a.plan) : '')) as TallerPlanCodigo;
        const bc = (b.codigo ?? (b.plan ? planCodigoFromSku(b.plan) : '')) as TallerPlanCodigo;
        return PLAN_ORDER.indexOf(ac) - PLAN_ORDER.indexOf(bc);
    });
}
