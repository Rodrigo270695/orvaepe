import { Link, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, KeyRound } from 'lucide-react';
import * as React from 'react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import EntitlementSecretModal from '@/components/acceso/credenciales/EntitlementSecretModal';
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
import { credencialesListHrefForEntitlement } from '@/components/acceso/entitlements/credencialesHrefFromEntitlement';
import type { EntitlementRow } from '@/components/acceso/entitlements/entitlementTypes';

type KindOption = { value: string; label: string };

type Props = {
    entitlements: any;
    initialQuery: string;
    initialStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
    kindOptions: KindOption[];
    credentialStoreUrl: string;
};

export default function AccesoEntitlementsIndex({
    entitlements,
    initialQuery,
    initialStatus,
    initialDateFrom,
    initialDateTo,
    initialSortBy,
    initialSortDir,
    kindOptions,
    credentialStoreUrl,
}: Props) {
    const page = usePage();
    const [credentialOpen, setCredentialOpen] = React.useState(false);
    const [credentialRow, setCredentialRow] = React.useState<EntitlementRow | null>(
        null,
    );

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

    const openCredentialFor = (row: EntitlementRow) => {
        setCredentialRow(row);
        setCredentialOpen(true);
    };

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
            cellClassName: 'px-3 py-2 align-middle text-sm',
            render: (r) => {
                const n = r.secrets_count ?? 0;
                if (n <= 0) {
                    return (
                        <span className="text-xs tabular-nums text-muted-foreground">
                            Sin registros
                        </span>
                    );
                }
                return (
                    <Link
                        href={credencialesListHrefForEntitlement(
                            r,
                            initialDateFrom,
                            initialDateTo,
                        )}
                        className="inline-flex items-center rounded-full bg-[#4A80B8]/14 px-2.5 py-1 text-xs font-semibold text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/24 hover:text-[#3d6fa0]"
                    >
                        {n} {n === 1 ? 'registro' : 'registros'}
                    </Link>
                );
            },
        },
        {
            header: sortableHeader('Alta', 'created_at'),
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.created_at),
        },
    ];

    return (
        <>
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
                renderRowActions={({ row }) => (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Registrar credencial"
                            className="group cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D28C3C]/30"
                            onClick={() => openCredentialFor(row)}
                        >
                            <KeyRound className="size-4 text-[#D28C3C]/60 transition-colors group-hover:text-[#D28C3C]" />
                        </button>
                    </div>
                )}
                renderMobileRows={({ rows: mobileRows }) => (
                    <AccesoEntitlementsMobileCards
                        rows={mobileRows}
                        emptyMessage="No hay entitlements registrados. Cuando existan filas en la tabla entitlements, aparecerán aquí."
                        onCredentialClick={openCredentialFor}
                        dateFrom={initialDateFrom}
                        dateTo={initialDateTo}
                    />
                )}
            />

            <EntitlementSecretModal
                open={credentialOpen}
                onOpenChange={(next) => {
                    setCredentialOpen(next);
                    if (!next) {
                        setCredentialRow(null);
                    }
                }}
                kindOptions={kindOptions}
                storeUrl={credentialStoreUrl}
                fixedEntitlement={credentialRow}
            />
        </>
    );
}
