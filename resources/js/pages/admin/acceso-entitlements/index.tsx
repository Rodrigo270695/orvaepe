import { Head } from '@inertiajs/react';

import AccesoEntitlementsIndex from '@/components/acceso/entitlements/AccesoEntitlementsIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    entitlements: any;
    filters?: {
        q?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
};

export default function AccesoEntitlementsPage({ entitlements, filters }: Props) {
    const section = 'acceso-entitlements';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <AccesoEntitlementsIndex
                    entitlements={entitlements}
                    initialQuery={filters?.q ?? ''}
                    initialStatus={filters?.status ?? ''}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                />
            </div>
        </AppLayout>
    );
}
