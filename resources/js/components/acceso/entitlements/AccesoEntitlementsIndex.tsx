import { Link, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, KeyRound } from 'lucide-react';

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
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

const credencialCreateHref = (entitlementId: string) =>
    `/panel/acceso-credenciales/create?entitlement_id=${encodeURIComponent(entitlementId)}`;

type Props = {
    entitlements: any;
    initialQuery: string;
    initialStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

export default function AccesoEntitlementsIndex({
    entitlements,
    initialQuery,
    initialStatus,
    initialDateFrom,
    initialDateTo,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const rows: EntitlementRow[] = (entitlements?.data ?? []) as EntitlementRow[];
    const total = entitlements?.total ?? rows.length;
    const handleSort = (sortBy: string) => {
        const currentUrl = new URL(page.url, window.location.origin);
        const currentSortBy = currentUrl.searchParams.get('sort_by') ?? initialSortBy ?? '';
        const currentSortDir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ?? initialSortDir;
        const nextDir: 'asc' | 'desc' =
            currentSortBy === sortBy && currentSortDir === 'asc' ? 'desc' : 'asc';
        currentUrl.searchParams.set('sort_by', sortBy);
        currentUrl.searchParams.set('sort_dir', nextDir);
        currentUrl.searchParams.set('page', '1');
        router.get(currentUrl.pathname + currentUrl.search, {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };
    const sortIcon = (key: string) => {
        if (initialSortBy !== key) return <ArrowUpDown className="size-3.5 opacity-70" />;
        return initialSortDir === 'asc' ? (
            <ArrowUp className="size-3.5 text-[#4A80B8]" />
        ) : (
            <ArrowDown className="size-3.5 text-[#4A80B8]" />
        );
    };
    const sortableHeader = (label: string, key: string) => (
        <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground"
            onClick={() => handleSort(key)}
        >
            <span>{label}</span>
            {sortIcon(key)}
        </button>
    );

    const columns: AdminCrudTableColumn<EntitlementRow>[] = [
        {
            header: sortableHeader('Estado', 'status'),
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
            header: sortableHeader('Inicio — Fin', 'starts_at'),
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
            header: sortableHeader('Secretos', 'secrets_count'),
            cellClassName: 'px-3 py-2 align-middle text-sm tabular-nums',
            render: (r) => r.secrets_count ?? 0,
        },
        {
            header: sortableHeader('Alta', 'created_at'),
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.created_at),
        },
        {
            header: 'Acción',
            cellClassName: 'px-3 py-2 align-middle w-[1%] whitespace-nowrap',
            render: (r) => (
                <Link href={credencialCreateHref(r.id)} className="inline-flex">
                    <NeuButtonRaised
                        type="button"
                        className="gap-1 px-2.5 py-1.5 text-[11px] font-medium"
                    >
                        <KeyRound className="size-3" />
                        Credencial
                    </NeuButtonRaised>
                </Link>
            ),
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
