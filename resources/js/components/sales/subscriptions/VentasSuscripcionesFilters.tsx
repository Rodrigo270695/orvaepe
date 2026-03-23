import { router, usePage } from '@inertiajs/react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import VentasOrdenesDateRangeFilter from '@/components/sales/orders/VentasOrdenesDateRangeFilter';
import VentasSuscripcionesSearch from '@/components/sales/subscriptions/VentasSuscripcionesSearch';

type Props = {
    initialQuery: string;
    initialStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

export default function VentasSuscripcionesFilters({
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
                <VentasSuscripcionesSearch initialQuery={initialQuery} />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={initialDateFrom}
                initialDateTo={initialDateTo}
            />
            <div className="w-[min(100%,20rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_sub_status">
                    Estado
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_sub_status"
                    name="filter_sub_status"
                    value={initialStatus || '_all_'}
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
                        { value: 'trialing', label: 'En prueba' },
                        { value: 'active', label: 'Activa' },
                        { value: 'past_due', label: 'Vencida' },
                        { value: 'paused', label: 'Pausada' },
                        { value: 'cancelled', label: 'Cancelada' },
                    ]}
                />
            </div>
        </div>
    );
}
