import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import { formatClientFullName } from '@/components/sales/orders/orderDisplay';
import {
    formatPaymentMoney,
    paymentStatusBadgeClass,
    paymentStatusLabel,
    truncateGatewayId,
} from '@/components/sales/payments/paymentDisplay';
import VentasPagosTransaccionesFilters from '@/components/sales/payments/VentasPagosTransaccionesFilters';
import type {
    PaymentRow,
    VentasPagosFilters,
} from '@/components/sales/payments/ventasPagosTypes';
import panel from '@/routes/panel';

type Props = {
    payments: any;
    filters: VentasPagosFilters;
    gatewayOptions: string[];
    statusOptions: string[];
};

export default function VentasPagosTransaccionesTable({
    payments,
    filters,
    gatewayOptions,
    statusOptions,
}: Props) {
    const rows: PaymentRow[] = (payments?.data ?? []) as PaymentRow[];

    const formatDate = (iso: string | null) => {
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
    };

    const columns: AdminCrudTableColumn<PaymentRow>[] = [
        {
            header: 'Estado',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        paymentStatusBadgeClass(r.status),
                    ].join(' ')}
                >
                    {paymentStatusLabel(r.status)}
                </span>
            ),
        },
        {
            header: 'Fecha',
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDate(r.created_at),
        },
        {
            header: 'Pasarela',
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs',
            render: (r) => r.gateway,
        },
        {
            header: 'Pedido',
            cellClassName: 'px-3 py-2 align-middle font-mono text-sm text-[#4A80B8]',
            render: (r) => r.order?.order_number ?? '—',
        },
        {
            header: 'Cliente',
            cellClassName: 'px-3 py-2 align-middle max-w-[14rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {formatClientFullName(
                            r.user
                                ? {
                                      name: r.user.name ?? '',
                                      lastname: r.user.lastname,
                                      email: r.user.email,
                                      document_number: null,
                                  }
                                : null,
                        )}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                        {r.user?.email?.trim() ? r.user.email : '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Importe',
            cellClassName: 'px-3 py-2 align-middle font-medium',
            render: (r) => formatPaymentMoney(r),
        },
        {
            header: 'Id externo',
            cellClassName: 'px-3 py-2 align-middle font-mono text-[11px] text-muted-foreground',
            render: (r) => truncateGatewayId(r.gateway_payment_id),
        },
    ];

    return (
        <AdminCrudIndex<PaymentRow>
            rows={rows}
            paginator={payments ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay transacciones registradas. Los cobros por pasarela aparecerán aquí cuando se completen pagos."
            renderAboveTable={() => (
                <VentasPagosTransaccionesFilters
                    filters={filters}
                    gatewayOptions={gatewayOptions}
                    statusOptions={statusOptions}
                    className="mt-1"
                />
            )}
            renderRowActions={({ row }) => (
                <div className="flex items-center gap-1">
                    {row.order?.id ? (
                        <Link
                            href={panel.ventasOrdenes.show.url(row.order.id)}
                            prefetch
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                            aria-label="Ver pedido"
                        >
                            <Eye className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                        </Link>
                    ) : null}
                </div>
            )}
        />
    );
}
