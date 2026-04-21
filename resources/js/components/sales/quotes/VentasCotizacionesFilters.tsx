import { router, usePage } from '@inertiajs/react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import VentasCotizacionesDateRangeFilter from '@/components/sales/quotes/VentasCotizacionesDateRangeFilter';
import VentasCotizacionesSearch from '@/components/sales/quotes/VentasCotizacionesSearch';

type Props = {
    initialQuery: string;
    initialStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

export default function VentasCotizacionesFilters({
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
                <VentasCotizacionesSearch initialQuery={initialQuery} />
            </div>
            <VentasCotizacionesDateRangeFilter
                initialDateFrom={initialDateFrom}
                initialDateTo={initialDateTo}
            />
            <div className="w-[min(100%,20rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="cotiz_filter_status">
                    Estado
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="cotiz_filter_status"
                    name="cotiz_filter_status"
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
                        { value: 'draft', label: 'Borrador' },
                        { value: 'sent', label: 'Enviada' },
                        { value: 'viewed', label: 'Vista' },
                        { value: 'accepted', label: 'Aceptada' },
                        { value: 'rejected', label: 'Rechazada' },
                        { value: 'expired', label: 'Vencida' },
                        { value: 'converted', label: 'Convertida' },
                    ]}
                />
            </div>
        </div>
    );
}
