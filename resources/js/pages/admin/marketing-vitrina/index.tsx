import { Head } from '@inertiajs/react';

import MarketingVitrinaIndex from '@/components/admin/marketing/MarketingVitrinaIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    showcaseClients: any;
    /** Próximo `sort_order` al crear (max + 1 o 1). */
    next_sort_order: number;
    filters?: {
        q?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
};

export default function MarketingVitrinaPage({
    showcaseClients,
    next_sort_order,
    filters,
}: Props) {
    const section = 'marketing-vitrina';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <MarketingVitrinaIndex
                    showcaseClients={showcaseClients}
                    nextSortOrder={next_sort_order}
                    initialQuery={filters?.q ?? ''}
                    initialSortBy={filters?.sort_by ?? 'sort_order'}
                    initialSortDir={filters?.sort_dir ?? 'asc'}
                />
            </div>
        </AppLayout>
    );
}
