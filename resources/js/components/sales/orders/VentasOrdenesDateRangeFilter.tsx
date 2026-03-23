import { router } from '@inertiajs/react';
import * as React from 'react';

import AdminNeuInsetDateInput from '@/components/admin/form/admin-neu-inset-date-input';

type Props = {
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

/**
 * Filtro por rango sobre `created_at` del pedido (query: `date_from`, `date_to`, formato YYYY-MM-DD).
 */
export default function VentasOrdenesDateRangeFilter({
    initialDateFrom,
    initialDateTo,
    className,
}: Props) {
    const [dateFrom, setDateFrom] = React.useState(initialDateFrom);
    const [dateTo, setDateTo] = React.useState(initialDateTo);

    React.useEffect(() => {
        setDateFrom(initialDateFrom);
    }, [initialDateFrom]);

    React.useEffect(() => {
        setDateTo(initialDateTo);
    }, [initialDateTo]);

    React.useEffect(() => {
        const t = window.setTimeout(() => {
            const currentUrl = new URL(window.location.href);
            const curFrom = currentUrl.searchParams.get('date_from') ?? '';
            const curTo = currentUrl.searchParams.get('date_to') ?? '';

            if (curFrom === dateFrom && curTo === dateTo) {
                return;
            }

            if (dateFrom !== '') {
                currentUrl.searchParams.set('date_from', dateFrom);
            } else {
                currentUrl.searchParams.delete('date_from');
            }

            if (dateTo !== '') {
                currentUrl.searchParams.set('date_to', dateTo);
            } else {
                currentUrl.searchParams.delete('date_to');
            }

            currentUrl.searchParams.set('page', '1');

            router.get(currentUrl.pathname + currentUrl.search, {}, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        }, 350);

        return () => window.clearTimeout(t);
    }, [dateFrom, dateTo]);

    return (
        <div
            className={[
                'flex w-auto shrink-0 flex-row flex-wrap items-end gap-2 sm:gap-3',
                className ?? '',
            ].join(' ')}
        >
            <div className="w-[min(100%,11rem)] shrink-0 sm:w-44">
                <AdminNeuInsetDateInput
                    id="filter_date_from"
                    label="Desde"
                    value={dateFrom}
                    onChange={setDateFrom}
                />
            </div>
            <div className="w-[min(100%,11rem)] shrink-0 sm:w-44">
                <AdminNeuInsetDateInput
                    id="filter_date_to"
                    label="Hasta"
                    value={dateTo}
                    onChange={setDateTo}
                />
            </div>
        </div>
    );
}
