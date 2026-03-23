import { Link } from '@inertiajs/react';
import {
    Ban,
    CheckCircle2,
    Clock,
    LayoutGrid,
    Plus,
    ShoppingCart,
} from 'lucide-react';

import type { OrderRow } from '@/components/sales/orders/orderTypes';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import panel from '@/routes/panel';

type Props = {
    totalOrders: number;
    rows: OrderRow[];
};

export default function VentasOrdenesToolbar({ totalOrders, rows }: Props) {
    const totalInScreen = rows.length;
    const totalPaid = rows.filter((r) => r.status === 'paid').length;
    const totalPending = rows.filter(
        (r) =>
            r.status === 'pending_payment' || r.status === 'draft',
    ).length;
    const totalCancelled = rows.filter(
        (r) => r.status === 'cancelled' || r.status === 'refunded',
    ).length;

    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <ShoppingCart className="size-4 text-[#D28C3C]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Órdenes de venta</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Pedidos desde checkout y pedidos creados desde este
                            panel (cabecera y totales; el detalle en cada
                            pedido).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={panel.ventasOrdenes.create.url()}
                        prefetch
                        className="inline-flex"
                    >
                        <NeuButtonRaised type="button" className="cursor-pointer">
                            <Plus className="size-4 text-[#4A9A72]" />
                            Nueva orden
                        </NeuButtonRaised>
                    </Link>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <ShoppingCart className="size-3.5" />
                    Pedidos {totalOrders}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    <CheckCircle2 className="size-3.5" />
                    Pagados {totalPaid}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/12 px-2.5 py-1 text-xs text-[#D28C3C]">
                    <Clock className="size-3.5" />
                    Pendientes {totalPending}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C05050]/12 px-2.5 py-1 text-xs text-[#C05050]">
                    <Ban className="size-3.5" />
                    Anulados {totalCancelled}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <LayoutGrid className="size-3.5" />
                    En pantalla {totalInScreen}
                </span>
            </div>
        </NeuCardRaised>
    );
}
