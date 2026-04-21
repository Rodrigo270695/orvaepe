import { Head } from '@inertiajs/react';

import VentasCotizacionesIndex from '@/components/sales/quotes/VentasCotizacionesIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    quotes: any;
    filters?: {
        q?: string;
        status?: string;
        sort_dir?: 'asc' | 'desc';
        date_from?: string;
        date_to?: string;
    };
};

export default function VentasCotizacionesPage({ quotes, filters }: Props) {
    const section = 'ventas-cotizaciones';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <VentasCotizacionesIndex
                    quotes={quotes}
                    initialQuery={filters?.q ?? ''}
                    initialStatus={filters?.status ?? ''}
                    initialSortDir={filters?.sort_dir ?? 'desc'}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                />
            </div>
        </AppLayout>
    );
}
