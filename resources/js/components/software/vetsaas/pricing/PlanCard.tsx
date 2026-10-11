import type { PointerEvent } from 'react';

import VetSaaSReveal from '@/components/software/VetSaaSReveal';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import CheckIcon from '../CheckIcon';
import type { VetSaaSMarketingPlan } from '../types';
import { visiblePlanBadge } from '../utils';
import PriceTag from './PriceTag';

type Props = {
    title: string;
    plan: SoftwarePricingPlan;
    meta?: VetSaaSMarketingPlan;
    index: number;
    active: boolean;
    featured: boolean;
    onChoose: () => void;
};

function splitHighlights(highlights: string[]) {
    const features: string[] = [];
    const limits: Array<{ label: string; value: string }> = [];

    for (const raw of highlights) {
        const text = raw.replace(/^[•·\-\s]+/, '').trim();
        const match = text.match(/^([^:]+):\s*(.+)$/);
        if (match) limits.push({ label: match[1].trim(), value: match[2].trim() });
        else if (text) features.push(text);
    }

    return { features, limits };
}

function trackPointer(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--vs-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--vs-y', `${event.clientY - rect.top}px`);
}

export default function PlanCard({ title, plan, meta, index, active, featured, onChoose }: Props) {
    const { features: allFeatures, limits } = splitHighlights(plan.highlights);
    const features = meta?.trial_days ? allFeatures.filter((f) => !/d[ií]as de prueba/i.test(f)) : allFeatures;
    const badge = visiblePlanBadge(meta?.badge);

    return (
        <VetSaaSReveal delay={index * 0.1} className="h-full">
            <div
                className={[
                    'relative h-full rounded-[1.75rem] p-px',
                    featured ? 'vs-glow-border lg:-translate-y-4' : 'bg-white/10',
                ].join(' ')}
            >
                <article
                    onPointerMove={trackPointer}
                    className={[
                        'vs-spotlight group relative flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-1px)] p-6 transition-colors duration-300',
                        featured ? 'bg-[#0A3427]' : 'bg-[#072A20] hover:bg-[#0A3125]',
                        active ? 'ring-2 ring-[#3CB88A] ring-offset-2 ring-offset-[#041910]' : '',
                    ].join(' ')}
                >
                    <div className="flex min-h-[6.5rem] items-start justify-between gap-3">
                        <div>
                            <h3 className="font-display text-xl font-semibold text-white">{meta?.nombre ?? title}</h3>
                            {meta?.descripcion ? (
                                <p className="mt-1 text-sm leading-snug text-[#9FCDB9]">{meta.descripcion}</p>
                            ) : null}
                        </div>
                        {badge ? (
                            <span
                                className={[
                                    'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
                                    featured
                                        ? 'border-[#3CB88A] bg-[#3CB88A] text-[#041910]'
                                        : 'border-[#3CB88A]/50 text-[#99D2BC]',
                                ].join(' ')}
                            >
                                {badge}
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-7 min-h-[5.5rem]">
                        <PriceTag plan={plan} featured={featured} />
                    </div>

                    {meta?.trial_days ? (
                        <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#3CB88A]/40 bg-[#3CB88A]/10 px-3 py-1 text-xs font-medium text-[#99D2BC]">
                            <span className="size-1.5 rounded-full bg-[#3CB88A]" />
                            {meta.trial_days} días de prueba
                        </p>
                    ) : null}

                    <button
                        type="button"
                        onClick={onChoose}
                        aria-pressed={active}
                        className={[
                            'mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3CB88A] active:translate-y-px',
                            active
                                ? 'border-[#3CB88A] bg-[#3CB88A] text-[#041910]'
                                : featured
                                  ? 'border-[#3CB88A] bg-[#006D55] text-white hover:bg-[#008762]'
                                  : 'border-white/20 bg-white/5 text-white hover:border-[#3CB88A] hover:bg-white/10',
                        ].join(' ')}
                    >
                        {active ? (
                            <>
                                <CheckIcon /> Plan elegido
                            </>
                        ) : (
                            'Elegir plan'
                        )}
                    </button>

                    {features.length > 0 ? (
                        <ul className="mt-6 space-y-2.5 text-sm text-[#D5EBE2]">
                            {features.map((feature) => (
                                <li key={feature} className="flex gap-2.5">
                                    <span className="mt-0.5 text-[#3CB88A]">
                                        <CheckIcon className="size-4" />
                                    </span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {limits.length > 0 ? (
                        <dl className="mt-6 divide-y divide-white/[0.08] border-t border-white/[0.08] text-sm">
                            {limits.map((limit) => (
                                <div key={limit.label} className="flex items-center justify-between gap-3 py-2">
                                    <dt className="text-[#9FCDB9]">{limit.label}</dt>
                                    <dd className="font-semibold tabular-nums text-white">{limit.value}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : null}
                </article>
            </div>
        </VetSaaSReveal>
    );
}
