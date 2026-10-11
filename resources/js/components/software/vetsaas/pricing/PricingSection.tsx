import VetSaaSBillingToggle from '@/components/software/VetSaaSBillingToggle';
import VetSaaSReveal from '@/components/software/VetSaaSReveal';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import type { VetSaaSMarketingPlan, VetSaaSPurchaseProps } from '../types';
import { planCodigoFromSku } from '../utils';
import CheckoutPanel from './CheckoutPanel';
import PlanCard from './PlanCard';
import { usePlanTiers } from './usePlanTiers';

type Props = VetSaaSPurchaseProps & {
    plans: SoftwarePricingPlan[];
    marketingPlans: VetSaaSMarketingPlan[];
    modulesNote: string;
    selectedPlanId: string | null;
    onSelectPlanId: (id: string) => void;
    selectionPriceCaption?: string;
    addedCount: number;
};

const FEATURED_CODIGO = 'pro';

export default function PricingSection({ plans, marketingPlans, modulesNote, selectedPlanId, onSelectPlanId, ...checkout }: Props) {
    const { period, setPeriod, canToggle, visiblePlans, activeKey } = usePlanTiers(plans, selectedPlanId, onSelectPlanId);
    const metaByCodigo = new Map(marketingPlans.map((p) => [p.codigo, p]));

    const choose = (id: string) => {
        onSelectPlanId(id);
        window.requestAnimationFrame(() => {
            document.getElementById('vs-checkout')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    };

    return (
        <section id="planes" className="relative scroll-mt-24 overflow-hidden bg-[#041910] py-20 text-white sm:py-28">
            <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(60,184,138,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(60,184,138,0.14) 1px, transparent 1px)',
                    backgroundSize: '56px 56px',
                    maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
                }}
                aria-hidden
            />
            <div className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-[#3CB88A]/15 blur-[120px]" aria-hidden />

            <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
                <VetSaaSReveal>
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="inline-flex items-center gap-2 rounded-full border border-[#3CB88A]/40 bg-[#3CB88A]/10 px-3.5 py-1.5 font-mono text-xs text-[#99D2BC]">
                            <span className="size-1.5 rounded-full bg-[#3CB88A]" />
                            Precios en soles · IGV incluido
                        </p>
                        <h2 className="font-display mt-5 text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
                            Mismos módulos.
                            <span className="block text-[#3CB88A]">Distintas cantidades.</span>
                        </h2>
                        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#9FCDB9]">{modulesNote}</p>
                    </div>
                </VetSaaSReveal>

                {canToggle ? (
                    <VetSaaSReveal delay={0.1}>
                        <div className="mt-10 flex flex-col items-center gap-3">
                            <VetSaaSBillingToggle value={period} onChange={setPeriod} className="w-full max-w-xs" />
                            <p className="text-xs text-[#7DCAA8]">
                                {period === 'annual' ? 'Pagas 10 meses y usas 12.' : 'Cambia a anual y ahorras 2 meses.'}
                            </p>
                        </div>
                    </VetSaaSReveal>
                ) : null}

                <div className="mt-14 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {visiblePlans.map(({ key, title, plan }, index) => {
                        const codigo = planCodigoFromSku(plan);
                        return (
                            <PlanCard
                                key={key}
                                title={title}
                                plan={plan}
                                meta={metaByCodigo.get(codigo)}
                                index={index}
                                active={activeKey === key}
                                featured={codigo === FEATURED_CODIGO}
                                onChoose={() => choose(plan.id)}
                            />
                        );
                    })}
                </div>

                <CheckoutPanel {...checkout} />
            </div>
        </section>
    );
}
