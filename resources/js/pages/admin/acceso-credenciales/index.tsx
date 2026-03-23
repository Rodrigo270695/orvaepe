import { Head } from '@inertiajs/react';

import AccesoCredencialesIndex from '@/components/acceso/credenciales/AccesoCredencialesIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    entitlementSecrets: any;
    filters?: {
        q?: string;
        kind?: string;
        entitlement_status?: string;
        date_from?: string;
        date_to?: string;
    };
};

export default function AccesoCredencialesPage({
    entitlementSecrets,
    filters,
}: Props) {
    const section = 'acceso-credenciales';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <AccesoCredencialesIndex
                    entitlementSecrets={entitlementSecrets}
                    initialQuery={filters?.q ?? ''}
                    initialKind={filters?.kind ?? ''}
                    initialEntitlementStatus={filters?.entitlement_status ?? ''}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                />
            </div>
        </AppLayout>
    );
}
