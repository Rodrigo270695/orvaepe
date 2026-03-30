import { router, usePage } from '@inertiajs/react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import VentasOrdenesDateRangeFilter from '@/components/sales/orders/VentasOrdenesDateRangeFilter';
import VentasSuscripcionesSearch from '@/components/sales/subscriptions/VentasSuscripcionesSearch';

type Props = {
    initialQuery: string;
    initialKind: string;
    initialEntitlementStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
    className?: string;
};

export default function AccesoCredencialesFilters({
    initialQuery,
    initialKind,
    initialEntitlementStatus,
    initialDateFrom,
    initialDateTo,
    className,
}: Props) {
    const page = usePage();

    return (
        <div
            className={[
                'flex flex-col gap-3',
                className ?? '',
            ].join(' ')}
        >
            <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
            <div className="min-w-0 flex-1 basis-[min(100%,12rem)] sm:basis-0">
                <VentasSuscripcionesSearch
                    wide
                    initialQuery={initialQuery}
                    placeholder="Cliente, etiqueta, ref. o documento…"
                />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={initialDateFrom}
                initialDateTo={initialDateTo}
            />
            <div className="w-[min(100%,11rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_secret_kind">
                    Tipo
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_secret_kind"
                    name="filter_secret_kind"
                    value={initialKind || '_all_'}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete('kind');
                        } else {
                            currentUrl.searchParams.set('kind', next);
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
                        { value: 'api_key', label: 'API key' },
                        { value: 'hmac_secret', label: 'HMAC' },
                        { value: 'oauth_refresh', label: 'OAuth refresh' },
                        { value: 'certificate', label: 'Certificado' },
                        { value: 'custom', label: 'Personalizado' },
                    ]}
                />
            </div>
            <div className="w-[min(100%,11rem)] shrink-0 space-y-1.5">
                <AdminUnderlineLabel htmlFor="filter_entitlement_status_cred">
                    Estado entitlement
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="filter_entitlement_status_cred"
                    name="filter_entitlement_status_cred"
                    value={initialEntitlementStatus || '_all_'}
                    onValueChange={(next) => {
                        const currentUrl = new URL(
                            page.url,
                            window.location.origin,
                        );
                        if (next === '_all_') {
                            currentUrl.searchParams.delete(
                                'entitlement_status',
                            );
                        } else {
                            currentUrl.searchParams.set(
                                'entitlement_status',
                                next,
                            );
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
                        { value: 'active', label: 'Activo' },
                        { value: 'expired', label: 'Vencido' },
                        { value: 'suspended', label: 'Suspendido' },
                        { value: 'revoked', label: 'Revocado' },
                    ]}
                />
            </div>
            </div>
        </div>
    );
}
