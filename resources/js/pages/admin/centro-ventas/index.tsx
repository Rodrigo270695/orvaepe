import { Head } from '@inertiajs/react';

import SalesHubIndex from '@/components/saleshub/SalesHubIndex';
import type { SalesHubPageProps } from '@/components/saleshub/types';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export default function CentroVentasPage(props: SalesHubPageProps) {
    const section = 'centro-ventas';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <SalesHubIndex {...props} />
            </div>
        </AppLayout>
    );
}
