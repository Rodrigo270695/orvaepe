import { Head } from '@inertiajs/react';

import type { ClienteUserOption } from '@/components/admin/form/admin-cliente-select';
import type { SkuOption } from '@/components/acceso/licencias/AccesoLicenciaFormFields';
import AccesoLicenciasIndex from '@/components/acceso/licencias/AccesoLicenciasIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    licenseKeys: any;
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuOption[];
    filters?: {
        q?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
};

export default function AccesoLicenciasPage({
    licenseKeys,
    usersForSelect,
    skusForSelect,
    filters,
}: Props) {
    const section = 'acceso-licencias';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <AccesoLicenciasIndex
                    licenseKeys={licenseKeys}
                    usersForSelect={usersForSelect}
                    skusForSelect={skusForSelect}
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
