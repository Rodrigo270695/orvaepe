'use client';

import { useCallback, useEffect, useState } from 'react';

import { parsePenUnitFromPriceText } from '@/lib/cartPricing';
import {
    readSoftwareCart,
    writeSoftwareCart,
    type SoftwareCartItem,
} from '@/lib/softwareCartStorage';

import type { SoftwareSystem } from '@/marketplace/softwareCatalog';

export function useSoftwareCart() {
    const [items, setItems] = useState<SoftwareCartItem[]>([]);
    const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);

    useEffect(() => {
        setItems(readSoftwareCart());
    }, []);

    const qtyFor = useCallback(
        (systemSlug: string, planId: string) =>
            items.find((i) => i.systemSlug === systemSlug && i.planId === planId)
                ?.qty ?? 0,
        [items],
    );

    const addToCart = useCallback(
        (system: SoftwareSystem, planId?: string) => {
            const chosenPlanId = planId ?? system.pricingPlans[0]?.id ?? null;
            if (!chosenPlanId) return;

            const cartKey = `${system.slug}:${chosenPlanId}`;
            const plan = system.pricingPlans.find((p) => p.id === chosenPlanId);
            const next = [...items];
            const existing = next.find(
                (i) => i.systemSlug === system.slug && i.planId === chosenPlanId,
            );

            const unitPen = parsePenUnitFromPriceText(plan?.priceText);

            const snapshot = {
                systemName: system.name,
                planLabel: plan?.label,
                priceText: plan?.priceText,
                ...(unitPen !== null ? { unitPricePen: unitPen } : {}),
            };

            if (existing) {
                existing.qty += 1;
                Object.assign(existing, snapshot);
            } else {
                next.push({
                    systemSlug: system.slug,
                    planId: chosenPlanId,
                    qty: 1,
                    ...snapshot,
                });
            }

            setItems(next);
            writeSoftwareCart(next);
            setLastAddedKey(cartKey);

            window.setTimeout(() => {
                setLastAddedKey((v) => (v === cartKey ? null : v));
            }, 1200);
        },
        [items],
    );

    return {
        items,
        qtyFor,
        addToCart,
        lastAddedKey,
    };
}
