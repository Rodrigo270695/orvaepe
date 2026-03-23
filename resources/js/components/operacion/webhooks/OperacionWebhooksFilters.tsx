import { router, usePage } from '@inertiajs/react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import OperacionWebhooksSearch from '@/components/operacion/webhooks/OperacionWebhooksSearch';
import VentasOrdenesDateRangeFilter from '@/components/sales/orders/VentasOrdenesDateRangeFilter';

type Props = {
    initialQuery: string;
    initialProcessed: string;
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

export default function OperacionWebhooksFilters({
    initialQuery,
    initialProcessed,
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
                <OperacionWebhooksSearch
                    initialQuery={initialQuery}
                    className="mt-1"
                />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={initialDateFrom}
                initialDateTo={initialDateTo}
            />
            <div className="w-[min(100%,18rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_webhook_processed">
                    Procesado
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_webhook_processed"
                    name="filter_webhook_processed"
                    value={initialProcessed === '' ? '_all_' : initialProcessed}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete('processed');
                        } else {
                            currentUrl.searchParams.set('processed', next);
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
                        { value: '1', label: 'Sí' },
                        { value: '0', label: 'No' },
                    ]}
                />
            </div>
        </div>
    );
}
