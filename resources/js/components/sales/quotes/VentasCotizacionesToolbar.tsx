import { Link } from '@inertiajs/react';
import {
    Ban,
    CheckCircle2,
    Clock,
    FileText,
    LayoutGrid,
    Plus,
} from 'lucide-react';

import type { QuoteRow } from '@/components/sales/quotes/quoteTypes';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import panel from '@/routes/panel';

type Props = {
    totalQuotes: number;
    rows: QuoteRow[];
};

export default function VentasCotizacionesToolbar({
    totalQuotes,
    rows,
}: Props) {
    const totalInScreen = rows.length;
    const totalClosed = rows.filter(
        (r) => r.status === 'converted' || r.status === 'accepted',
    ).length;
    const totalOpen = rows.filter(
        (r) =>
            r.status === 'draft' ||
            r.status === 'sent' ||
            r.status === 'viewed',
    ).length;
    const totalNegative = rows.filter(
        (r) => r.status === 'rejected' || r.status === 'expired',
    ).length;

    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <FileText className="size-4 text-[#D28C3C]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Cotizaciones</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Presupuestos previos al pedido (cabecera y totales;
                            el detalle y líneas en cada cotización).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={panel.ventasCotizaciones.create.url()}
                        prefetch
                        className="inline-flex"
                    >
                        <NeuButtonRaised type="button" className="cursor-pointer">
                            <Plus className="size-4 text-[#4A9A72]" />
                            Nueva cotización
                        </NeuButtonRaised>
                    </Link>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <FileText className="size-3.5" />
                    Cotizaciones {totalQuotes}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    <CheckCircle2 className="size-3.5" />
                    Cerradas {totalClosed}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/12 px-2.5 py-1 text-xs text-[#D28C3C]">
                    <Clock className="size-3.5" />
                    Abiertas {totalOpen}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C05050]/12 px-2.5 py-1 text-xs text-[#C05050]">
                    <Ban className="size-3.5" />
                    Rechaz./venc. {totalNegative}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <LayoutGrid className="size-3.5" />
                    En pantalla {totalInScreen}
                </span>
            </div>
        </NeuCardRaised>
    );
}
