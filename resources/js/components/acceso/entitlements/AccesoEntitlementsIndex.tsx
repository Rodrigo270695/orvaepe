import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import AccesoEntitlementsFilters from '@/components/acceso/entitlements/AccesoEntitlementsFilters';
import AccesoEntitlementsMobileCards from '@/components/acceso/entitlements/AccesoEntitlementsMobileCards';
import AccesoEntitlementsToolbar from '@/components/acceso/entitlements/AccesoEntitlementsToolbar';
import {
    entitlementStatusBadgeClass,
    entitlementStatusLabel,
    formatClientFullName,
    formatDateShort,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';
import type { EntitlementRow } from '@/components/acceso/entitlements/entitlementTypes';

type Props = {
    entitlements: any;
    initialQuery: string;
    initialStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
};

export default function AccesoEntitlementsIndex({
    entitlements,
    initialQuery,
    initialStatus,
    initialDateFrom,
    initialDateTo,
}: Props) {
    const rows: EntitlementRow[] = (entitlements?.data ?? []) as EntitlementRow[];
    const total = entitlements?.total ?? rows.length;

    const columns: AdminCrudTableColumn<EntitlementRow>[] = [
        {
            header: 'Estado',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        entitlementStatusBadgeClass(r.status),
                    ].join(' ')}
                >
                    {entitlementStatusLabel(r.status)}
                </span>
            ),
        },
        {
            header: 'Cliente',
            cellClassName: 'px-3 py-2 align-middle max-w-[14rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {formatClientFullName(r.user ?? null)}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                        {r.user?.email ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Producto',
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[12rem]',
            render: (r) => (
                <span className="line-clamp-2">
                    {r.catalog_product?.name ?? '—'}
                </span>
            ),
        },
        {
            header: 'SKU',
            cellClassName: 'px-3 py-2 align-middle font-mono text-[11px] max-w-[10rem]',
            render: (r) =>
                r.catalog_sku
                    ? `${r.catalog_sku.code} · ${r.catalog_sku.name}`
                    : '—',
        },
        {
            header: 'Inicio — Fin',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground max-w-[12rem]',
            render: (r) => (
                <span>
                    {formatDateShort(r.starts_at)}
                    {' — '}
                    {formatDateShort(r.ends_at)}
                </span>
            ),
        },
        {
            header: 'Secretos',
            cellClassName: 'px-3 py-2 align-middle text-sm tabular-nums',
            render: (r) => r.secrets_count ?? 0,
        },
        {
            header: 'Alta',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.created_at),
        },
    ];

    return (
        <AdminCrudIndex<EntitlementRow>
            rows={rows}
            paginator={entitlements ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay entitlements registrados. Cuando existan filas en la tabla entitlements, aparecerán aquí."
            renderToolbar={() => (
                <AccesoEntitlementsToolbar
                    totalEntitlements={total}
                    rowsCount={rows.length}
                />
            )}
            renderAboveTable={() => (
                <AccesoEntitlementsFilters
                    initialQuery={initialQuery}
                    initialStatus={initialStatus}
                    initialDateFrom={initialDateFrom}
                    initialDateTo={initialDateTo}
                />
            )}
            renderMobileRows={({ rows: mobileRows }) => (
                <AccesoEntitlementsMobileCards
                    rows={mobileRows}
                    emptyMessage="No hay entitlements registrados. Cuando existan filas en la tabla entitlements, aparecerán aquí."
                />
            )}
        />
    );
}
