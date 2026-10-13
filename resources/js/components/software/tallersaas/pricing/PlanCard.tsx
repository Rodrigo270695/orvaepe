import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import TallerSaaSReveal from '../TallerSaaSReveal';
import { planMeta } from '../utils';
import PriceTag from './PriceTag';

type Props = {
    title: string;
    plan: SoftwarePricingPlan;
    index: number;
    active: boolean;
    featured: boolean;
    onChoose: () => void;
};

export default function PlanCard({ title, plan, index, active, featured, onChoose }: Props) {
    const meta = planMeta(plan);

    return (
        <TallerSaaSReveal delay={index * 0.08} className="h-full">
            <article
                className={[
                    'flex h-full flex-col border p-6',
                    featured ? 'border-[#ea580c] bg-[#161e2e] lg:-translate-y-3' : 'border-white/10 bg-[#121a2b]',
                    active ? 'ring-2 ring-[#ea580c] ring-offset-2 ring-offset-[#0b1220]' : '',
                ].join(' ')}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-display text-2xl font-extrabold text-white">{meta.nombre ?? title}</h3>
                        <p className="mt-1 text-sm text-[#b7b0a4]">{meta.descripcion}</p>
                    </div>
                    {meta.badge ? (
                        <span className="shrink-0 bg-[#ea580c] px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wide text-white">
                            {meta.badge}
                        </span>
                    ) : null}
                </div>

                <div className="mt-8">
                    <PriceTag plan={plan} featured={featured} />
                </div>

                <p className="mt-4 text-xs text-[#f97316]">{meta.trial_days} días de prueba</p>

                <button
                    type="button"
                    onClick={onChoose}
                    aria-pressed={active}
                    className={[
                        'mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition',
                        active || featured
                            ? 'bg-[#ea580c] text-white hover:bg-[#c2410c]'
                            : 'border border-white/20 text-white hover:border-[#ea580c]',
                    ].join(' ')}
                >
                    {active ? 'Seleccionado' : 'Elegir plan'}
                </button>

                <ul className="mt-6 space-y-2 text-sm text-[#cfc6b8]">
                    {meta.highlights.map((item) => (
                        <li key={item} className="flex gap-2">
                            <span aria-hidden className="text-[#ea580c]">
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
