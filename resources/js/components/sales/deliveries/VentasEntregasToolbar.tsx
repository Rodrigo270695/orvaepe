import { Link } from '@inertiajs/react';
import { CheckCircle2, FileText, Plus, Receipt, Wallet } from 'lucide-react';

import type { DeliverySummary } from '@/components/sales/deliveries/deliveryTypes';
import { formatOrderMoney } from '@/components/sales/orders/orderDisplay';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    summary: DeliverySummary;
};

export default function VentasEntregasToolbar({ summary }: Props) {
    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <Receipt className="size-4 text-[#D28C3C]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Entregas</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Los montos siguen la búsqueda, las fechas y los
                            filtros de IGV, plan y cobro.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/panel/ventas-entregas/create"
                        prefetch
                        className="inline-flex"
                    >
                        <NeuButtonRaised type="button" className="cursor-pointer">
                            <Plus className="size-4 text-[#4A9A72]" />
                            Nueva entrega
                        </NeuButtonRaised>
                    </Link>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4A80B8]/12 px-3 py-1.5 text-sm font-semibold text-[#4A80B8]">
                    <Wallet className="size-4" />
                    Total {formatOrderMoney(summary.total_amount, 'PEN')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C05050]/12 px-3 py-1.5 text-sm font-semibold text-[#C05050]">
                    <Receipt className="size-4" />
                    Por cobrar {formatOrderMoney(summary.pending_amount, 'PEN')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    <CheckCircle2 className="size-3.5" />
                    Cobrado {formatOrderMoney(summary.collected_amount, 'PEN')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <FileText className="size-3.5" />
                    Entregas {summary.count}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    Con IGV {summary.with_igv}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/12 px-2.5 py-1 text-xs text-[#D28C3C]">
                    Sin IGV {summary.without_igv}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    Con documentos {summary.with_docs}
                </span>
            </div>
        </NeuCardRaised>
    );
}
