import { Head } from '@inertiajs/react';

import CatalogProductsIndex from '@/components/catalog/products/CatalogProductsIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    products: any;
    categoriesForSelect: any[];
    filters?: {
        q?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
};

export default function CatalogProductsPage({
    products,
    categoriesForSelect,
    filters,
}: Props) {
    const section = 'catalogo-productos';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <CatalogProductsIndex
                    products={products}
                    categoriesForSelect={categoriesForSelect}
                    initialQuery={filters?.q ?? ''}
                    initialSortBy={filters?.sort_by ?? ''}
                    initialSortDir={filters?.sort_dir ?? 'asc'}
                />
            </div>
        </AppLayout>
    );
}

