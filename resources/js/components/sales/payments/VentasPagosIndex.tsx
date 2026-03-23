import VentasPagosPasarelaPanel from '@/components/sales/payments/VentasPagosPasarelaPanel';
import VentasPagosToolbar from '@/components/sales/payments/VentasPagosToolbar';
import VentasPagosTransaccionesTable from '@/components/sales/payments/VentasPagosTransaccionesTable';
import type { VentasPagosIndexProps } from '@/components/sales/payments/ventasPagosTypes';

export default function VentasPagosIndex({
    paymentGatewayEnabled,
    pendingPaymentCount,
    payments,
    filters,
    gatewayOptions,
    statusOptions,
}: VentasPagosIndexProps) {
    const transactionsTotal =
        typeof payments?.total === 'number' ? payments.total : 0;

    return (
        <div className="space-y-6">
            <VentasPagosToolbar
                paymentGatewayEnabled={paymentGatewayEnabled}
                pendingPaymentCount={pendingPaymentCount}
                transactionsTotal={transactionsTotal}
            />
            <VentasPagosTransaccionesTable
                payments={payments}
                filters={filters}
                gatewayOptions={gatewayOptions}
                statusOptions={statusOptions}
            />
            <VentasPagosPasarelaPanel
                paymentGatewayEnabled={paymentGatewayEnabled}
                pendingPaymentCount={pendingPaymentCount}
            />
        </div>
    );
}
