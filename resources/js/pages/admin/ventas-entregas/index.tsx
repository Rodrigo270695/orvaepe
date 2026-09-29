import { Head } from '@inertiajs/react';

import VentasEntregasIndex from '@/components/sales/deliveries/VentasEntregasIndex';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    deliveries: any;
    summary: {
        count: number;
        total_amount: string;
        pending_amount: string;
        collected_amount: string;
        with_igv: number;
        without_igv: number;
        with_docs: number;
    };
    filters?: {
        q?: string;
        igv?: string;
        plan?: string;
        cobro?: string;
        sort_dir?: 'asc' | 'desc';
        date_from?: string;
        date_to?: string;
    };
};

export default function VentasEntregasPage({ deliveries, summary, filters }: Props) {
    const section = 'ventas-entregas';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: panelPath(section) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={panelSectionTitle(section)} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <VentasEntregasIndex
                    deliveries={deliveries}
                    summary={summary}
                    initialQuery={filters?.q ?? ''}
                    initialIgv={filters?.igv ?? ''}
                    initialPlan={filters?.plan ?? ''}
                    initialCobro={filters?.cobro ?? ''}
                    initialSortDir={filters?.sort_dir ?? 'desc'}
                    initialDateFrom={filters?.date_from ?? ''}
                    initialDateTo={filters?.date_to ?? ''}
                />
            </div>
        </AppLayout>
    );
}
