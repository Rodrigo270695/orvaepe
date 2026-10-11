import { useMemo } from 'react';

import { PLAN_ORDER } from '../data';
import type { VetSaaSMarketingPayload } from '../types';

type Props = {
    plans: VetSaaSMarketingPayload['plans'];
    comparison: VetSaaSMarketingPayload['comparison'];
};

export default function ComparisonSection({ plans, comparison }: Props) {
    const columns = useMemo(
        () => PLAN_ORDER.filter((codigo) => plans.some((plan) => plan.codigo === codigo)),
        [plans],
    );

    return (
        <section id="comparar" className="scroll-mt-24 border-t border-[#06241C]/10 bg-[#F4F7F5] py-16 text-[#06241C] sm:py-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Límites por plan</h2>
                <p className="font-body vs-muted mt-3 max-w-2xl text-sm">
                    Sedes, usuarios, pacientes, propietarios, productos y comprobantes SUNAT. IA y WhatsApp están
                    en todos los planes.
                </p>

                <div className="mt-10 overflow-x-auto border-y border-[#06241C]/15">
                    <table className="font-body w-full min-w-[720px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#06241C]/15">
                                <th className="px-4 py-4 font-medium text-[#3E5C52]">Cantidad</th>
                                {columns.map((codigo) => {
                                    const meta = plans.find((plan) => plan.codigo === codigo);
                                    return (
                                        <th key={codigo} className="font-display px-4 py-4 text-base font-semibold text-[#06241C]">
                                            {meta?.nombre ?? codigo}
                                            {meta?.badge ? (
                                                <span className="font-body ml-2 rounded-full bg-[#008762] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                                                    {meta.badge}
                                                </span>
                                            ) : null}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {comparison.map((row) => (
                                <tr key={row.key} className="border-b border-[#06241C]/10 last:border-0">
                                    <td className="px-4 py-3.5 text-[#3E5C52]">{row.label}</td>
                                    {columns.map((codigo) => (
                                        <td key={codigo} className="px-4 py-3.5 tabular-nums text-[#06241C]">
                                            {row[codigo] ?? '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
