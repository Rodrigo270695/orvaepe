import { Head } from '@inertiajs/react';

import SoftwareReleasesIndex from '@/components/catalog/releases/SoftwareReleasesIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    releases: any;
    productsForSelect: any[];
    filters?: {
        q?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
        catalog_product_id?: string;
    };
};

export default function CatalogoReleasesPage({
    releases,
    productsForSelect,
    filters,
}: Props) {
    const section = 'catalogo-releases';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <SoftwareReleasesIndex
                    releases={releases}
                    productsForSelect={productsForSelect}
                    initialQuery={filters?.q ?? ''}
                    initialSortBy={filters?.sort_by ?? ''}
                    initialSortDir={filters?.sort_dir ?? 'asc'}
                    initialCatalogProductId={filters?.catalog_product_id ?? ''}
                />
            </div>
        </AppLayout>
    );
}
