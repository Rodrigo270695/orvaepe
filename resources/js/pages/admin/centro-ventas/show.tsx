import { Head } from '@inertiajs/react';

import { SalesHubShow } from '@/components/saleshub/SalesHubShow';
import type { SalesHubPageProps } from '@/components/saleshub/types';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export default function CentroVentasShowPage(props: SalesHubPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        {
            title: panelSectionTitle('operacion-openwa'),
            href: panelPath('operacion-openwa'),
        },
        { title: props.product.label, href: props.routes.show },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${props.product.label} · Centro de Ventas`} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <SalesHubShow {...props} />
            </div>
        </AppLayout>
    );
}
