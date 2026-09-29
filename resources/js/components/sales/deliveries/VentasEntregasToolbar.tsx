import { Link } from '@inertiajs/react';
import { CheckCircle2, FileText, LayoutGrid, Plus, Receipt } from 'lucide-react';

import type { DeliveryRow } from '@/components/sales/deliveries/deliveryTypes';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    totalDeliveries: number;
    rows: DeliveryRow[];
};

export default function VentasEntregasToolbar({
    totalDeliveries,
    rows,
}: Props) {
    const withIgv = rows.filter((row) => row.includes_igv).length;
    const withoutIgv = rows.filter((row) => !row.includes_igv).length;
    const withDocs = rows.filter((row) => row.has_invoice || row.has_xml).length;

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
                            A quién se ofreció el servicio: RUC, razón social,
                            producto, plan (mensual, anual, 2 o 3 años), IGV,
                            fecha de entrega y documentos (factura y XML).
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
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <FileText className="size-3.5" />
                    Entregas {totalDeliveries}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    <CheckCircle2 className="size-3.5" />
                    Con IGV {withIgv}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/12 px-2.5 py-1 text-xs text-[#D28C3C]">
                    <Receipt className="size-3.5" />
                    Sin IGV {withoutIgv}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <LayoutGrid className="size-3.5" />
                    Con documentos {withDocs}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <LayoutGrid className="size-3.5" />
                    En pantalla {rows.length}
                </span>
            </div>
        </NeuCardRaised>
    );
}
