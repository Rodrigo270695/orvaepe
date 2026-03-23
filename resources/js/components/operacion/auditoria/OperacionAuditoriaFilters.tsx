import { router, usePage } from '@inertiajs/react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import OperacionAuditoriaSearch from '@/components/operacion/auditoria/OperacionAuditoriaSearch';
import VentasOrdenesDateRangeFilter from '@/components/sales/orders/VentasOrdenesDateRangeFilter';

type Props = {
    initialQuery: string;
    initialUserScope: string;
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

export default function OperacionAuditoriaFilters({
    initialQuery,
    initialUserScope,
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
                <OperacionAuditoriaSearch
                    initialQuery={initialQuery}
                    className="mt-1"
                />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={initialDateFrom}
                initialDateTo={initialDateTo}
            />
            <div className="w-[min(100%,18rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_audit_user_scope">
                    Actor
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_audit_user_scope"
                    name="filter_audit_user_scope"
                    value={initialUserScope === '' ? '_all_' : initialUserScope}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete('user_scope');
                        } else {
                            currentUrl.searchParams.set('user_scope', next);
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
                        { value: '1', label: 'Con usuario' },
                        { value: '0', label: 'Sistema' },
                    ]}
                />
            </div>
        </div>
    );
}
