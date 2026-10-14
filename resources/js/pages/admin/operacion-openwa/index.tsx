import { Head } from '@inertiajs/react';

import OperacionOpenWaIndex from '@/components/operacion/openwa/OperacionOpenWaIndex';
import type { OpenWaPageProps } from '@/components/operacion/openwa/types';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export default function OperacionOpenWaPage(props: OpenWaPageProps) {
    const section = 'operacion-openwa';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <OperacionOpenWaIndex {...props} />
            </div>
        </AppLayout>
    );
}
