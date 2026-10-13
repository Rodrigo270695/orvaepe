import { Head } from '@inertiajs/react';

import OperacionWhatsappCloudIndex from '@/components/operacion/whatsapp-cloud/OperacionWhatsappCloudIndex';
import type {
    WhatsappCloudFilters,
    WhatsappCloudStats,
} from '@/components/operacion/whatsapp-cloud/whatsappCloudTypes';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    webhookEvents: any;
    stats: WhatsappCloudStats;
    productos: string[];
    webhookUrl: string;
    filters?: WhatsappCloudFilters;
};

export default function OperacionWhatsappCloudPage({
    webhookEvents,
    stats,
    productos,
    webhookUrl,
    filters,
}: Props) {
    const section = 'operacion-whatsapp-cloud';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <OperacionWhatsappCloudIndex
                    webhookEvents={webhookEvents}
                    stats={stats}
                    productos={productos}
                    webhookUrl={webhookUrl}
                    filters={filters ?? {}}
                />
            </div>
        </AppLayout>
    );
}
