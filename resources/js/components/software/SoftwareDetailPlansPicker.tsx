'use client';

import { useEffect, useMemo, useState } from 'react';

import SoftwareDetailPlanCard from '@/components/software/SoftwareDetailPlanCard';
import { cn } from '@/lib/utils';
import {
    planHasPurchasablePrice,
    planIsFreeSubscription,
} from '@/lib/cartPricing';
import {
    findTierForPlanId,
    partitionSoftwarePricingPlans,
    pickDefaultBillingPeriod,
    resolvePlanForTier,
    tierHasBillingPeriod,
    type BillingPeriod,
    type SoftwarePlanTier,
} from '@/lib/softwarePricingPlans';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

function getPlanPriceBefore(p: SoftwarePricingPlan): string | undefined {
    return p.priceBeforeText ?? (p.priceBefore !== undefined ? String(p.priceBefore) : undefined);
}

function getPlanPriceNow(p: SoftwarePricingPlan): string | undefined {
    return p.priceNowText ?? (p.priceNow !== undefined ? String(p.priceNow) : undefined);
}

function inferSaleModelLabel(p: SoftwarePricingPlan): string {
    if (p.saleModelLabel?.trim()) {
        return p.saleModelLabel;
    }

    return p.saleModel ?? 'Plan';
}

type Props = {
    plans: SoftwarePricingPlan[];
    selectedPlanId: string | null;
    onSelectPlanId: (id: string) => void;
    semanticAccents: readonly string[];
};

export default function SoftwareDetailPlansPicker({
    plans,
    selectedPlanId,
    onSelectPlanId,
    semanticAccents,
}: Props) {
    const { recurringTiers, standalonePlans } = useMemo(
        () => partitionSoftwarePricingPlans(plans),
        [plans],
    );

    const showBillingToggle = useMemo(() => {
        const hasMonthly = recurringTiers.some((t) => tierHasBillingPeriod(t, 'monthly'));
        const hasAnnual = recurringTiers.some((t) => tierHasBillingPeriod(t, 'annual'));

        return hasMonthly && hasAnnual;
    }, [recurringTiers]);

    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(() =>
        pickDefaultBillingPeriod(recurringTiers),
    );

    useEffect(() => {
        setBillingPeriod(pickDefaultBillingPeriod(recurringTiers));
    }, [plans, recurringTiers]);

    useEffect(() => {
        if (!selectedPlanId || recurringTiers.length === 0) {
            return;
        }

        const tier = findTierForPlanId(recurringTiers, selectedPlanId);
        if (!tier) {
            return;
        }

        if (tierHasBillingPeriod(tier, billingPeriod)) {
            return;
        }

        const alternate: BillingPeriod = billingPeriod === 'monthly' ? 'annual' : 'monthly';
        const replacement = resolvePlanForTier(tier, alternate);
        if (replacement) {
            onSelectPlanId(replacement.id);
        }
    }, [billingPeriod, selectedPlanId, recurringTiers, onSelectPlanId]);

    const activeTierKey = useMemo(() => {
        if (!selectedPlanId) {
            return null;
        }

        return findTierForPlanId(recurringTiers, selectedPlanId)?.key ?? null;
    }, [selectedPlanId, recurringTiers]);

    const renderTierCard = (tier: SoftwarePlanTier, index: number) => {
        const plan = resolvePlanForTier(tier, billingPeriod);
        if (!plan) {
            return null;
        }

        const isActive =
            selectedPlanId === plan.id ||
            (activeTierKey !== null && activeTierKey === tier.key);
        const accent = semanticAccents[index % semanticAccents.length];
        const isFree = planIsFreeSubscription(plan);

        return (
            <SoftwareDetailPlanCard
                key={tier.key}
                plan={{
                    ...plan,
                    label: tier.title,
                    highlights: isFree
                        ? [
                              'Suscripción gratuita',
                              'Sin pasarela de pago',
                              'Activación inmediata tras confirmar',
                          ]
                        : plan.highlights,
                }}
                isActive={isActive}
                accent={accent}
                saleModelLabel={inferSaleModelLabel(plan)}
                planPriceBefore={getPlanPriceBefore(plan)}
                planPriceNow={
                    isFree ? 'Gratis' : (getPlanPriceNow(plan) ?? plan.priceText)
                }
                showPriceAmount={isFree || planHasPurchasablePrice(plan)}
                onChoose={() => onSelectPlanId(plan.id)}
            />
        );
    };

    return (
        <div className="space-y-8">
            {recurringTiers.length > 0 ? (
                <div className="space-y-5">
                    {showBillingToggle ? (
                        <div
                            className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
                            role="group"
                            aria-label="Periodo de facturación"
                        >
                            <p className="text-sm text-[var(--muted-foreground)]">
                                Elige el ciclo de pago. Los precios cambian según mensual o anual.
                            </p>
                            <div className="inline-flex self-start rounded-xl border border-[var(--border)] bg-background/60 p-1">
                                {(
                                    [
                                        ['monthly', 'Mensual'],
                                        ['annual', 'Anual'],
                                    ] as const
                                ).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={cn(
                                            'cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                                            billingPeriod === value
                                                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                                                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                                        )}
                                        onClick={() => setBillingPeriod(value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div
                        className={cn(
                            'grid gap-5',
                            recurringTiers.length === 1
                                ? 'max-w-lg md:grid-cols-1'
                                : recurringTiers.length === 2
                                  ? 'md:grid-cols-2'
                                  : 'md:grid-cols-2 lg:grid-cols-3',
                        )}
                    >
                        {recurringTiers.map((tier, i) => renderTierCard(tier, i))}
                    </div>
                </div>
            ) : null}

            {standalonePlans.length > 0 ? (
                <div className="space-y-4">
                    {recurringTiers.length > 0 ? (
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                            Otros modelos de licencia
                        </p>
                    ) : null}
                    <div
                        className={cn(
                            'grid gap-5',
                            standalonePlans.length >= 3
                                ? 'md:grid-cols-2 lg:grid-cols-3'
                                : 'md:grid-cols-2',
                        )}
                    >
                        {standalonePlans.map((p, i) => {
                            const isActive = selectedPlanId === p.id;
                            const accent =
                                semanticAccents[(recurringTiers.length + i) % semanticAccents.length];
                            const isFree = planIsFreeSubscription(p);

                            return (
                                <SoftwareDetailPlanCard
                                    key={p.id}
                                    plan={p}
                                    isActive={isActive}
                                    accent={accent}
                                    saleModelLabel={inferSaleModelLabel(p)}
                                    planPriceBefore={getPlanPriceBefore(p)}
                                    planPriceNow={
                                        isFree
                                            ? 'Gratis'
                                            : getPlanPriceNow(p)
                                    }
                                    showPriceAmount={
                                        isFree || planHasPurchasablePrice(p)
                                    }
                                    onChoose={() => onSelectPlanId(p.id)}
                                />
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
