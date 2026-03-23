import { router, usePage } from '@inertiajs/react';

import AccesoActivacionesSearch from '@/components/acceso/activaciones/AccesoActivacionesSearch';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import VentasOrdenesDateRangeFilter from '@/components/sales/orders/VentasOrdenesDateRangeFilter';

type Props = {
    initialQuery: string;
    initialActive: string;
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

export default function AccesoActivacionesFilters({
    initialQuery,
    initialActive,
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
                <AccesoActivacionesSearch
                    initialQuery={initialQuery}
                    className="mt-1"
                />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={initialDateFrom}
                initialDateTo={initialDateTo}
            />
            <div className="w-[min(100%,18rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_activation_active">
                    Registro
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_activation_active"
                    name="filter_activation_active"
                    value={initialActive === '' ? '_all_' : initialActive}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete('active');
                        } else {
                            currentUrl.searchParams.set('active', next);
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
                        { value: '1', label: 'Solo activas' },
                        { value: '0', label: 'Solo inactivas' },
                    ]}
                />
            </div>
        </div>
    );
}
