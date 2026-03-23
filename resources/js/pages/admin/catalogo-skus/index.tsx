import { Head } from '@inertiajs/react';

import CatalogSkusIndex from '@/components/catalog/skus/CatalogSkusIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    skus: any;
    productsForSelect: any[];
    filters?: {
        q?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
};

export default function CatalogSkusPage({
    skus,
    productsForSelect,
    filters,
}: Props) {
    const section = 'catalogo-skus';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <CatalogSkusIndex
                    skus={skus}
                    productsForSelect={productsForSelect}
                    initialQuery={filters?.q ?? ''}
                    initialSortBy={filters?.sort_by ?? ''}
                    initialSortDir={filters?.sort_dir ?? 'asc'}
                />
            </div>
        </AppLayout>
    );
}

