import { Head } from '@inertiajs/react';

import AccesoCredencialesIndex from '@/components/acceso/credenciales/AccesoCredencialesIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    entitlementSecrets: any;
    entitlementOptions: { value: string; label: string; searchTerms?: string[] }[];
    kindOptions: { value: string; label: string }[];
    credentialStoreUrl: string;
    filters?: {
        entitlement_id?: string;
        entitlement_filter_label?: string | null;
        q?: string;
        kind?: string;
        entitlement_status?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
};

export default function AccesoCredencialesPage({
    entitlementSecrets,
    entitlementOptions,
    kindOptions,
    credentialStoreUrl,
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
                    initialSortBy={filters?.sort_by ?? 'created_at'}
                    initialSortDir={filters?.sort_dir ?? 'desc'}
                    initialEntitlementId={filters?.entitlement_id ?? ''}
                    entitlementFilterLabel={filters?.entitlement_filter_label ?? null}
                    entitlementOptions={entitlementOptions}
                    kindOptions={kindOptions}
                    credentialStoreUrl={credentialStoreUrl}
                />
            </div>
        </AppLayout>
    );
}
