import { Head } from '@inertiajs/react';

import EmisorIndex from '@/components/sunat/emisor/EmisorIndex';
import type { CompanyLegalProfileLoaded } from '@/components/sunat/emisor/types';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    profile: CompanyLegalProfileLoaded | null;
};

export default function EmisorPage({ profile }: Props) {
    const section = 'sunat-emisor';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="w-full">
                    <EmisorIndex profile={profile} />
                </div>
            </div>
        </AppLayout>
    );
}

