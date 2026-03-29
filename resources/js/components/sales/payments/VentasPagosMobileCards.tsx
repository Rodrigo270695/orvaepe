import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

import { formatClientFullName } from '@/components/sales/orders/orderDisplay';
import {
    formatPaymentMoney,
    paymentStatusBadgeClass,
    paymentStatusLabel,
    truncateGatewayId,
} from '@/components/sales/payments/paymentDisplay';
import type { PaymentRow } from '@/components/sales/payments/ventasPagosTypes';
import panel from '@/routes/panel';

type Props = {
    rows: PaymentRow[];
};

function formatDate(iso: string | null): string {
    if (iso == null || iso === '') {
        return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function VentasPagosMobileCards({ rows }: Props) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground neumorph-inset">
                No hay transacciones registradas. Los cobros por pasarela
                aparecerán aquí cuando se completen pagos.
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/60 neumorph-inset">
            {rows.map((row, idx) => (
                <div
                    key={row.id}
                    className={[
                        'px-3 py-3',
                        idx > 0 ? 'border-t border-border/75' : '',
                        idx % 2 === 1 ? 'bg-black/3' : '',
                    ].join(' ')}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                            <p className="truncate font-mono text-sm font-semibold text-[#4A80B8]">
                                {row.order?.order_number ?? 'Sin pedido'}
                            </p>
                            <p className="text-xs font-medium leading-snug text-foreground">
                                {formatClientFullName(
                                    row.user
                                        ? {
                                              name: row.user.name ?? '',
                                              lastname: row.user.lastname,
                                              email: row.user.email,
                                              document_number: null,
                                          }
                                        : null,
                                )}
                            </p>
                            <p className="truncate text-[10px] font-mono text-muted-foreground">
                                {row.user?.email?.trim() ? row.user.email : '—'}
                            </p>
                        </div>

                        <span
                            className={[
                                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                paymentStatusBadgeClass(row.status),
                            ].join(' ')}
                        >
                            {paymentStatusLabel(row.status)}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <p className="text-muted-foreground">Fecha</p>
                            <p className="text-foreground">
                                {formatDate(row.created_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Pasarela</p>
                            <p className="font-mono text-foreground">
                                {row.gateway}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Importe</p>
                            <p className="text-sm font-medium text-foreground">
                                {formatPaymentMoney(row)}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Id externo</p>
                            <p className="break-all font-mono text-[11px] text-muted-foreground">
                                {truncateGatewayId(row.gateway_payment_id)}
                            </p>
                        </div>
                    </div>

                    {row.order?.id ? (
                        <div className="mt-3 flex items-center justify-end gap-2">
                            <Link
                                href={panel.ventasOrdenes.show.url(row.order.id)}
                                prefetch
                                className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                                aria-label="Ver pedido"
                            >
                                <Eye className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                            </Link>
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
