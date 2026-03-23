import { Head } from '@inertiajs/react';

import CouponsIndex from '@/components/catalog/coupons/CouponsIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    coupons: any;
    skusForSelect: any[];
    filters?: {
        q?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
};

export default function CatalogoCuponesPage({
    coupons,
    skusForSelect,
    filters,
}: Props) {
    const section = 'catalogo-cupones';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <CouponsIndex
                    coupons={coupons}
                    skusForSelect={skusForSelect}
                    initialQuery={filters?.q ?? ''}
                    initialSortBy={filters?.sort_by ?? ''}
                    initialSortDir={filters?.sort_dir ?? 'asc'}
                />
            </div>
        </AppLayout>
    );
}
