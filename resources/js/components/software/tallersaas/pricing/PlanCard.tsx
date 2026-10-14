import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import TallerSaaSReveal from '../TallerSaaSReveal';
import type { TallerSaaSMarketingPlan } from '../types';
import { planMeta } from '../utils';
import PriceTag from './PriceTag';

type Props = {
    title: string;
    plan: SoftwarePricingPlan;
    remote: TallerSaaSMarketingPlan | null;
    index: number;
    active: boolean;
    featured: boolean;
    onChoose: () => void;
};

export default function PlanCard({ title, plan, remote, index, active, featured, onChoose }: Props) {
    const meta = planMeta(plan);
    const highlights = remote?.highlights.length ? remote.highlights : meta.highlights;
    const trialDays = remote ? remote.trial_days : meta.trial_days;

    return (
        <TallerSaaSReveal delay={index * 0.08} className="h-full">
            <article
                className={['flex h-full flex-col border p-6', featured ? 'lg:-translate-y-3' : ''].join(' ')}
                style={{
                    borderColor: featured || active ? 'var(--ts-ember)' : 'var(--ts-line)',
                    background: 'var(--ts-surface)',
                    boxShadow: active ? '0 0 0 2px var(--ts-ember)' : undefined,
                }}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-display text-2xl font-extrabold" style={{ color: 'var(--ts-ink-strong)' }}>
                            {meta.nombre ?? title}
                        </h3>
                        <p className="mt-1 text-sm" style={{ color: 'var(--ts-muted)' }}>
                            {meta.descripcion}
                        </p>
                    </div>
                    {meta.badge ? (
                        <span
                            className="shrink-0 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wide"
                            style={{ background: 'var(--ts-ember)', color: 'var(--ts-on-ember)' }}
                        >
                            {meta.badge}
                        </span>
                    ) : null}
                </div>

                <div className="mt-8">
                    <PriceTag plan={plan} featured={featured} />
                </div>

                {trialDays > 0 ? (
                    <p className="mt-4 text-xs" style={{ color: 'var(--ts-ember)' }}>
                        {trialDays} días de prueba
                    </p>
                ) : null}

                <button
                    type="button"
                    onClick={onChoose}
                    aria-pressed={active}
                    className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition"
                    style={
                        active || featured
                            ? { background: 'var(--ts-ember)', color: 'var(--ts-on-ember)' }
                            : {
                                  border: '1px solid var(--ts-ghost-border)',
                                  color: 'var(--ts-ink)',
                                  background: 'transparent',
                              }
                    }
                >
                    {active ? 'Seleccionado' : 'Elegir plan'}
                </button>

                <ul className="mt-6 space-y-2 text-sm" style={{ color: 'var(--ts-muted)' }}>
                    {highlights.map((item) => (
                        <li key={item} className="flex gap-2">
                            <span aria-hidden style={{ color: 'var(--ts-ember)' }}>
                                /
                            </span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </article>
        </TallerSaaSReveal>
    );
}
