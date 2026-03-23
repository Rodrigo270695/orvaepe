import { Head } from '@inertiajs/react';

import InformesResumenView, {
    type InformesResumenViewProps,
} from '@/components/informes/InformesResumenView';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export default function InformesResumenPage(props: InformesResumenViewProps) {
    const section = 'informes-resumen';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <InformesResumenView {...props} />
            </div>
        </AppLayout>
    );
}
