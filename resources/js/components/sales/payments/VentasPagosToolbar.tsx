import { Link } from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    ListOrdered,
    Power,
    PowerOff,
    Wallet,
} from 'lucide-react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import panel from '@/routes/panel';

type Props = {
    paymentGatewayEnabled: boolean;
    pendingPaymentCount: number;
    transactionsTotal: number;
};

export default function VentasPagosToolbar({
    paymentGatewayEnabled,
    pendingPaymentCount,
    transactionsTotal,
}: Props) {
    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <Wallet className="size-4 text-[#D28C3C]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Pagos y pasarela</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Estado de la integración de cobro (PayPal, Culqi,
                            etc.) y enlace a los pedidos. El detalle de cada
                            venta sigue en{' '}
                            <span className="font-medium text-foreground">
                                Órdenes
                            </span>
                            .
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={panel.ventasOrdenes.index.url()}
                        prefetch
                        className="inline-flex"
                    >
                        <NeuButtonRaised
                            type="button"
                            className="cursor-pointer"
                        >
                            <ListOrdered className="size-4 text-[#4A80B8]" />
                            Ver órdenes
                        </NeuButtonRaised>
                    </Link>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                {paymentGatewayEnabled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                        <Power className="size-3.5" />
                        Pasarela habilitada (config)
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/12 px-2.5 py-1 text-xs text-[#D28C3C]">
                        <PowerOff className="size-3.5" />
                        Pasarela desactivada
                    </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <CreditCard className="size-3.5" />
                    Pendientes de pago {pendingPaymentCount}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <CheckCircle2 className="size-3.5" />
                    Transacciones registradas {transactionsTotal}
                </span>
            </div>
        </NeuCardRaised>
    );
}
