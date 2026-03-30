import { router, usePage } from '@inertiajs/react';
import { Filter, X } from 'lucide-react';

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
    initialEntitlementId: string;
    entitlementFilterLabel: string | null;
    className?: string;
};

export default function AccesoCredencialesFilters({
    initialQuery,
    initialKind,
    initialEntitlementStatus,
    initialDateFrom,
    initialDateTo,
    initialEntitlementId,
    entitlementFilterLabel,
    className,
}: Props) {
    const page = usePage();

    const clearEntitlementFilter = () => {
        const currentUrl = new URL(page.url, window.location.origin);
        currentUrl.searchParams.delete('entitlement_id');
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
                'flex flex-col gap-3',
                className ?? '',
            ].join(' ')}
        >
            {initialEntitlementId !== '' ? (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4A80B8]/35 bg-[#4A80B8]/10 px-3 py-1.5 text-[11px] text-[#4A80B8]">
                        <Filter className="size-3.5 shrink-0" />
                        <span className="font-medium">Derecho de uso:</span>
                        <span className="max-w-[min(100%,28rem)] truncate">
                            {entitlementFilterLabel ?? initialEntitlementId}
                        </span>
                        <button
                            type="button"
                            onClick={clearEntitlementFilter}
                            className="ml-1 inline-flex shrink-0 items-center justify-center rounded-full p-0.5 text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/20"
                            aria-label="Quitar filtro por entitlement"
                        >
                            <X className="size-3.5" />
                        </button>
                    </span>
                </div>
            ) : null}

            <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
            <div className="w-full min-w-0 max-w-sm sm:w-auto">
                <VentasSuscripcionesSearch
                    initialQuery={initialQuery}
                    placeholder="Cliente, etiqueta, ref. o documento…"
                />
            </div>
            <VentasOrdenesDateRangeFilter
                initialDateFrom={initialDateFrom}
                initialDateTo={initialDateTo}
            />
            <div className="w-[min(100%,18rem)] shrink-0 space-y-1.5">
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
            <div className="w-[min(100%,18rem)] shrink-0 space-y-1.5">
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
