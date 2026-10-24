import { motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';

import VetSaaSReveal from '@/components/software/VetSaaSReveal';

import { PLAN_ORDER } from '../data';
import type { VetSaaSMarketingPayload } from '../types';
import { visiblePlanBadge } from '../utils';

type Props = {
    plans: VetSaaSMarketingPayload['plans'];
    comparison: VetSaaSMarketingPayload['comparison'];
};

const FEATURED_CODIGO = 'pro';

function CellValue({ value }: { value: string | undefined }) {
    if (!value || value === '—' || value === '0') {
        return <span className="vs-empty-cell">{value || '—'}</span>;
    }
    if (/ilimitad/i.test(value)) {
        return <span className="font-semibold vs-text-accent-strong">{value}</span>;
    }
    return <span className="font-medium vs-text-ink">{value}</span>;
}

export default function ComparisonSection({ plans, comparison }: Props) {
    const reduce = useReducedMotion();
    const columns = useMemo(
        () => PLAN_ORDER.filter((codigo) => plans.some((plan) => plan.codigo === codigo)),
        [plans],
    );

    const columnClass = (codigo: string) => (codigo === FEATURED_CODIGO ? 'vs-comparison-col-featured' : '');

    return (
        <section id="comparar" className="vs-bg-soft scroll-mt-24 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <VetSaaSReveal>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="font-display text-3xl font-semibold tracking-tight vs-text-ink sm:text-5xl">Límites por plan</h2>
                            <p className="mt-3 max-w-xl text-base vs-text-muted">
                                Lo único que cambia entre planes son las cantidades. IA y WhatsApp están en todos.
                            </p>
                        </div>
                        <a href="#planes" className="vs-btn-secondary inline-flex w-fit px-5 py-3">
                            Volver a precios
                        </a>
                    </div>
                </VetSaaSReveal>

                <VetSaaSReveal delay={0.1}>
                    <div className="vs-comparison-wrap mt-10">
                        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b vs-border">
                                    <th
                                        className="sticky left-0 z-10 px-5 py-5 font-medium"
                                        style={{ background: 'var(--vs-table-head)', color: 'var(--vs-table-muted)' }}
                                    >
                                        Cantidad
                                    </th>
                                    {columns.map((codigo) => {
                                        const meta = plans.find((plan) => plan.codigo === codigo);
                                        const badge = visiblePlanBadge(meta?.badge);
                                        return (
                                            <th key={codigo} className={`px-5 py-5 align-bottom ${columnClass(codigo)}`}>
                                                {badge ? (
                                                    <span className="mb-2 inline-block rounded-full border border-[#008762] bg-[#008762] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                                        {badge}
                                                    </span>
                                                ) : null}
                                                <span className="font-display block text-base font-semibold vs-text-ink">
                                                    {meta?.nombre ?? codigo}
                                                </span>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {comparison.map((row, index) => (
                                    <motion.tr
                                        key={row.key}
                                        initial={reduce ? false : { opacity: 0, x: -16 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, amount: 0.6 }}
                                        transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                        className="group border-b border-[var(--vs-border-soft)] last:border-0"
                                    >
                                        <td
                                            className="sticky left-0 z-10 px-5 py-4 transition-colors group-hover:bg-[var(--vs-soft-bg)]"
                                            style={{ background: 'var(--vs-table-head)', color: 'var(--vs-table-muted)' }}
                                        >
                                            {row.label}
                                        </td>
                                        {columns.map((codigo) => (
                                            <td
                                                key={codigo}
                                                className={`px-5 py-4 tabular-nums transition-colors group-hover:bg-[var(--vs-soft-bg)] ${columnClass(codigo)}`}
                                            >
                                                <CellValue value={row[codigo]} />
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </VetSaaSReveal>
            </div>
        </section>
    );
}
