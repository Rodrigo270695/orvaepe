import { Head } from '@inertiajs/react';

import VentasSuscripcionesIndex from '@/components/sales/subscriptions/VentasSuscripcionesIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    subscriptions: any;
    filters?: {
        q?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
};

export default function VentasSuscripcionesPage({
    subscriptions,
    filters,
}: Props) {
    const section = 'ventas-suscripciones';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <VentasSuscripcionesIndex
                    subscriptions={subscriptions}
                    initialQuery={filters?.q ?? ''}
                    initialStatus={filters?.status ?? ''}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                />
            </div>
        </AppLayout>
    );
}
