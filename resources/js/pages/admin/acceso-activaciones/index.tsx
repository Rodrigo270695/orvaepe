import { Head } from '@inertiajs/react';

import AccesoActivacionesIndex from '@/components/acceso/activaciones/AccesoActivacionesIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    licenseActivations: any;
    filters?: {
        q?: string;
        active?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
};

export default function AccesoActivacionesPage({
    licenseActivations,
    filters,
}: Props) {
    const section = 'acceso-activaciones';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <AccesoActivacionesIndex
                    licenseActivations={licenseActivations}
                    initialQuery={filters?.q ?? ''}
                    initialActive={filters?.active ?? ''}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                    initialSortBy={filters?.sort_by ?? 'last_ping_at'}
                    initialSortDir={filters?.sort_dir ?? 'desc'}
                />
            </div>
        </AppLayout>
    );
}
