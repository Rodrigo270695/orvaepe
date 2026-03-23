import { Head } from '@inertiajs/react';

import VentasPagosIndex from '@/components/sales/payments/VentasPagosIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    paymentGatewayEnabled: boolean;
    pendingPaymentCount: number;
    payments: any;
    filters: {
        q: string;
        gateway: string;
        status: string;
        date_from: string;
        date_to: string;
    };
    gatewayOptions: string[];
    statusOptions: string[];
};

export default function VentasPagosPage({
    paymentGatewayEnabled,
    pendingPaymentCount,
    payments,
    filters,
    gatewayOptions,
    statusOptions,
}: Props) {
    const section = 'ventas-pagos';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <VentasPagosIndex
                    paymentGatewayEnabled={paymentGatewayEnabled}
                    pendingPaymentCount={pendingPaymentCount}
                    payments={payments}
                    filters={filters}
                    gatewayOptions={gatewayOptions}
                    statusOptions={statusOptions}
                />
            </div>
        </AppLayout>
    );
}
