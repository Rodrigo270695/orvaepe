import { router, usePage } from '@inertiajs/react';

import AccesoOemEntregasSearch from '@/components/acceso/oem/AccesoOemEntregasSearch';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import VentasOrdenesDateRangeFilter from '@/components/sales/orders/VentasOrdenesDateRangeFilter';

type Props = {
    initialQuery: string;
    initialStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

export default function AccesoOemEntregasFilters({
    initialQuery,
    initialStatus,
    initialDateFrom,
    initialDateTo,
    className,
}: Props) {
    const page = usePage();

    return (
        <div
            className={[
                'flex flex-wrap items-end gap-x-3 gap-y-3',
                className ?? '',
            ].join(' ')}
        >
            <div className="w-full min-w-0 max-w-sm sm:w-auto">
                <AccesoOemEntregasSearch
                    initialQuery={initialQuery}
                    className="mt-1"
                />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={initialDateFrom}
                initialDateTo={initialDateTo}
            />
            <div className="w-[min(100%,18rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_oem_status">
                    Estado
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_oem_status"
                    name="filter_oem_status"
                    value={initialStatus === '' ? '_all_' : initialStatus}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete('status');
                        } else {
                            currentUrl.searchParams.set('status', next);
                        }
                        currentUrl.searchParams.set('page', '1');
                        router.get(
                            currentUrl.pathname + currentUrl.search,
                            {},
                            {
                                preserveScroll: true,
                                preserveState: true,
                                replace: true,
                            },
                        );
                    }}
                    options={[
                        { value: '_all_', label: 'Todos' },
                        { value: 'pending', label: 'Pendiente' },
                        { value: 'delivered', label: 'Entregada' },
                        { value: 'revoked', label: 'Revocada' },
                    ]}
                />
            </div>
        </div>
    );
}
