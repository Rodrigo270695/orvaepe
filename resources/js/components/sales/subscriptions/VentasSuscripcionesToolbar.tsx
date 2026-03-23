import { Link } from '@inertiajs/react';
import {
    Ban,
    CheckCircle2,
    Clock,
    LayoutGrid,
    Pause,
    Plus,
    RefreshCcw,
    Sparkles,
} from 'lucide-react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import type { SubscriptionRow } from '@/components/sales/subscriptions/subscriptionTypes';
import panel from '@/routes/panel';

type Props = {
    totalSubscriptions: number;
    rows: SubscriptionRow[];
};

export default function VentasSuscripcionesToolbar({
    totalSubscriptions,
    rows,
}: Props) {
    const totalInScreen = rows.length;
    const totalActive = rows.filter((r) => r.status === 'active').length;
    const totalTrialing = rows.filter((r) => r.status === 'trialing').length;
    const totalPastDue = rows.filter((r) => r.status === 'past_due').length;
    const totalPaused = rows.filter((r) => r.status === 'paused').length;
    const totalCancelled = rows.filter((r) => r.status === 'cancelled').length;

    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <RefreshCcw className="size-4 text-[#D28C3C]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Suscripciones</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Suscripciones recurrentes por cliente y SKU
                            (gateway cuando esté integrado). Los ítems viven en
                            la tabla <span className="font-mono">subscription_items</span>.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={panel.ventasSuscripciones.create.url()}
                        prefetch
                        className="inline-flex"
                    >
                        <NeuButtonRaised type="button" className="cursor-pointer">
                            <Plus className="size-4 text-[#4A9A72]" />
                            Nueva suscripción
                        </NeuButtonRaised>
                    </Link>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <RefreshCcw className="size-3.5" />
                    Total {totalSubscriptions}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    <CheckCircle2 className="size-3.5" />
                    Activas {totalActive}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <Sparkles className="size-3.5" />
                    Prueba {totalTrialing}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/12 px-2.5 py-1 text-xs text-[#D28C3C]">
                    <Clock className="size-3.5" />
                    Vencidas {totalPastDue}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <Pause className="size-3.5" />
                    Pausadas {totalPaused}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C05050]/12 px-2.5 py-1 text-xs text-[#C05050]">
                    <Ban className="size-3.5" />
                    Canceladas {totalCancelled}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <LayoutGrid className="size-3.5" />
                    En pantalla {totalInScreen}
                </span>
            </div>
        </NeuCardRaised>
    );
}
