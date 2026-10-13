import { usePlanTiers } from '@/components/software/vetsaas/pricing/usePlanTiers';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import { COMPARISON } from '../data';
import TallerSaaSReveal from '../TallerSaaSReveal';
import type { TallerSaaSPurchaseProps } from '../types';
import { planCodigoFromSku } from '../utils';
import BillingToggle from './BillingToggle';
import CheckoutBay from './CheckoutBay';
import PlanCard from './PlanCard';

type Props = TallerSaaSPurchaseProps & {
    plans: SoftwarePricingPlan[];
};

export default function PricingSection({ plans, ...checkout }: Props) {
    const { period, setPeriod, canToggle, visiblePlans, activeKey } = usePlanTiers(
        plans,
        checkout.selectedPlanId,
        checkout.onSelectPlanId,
    );

    const choose = (id: string) => {
        checkout.onSelectPlanId(id);
        window.requestAnimationFrame(() => {
            document.getElementById('ts-checkout')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    };

    return (
        <section id="planes" className="relative scroll-mt-24 overflow-hidden bg-[#0b1220] py-20 text-white sm:py-28">
            <div className="ts-bay-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
                <TallerSaaSReveal>
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#f97316]">
                            Precios en soles · IGV incluido
                        </p>
                        <h2 className="font-display mt-5 text-4xl font-extrabold leading-[0.95] sm:text-6xl">
                            Mismos módulos.
                            <span className="block text-[#ea580c]">Distinto volumen.</span>
                        </h2>
                    </div>
                </TallerSaaSReveal>

                {canToggle ? (
                    <TallerSaaSReveal delay={0.08}>
                        <div className="mt-10 flex flex-col items-center gap-3">
                            <BillingToggle value={period} onChange={setPeriod} />
                            <p className="text-xs text-[#b7b0a4]">
                                {period === 'annual' ? 'Pagas 10 meses y usas 12.' : 'Cambia a anual y ahorras 2 meses.'}
                            </p>
                        </div>
                    </TallerSaaSReveal>
                ) : null}

                <div className="mt-14 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visiblePlans.map(({ key, title, plan }, index) => (
                        <PlanCard
                            key={key}
                            title={title}
                            plan={plan}
                            index={index}
                            active={activeKey === key}
                            featured={planCodigoFromSku(plan) === 'pro'}
                            onChoose={() => choose(plan.id)}
                        />
                    ))}
                </div>

                <TallerSaaSReveal>
                    <div className="mt-16 overflow-x-auto border border-white/10">
                        <table className="w-full min-w-[40rem] text-left text-sm">
                            <thead className="bg-[#121a2b] font-display text-xs uppercase tracking-wide text-[#f97316]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Límite</th>
                                    <th className="px-4 py-3 font-semibold">Gratis</th>
                                    <th className="px-4 py-3 font-semibold">Básico</th>
                                    <th className="px-4 py-3 font-semibold">Pro</th>
                                    <th className="px-4 py-3 font-semibold">Experto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON.map((row) => (
                                    <tr key={row.label} className="border-t border-white/10">
                                        <td className="px-4 py-3 text-[#cfc6b8]">{row.label}</td>
                                        <td className="px-4 py-3">{row.free}</td>
                                        <td className="px-4 py-3">{row.basico}</td>
                                        <td className="px-4 py-3">{row.pro}</td>
                                        <td className="px-4 py-3">{row.experto}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TallerSaaSReveal>

                <CheckoutBay {...checkout} />
            </div>
        </section>
    );
}
