import { Head } from '@inertiajs/react';

import VentasEntregasIndex from '@/components/sales/deliveries/VentasEntregasIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    deliveries: any;
    filters?: {
        q?: string;
        igv?: string;
        plan?: string;
        sort_dir?: 'asc' | 'desc';
        date_from?: string;
        date_to?: string;
    };
};

export default function VentasEntregasPage({ deliveries, filters }: Props) {
    const section = 'ventas-entregas';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <VentasEntregasIndex
                    deliveries={deliveries}
                    initialQuery={filters?.q ?? ''}
                    initialIgv={filters?.igv ?? ''}
                    initialPlan={filters?.plan ?? ''}
                    initialSortDir={filters?.sort_dir ?? 'desc'}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                />
            </div>
        </AppLayout>
    );
}
