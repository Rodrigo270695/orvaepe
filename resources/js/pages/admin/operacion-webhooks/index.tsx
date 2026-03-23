import { Head } from '@inertiajs/react';

import OperacionWebhooksIndex from '@/components/operacion/webhooks/OperacionWebhooksIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    webhookEvents: any;
    filters?: {
        q?: string;
        processed?: string;
        date_from?: string;
        date_to?: string;
    };
};

export default function OperacionWebhooksPage({
    webhookEvents,
    filters,
}: Props) {
    const section = 'operacion-webhooks';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <OperacionWebhooksIndex
                    webhookEvents={webhookEvents}
                    initialQuery={filters?.q ?? ''}
                    initialProcessed={filters?.processed ?? ''}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                />
            </div>
        </AppLayout>
    );
}
