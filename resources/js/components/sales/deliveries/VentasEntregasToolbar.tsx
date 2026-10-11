import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

import type { DeliverySummary } from '@/components/sales/deliveries/deliveryTypes';
import { formatOrderMoney } from '@/components/sales/orders/orderDisplay';

type Props = {
    summary: DeliverySummary;
    children?: ReactNode;
};

function Figure({
    label,
    value,
    hint,
    tone = 'ink',
}: {
    label: string;
    value: string;
    hint: string;
    tone?: 'ink' | 'due';
}) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6A7A88]">
                {label}
            </p>
            <p
                className={[
                    'mt-1 text-[1.65rem] font-semibold leading-none tracking-tight tabular-nums',
                    tone === 'due' ? 'text-[#9A5B16]' : 'text-[#1C2430]',
                ].join(' ')}
            >
                {value}
            </p>
            <p className="mt-2 text-xs text-[#6A7A88]">{hint}</p>
        </div>
    );
}

export default function VentasEntregasToolbar({ summary, children }: Props) {
    const pending = Number.parseFloat(summary.pending_amount);
    const dueTone = Number.isFinite(pending) && pending > 0 ? 'due' : 'ink';

    return (
        <section className="overflow-hidden rounded-lg border border-[rgba(41,50,60,0.12)] bg-[#F4F8FB]">
            <div className="flex flex-col gap-4 px-5 pt-5 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-[#1C2430]">
                        Entregas
                    </h1>
                    <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[#5C6B78]">
                        A quién se ofreció el servicio, y cuánto de ese filtro
                        sigue por cobrar.
                    </p>
                </div>
                <Link
                    href="/panel/ventas-entregas/create"
                    prefetch
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-[#C07828] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#A8661F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C07828]/40"
                >
                    <Plus className="size-3.5" strokeWidth={2} />
                    Nueva entrega
                </Link>
            </div>

            <div className="mt-5 grid gap-6 border-t border-[rgba(41,50,60,0.08)] px-5 py-5 sm:grid-cols-3">
                <Figure
                    label="Total"
                    value={formatOrderMoney(summary.total_amount, 'PEN')}
                    hint={`${summary.count} ${summary.count === 1 ? 'entrega' : 'entregas'}`}
                />
                <Figure
                    label="Por cobrar"
                    value={formatOrderMoney(summary.pending_amount, 'PEN')}
                    hint="Pendiente en este filtro"
                    tone={dueTone}
                />
                <Figure
                    label="Cobrado"
                    value={formatOrderMoney(summary.collected_amount, 'PEN')}
                    hint={`${summary.with_igv} con IGV · ${summary.with_docs} con documentos`}
                />
            </div>

            {children ? (
                <div className="border-t border-[rgba(41,50,60,0.08)] px-5 py-4">
                    {children}
                </div>
            ) : null}
        </section>
    );
}
