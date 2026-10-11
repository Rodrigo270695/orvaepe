import { useEffect, useMemo, useState } from 'react';

import {
    findTierForPlanId,
    partitionSoftwarePricingPlans,
    pickDefaultBillingPeriod,
    resolvePlanForTier,
    tierHasBillingPeriod,
    type BillingPeriod,
} from '@/lib/softwarePricingPlans';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

export type VisiblePlan = {
    key: string;
    title: string;
    plan: SoftwarePricingPlan;
};

/**
 * Agrupa los SKU mensual/anual de cada plan y mantiene la selección
 * coherente cuando el usuario cambia de ciclo.
 */
export function usePlanTiers(
    plans: SoftwarePricingPlan[],
    selectedPlanId: string | null,
    onSelectPlanId: (id: string) => void,
) {
    const { recurringTiers, standalonePlans } = useMemo(() => partitionSoftwarePricingPlans(plans), [plans]);

    const [period, setPeriod] = useState<BillingPeriod>(() => pickDefaultBillingPeriod(recurringTiers));

    useEffect(() => {
        setPeriod(pickDefaultBillingPeriod(recurringTiers));
    }, [recurringTiers]);

    useEffect(() => {
        if (!selectedPlanId) return;
        const tier = findTierForPlanId(recurringTiers, selectedPlanId);
        if (!tier || tierHasBillingPeriod(tier, period)) return;
        const replacement = resolvePlanForTier(tier, period === 'monthly' ? 'annual' : 'monthly');
        if (replacement) onSelectPlanId(replacement.id);
    }, [period, selectedPlanId, recurringTiers, onSelectPlanId]);

    const canToggle = useMemo(
        () =>
            recurringTiers.some((t) => tierHasBillingPeriod(t, 'monthly')) &&
            recurringTiers.some((t) => tierHasBillingPeriod(t, 'annual')),
        [recurringTiers],
    );

    const visiblePlans = useMemo((): VisiblePlan[] => {
        const tiers = recurringTiers.flatMap((tier) => {
            const plan = resolvePlanForTier(tier, period);
            return plan ? [{ key: tier.key, title: tier.title, plan }] : [];
        });
        const standalone = standalonePlans.map((plan) => ({ key: plan.id, title: plan.label, plan }));
        return [...tiers, ...standalone];
    }, [recurringTiers, standalonePlans, period]);

    const activeKey = useMemo(() => {
        if (!selectedPlanId) return null;
        return (
            findTierForPlanId(recurringTiers, selectedPlanId)?.key ??
            standalonePlans.find((p) => p.id === selectedPlanId)?.id ??
            null
        );
    }, [selectedPlanId, recurringTiers, standalonePlans]);

    return { period, setPeriod, canToggle, visiblePlans, activeKey };
}
