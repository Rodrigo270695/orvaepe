import {
    Ban,
    Box,
    CheckCircle2,
    Clock3,
    LayoutGrid,
    Tags,
} from 'lucide-react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    totalDeliveries: number;
    rowsCount: number;
    pendingOnPage: number;
    deliveredOnPage: number;
    revokedOnPage: number;
};

export default function AccesoOemEntregasToolbar({
    totalDeliveries,
    rowsCount,
    pendingOnPage,
    deliveredOnPage,
    revokedOnPage,
}: Props) {
    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <Box className="size-4 text-[#D28C3C]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">
                            Entregas OEM
                        </h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Licencias de proveedor (Microsoft, Adobe, etc.)
                            vinculadas a líneas de pedido. Claves sensibles:
                            tratar como confidenciales.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <Tags className="size-3.5" />
                    Entregas {totalDeliveries}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#B8860B]/12 px-2.5 py-1 text-xs text-[#D4A84B]">
                    <Clock3 className="size-3.5" />
                    Pendientes {pendingOnPage}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    <CheckCircle2 className="size-3.5" />
                    Entregadas {deliveredOnPage}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C05050]/12 px-2.5 py-1 text-xs text-[#C05050]">
                    <Ban className="size-3.5" />
                    Revocadas {revokedOnPage}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <LayoutGrid className="size-3.5" />
                    En pantalla {rowsCount}
                </span>
            </div>
        </NeuCardRaised>
    );
}
