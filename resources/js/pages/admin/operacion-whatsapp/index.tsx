import { Head } from '@inertiajs/react';

import OperacionWhatsappIndex from '@/components/operacion/whatsapp/OperacionWhatsappIndex';
import type {
    WhatsAppApiRoutes,
    WhatsAppProps,
} from '@/components/operacion/whatsapp/types';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    whatsapp: WhatsAppProps;
    apiRoutes: WhatsAppApiRoutes;
};

export default function OperacionWhatsappPage({ whatsapp, apiRoutes }: Props) {
    const section = 'operacion-whatsapp';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="w-full">
                    <OperacionWhatsappIndex
                        whatsapp={whatsapp}
                        apiRoutes={apiRoutes}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
