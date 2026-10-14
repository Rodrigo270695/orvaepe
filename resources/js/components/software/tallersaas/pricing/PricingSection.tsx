import { usePlanTiers } from '@/components/software/vetsaas/pricing/usePlanTiers';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import TallerSaaSReveal from '../TallerSaaSReveal';
import type { TallerSaaSMarketing, TallerSaaSPurchaseProps } from '../types';
import { comparisonTable, planCodigoFromSku } from '../utils';
import BillingToggle from './BillingToggle';
import CheckoutBay from './CheckoutBay';
import PlanCard from './PlanCard';

type Props = TallerSaaSPurchaseProps & {
    plans: SoftwarePricingPlan[];
    marketing: TallerSaaSMarketing | null;
};

export default function PricingSection({ plans, marketing, ...checkout }: Props) {
    const table = comparisonTable(marketing);
    const remoteByCodigo = new Map((marketing?.plans ?? []).map((plan) => [plan.codigo, plan]));

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
        <section
            id="planes"
            className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28"
            style={{ background: 'var(--ts-bg)', color: 'var(--ts-ink)' }}
        >
            <div className="ts-bay-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
                <TallerSaaSReveal>
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--ts-ember)' }}>
                            Precios en soles · IGV incluido
                        </p>
                        <h2 className="font-display mt-5 text-4xl font-extrabold leading-[0.95] sm:text-6xl">
                            Mismos módulos.
                            <span className="block" style={{ color: 'var(--ts-ember)' }}>
                                Distinto volumen.
                            </span>
                        </h2>
                    </div>
                </TallerSaaSReveal>

                {canToggle ? (
                    <TallerSaaSReveal delay={0.08}>
                        <div className="mt-10 flex flex-col items-center gap-3">
                            <BillingToggle value={period} onChange={setPeriod} />
                            <p className="text-xs" style={{ color: 'var(--ts-muted)' }}>
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
                            remote={remoteByCodigo.get(planCodigoFromSku(plan)) ?? null}
                            index={index}
                            active={activeKey === key}
                            featured={planCodigoFromSku(plan) === 'pro'}
                            onChoose={() => choose(plan.id)}
                        />
                    ))}
                </div>

                <TallerSaaSReveal>
                    <div className="mt-16 overflow-x-auto border" style={{ borderColor: 'var(--ts-line)' }}>
                        <table className="w-full min-w-[40rem] text-left text-sm">
                            <thead
                                className="font-display text-xs uppercase tracking-wide"
                                style={{ background: 'var(--ts-table-head)', color: 'var(--ts-ember)' }}
                            >
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Límite</th>
                                    {table.columns.map((column) => (
                                        <th key={column.codigo} className="px-4 py-3 font-semibold">
                                            {column.nombre}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {table.rows.map((row) => (
                                    <tr key={row.key} className="border-t" style={{ borderColor: 'var(--ts-line)' }}>
                                        <td className="px-4 py-3" style={{ color: 'var(--ts-muted)' }}>
                                            {row.label}
                                        </td>
                                        {table.columns.map((column) => (
                                            <td key={column.codigo} className="px-4 py-3 tabular-nums">
                                                {row.values[column.codigo] ?? '—'}
                                            </td>
                                        ))}
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
