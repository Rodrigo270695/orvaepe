import { Head } from '@inertiajs/react';

import CatalogCategoriesIndex from '@/components/catalog/categories/CatalogCategoriesIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    categories: any;
    categoriesForSelect: any[];
    filters?: {
        q?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
};

export default function CatalogCategoriesPage({
    categories,
    categoriesForSelect,
    filters,
}: Props) {
    const section = 'catalogo-categorias';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <CatalogCategoriesIndex
                    categories={categories}
                    categoriesForSelect={categoriesForSelect}
                    initialQuery={filters?.q ?? ''}
                    initialSortBy={filters?.sort_by ?? ''}
                    initialSortDir={filters?.sort_dir ?? 'asc'}
                />
            </div>
        </AppLayout>
    );
}

