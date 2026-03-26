import { Head } from '@inertiajs/react';

import AccesoOemEntregasIndex from '@/components/acceso/oem/AccesoOemEntregasIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    oemLicenseDeliveries: any;
    filters?: {
        q?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
};

export default function AccesoOemEntregasPage({
    oemLicenseDeliveries,
    filters,
}: Props) {
    const section = 'acceso-entregas-oem';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <AccesoOemEntregasIndex
                    oemLicenseDeliveries={oemLicenseDeliveries}
                    initialQuery={filters?.q ?? ''}
                    initialStatus={filters?.status ?? ''}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                    initialSortBy={filters?.sort_by ?? 'created_at'}
                    initialSortDir={filters?.sort_dir ?? 'desc'}
                />
            </div>
        </AppLayout>
    );
}
