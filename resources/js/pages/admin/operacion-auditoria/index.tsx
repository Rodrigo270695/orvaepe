import { Head } from '@inertiajs/react';

import OperacionAuditoriaIndex from '@/components/operacion/auditoria/OperacionAuditoriaIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    auditLogs: any;
    filters?: {
        q?: string;
        user_scope?: string;
        date_from?: string;
        date_to?: string;
    };
};

export default function OperacionAuditoriaPage({
    auditLogs,
    filters,
}: Props) {
    const section = 'operacion-auditoria';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <OperacionAuditoriaIndex
                    auditLogs={auditLogs}
                    initialQuery={filters?.q ?? ''}
                    initialUserScope={filters?.user_scope ?? ''}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                />
            </div>
        </AppLayout>
    );
}
