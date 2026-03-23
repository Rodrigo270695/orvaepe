import { router, usePage } from '@inertiajs/react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import VentasOrdenesDateRangeFilter from '@/components/sales/orders/VentasOrdenesDateRangeFilter';
import VentasPagosTransaccionesSearch from '@/components/sales/payments/VentasPagosTransaccionesSearch';
import type { VentasPagosFilters } from '@/components/sales/payments/ventasPagosTypes';
import { paymentStatusLabel } from '@/components/sales/payments/paymentDisplay';

type Props = {
    filters: VentasPagosFilters;
    gatewayOptions: string[];
    statusOptions: string[];
    className?: string;
};

export default function VentasPagosTransaccionesFilters({
    filters,
    gatewayOptions,
    statusOptions,
    className,
}: Props) {
    const page = usePage();

    const setParam = (key: string, value: string, emptyMeansDelete: boolean) => {
        const currentUrl = new URL(page.url, window.location.origin);
        if (emptyMeansDelete && (value === '' || value === '_all_')) {
            currentUrl.searchParams.delete(key);
        } else {
            currentUrl.searchParams.set(key, value);
        }
        currentUrl.searchParams.set('page', '1');
        router.get(currentUrl.pathname + currentUrl.search, {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <div
            className={[
                'flex flex-wrap items-end gap-x-3 gap-y-3',
                className ?? '',
            ].join(' ')}
        >
            <div className="w-full min-w-0 max-w-sm sm:w-auto">
                <VentasPagosTransaccionesSearch initialQuery={filters.q} />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={filters.date_from}
                initialDateTo={filters.date_to}
            />
            <div className="w-[min(100%,20rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_gateway">
                    Pasarela
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_gateway"
                    name="gateway"
                    value={filters.gateway || '_all_'}
                    onValueChange={(next) =>
                        setParam('gateway', next === '_all_' ? '' : next, true)
                    }
                    options={[
                        { value: '_all_', label: 'Todas' },
                        ...gatewayOptions.map((g) => ({
                            value: g,
                            label: g,
                        })),
                    ]}
                />
            </div>
            <div className="w-[min(100%,20rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_pay_status">
                    Estado del pago
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_pay_status"
                    name="status"
                    value={filters.status || '_all_'}
                    onValueChange={(next) =>
                        setParam('status', next === '_all_' ? '' : next, true)
                    }
                    options={[
                        { value: '_all_', label: 'Todos' },
                        ...statusOptions.map((s) => ({
                            value: s,
                            label: paymentStatusLabel(s),
                        })),
                    ]}
                />
            </div>
        </div>
    );
}
