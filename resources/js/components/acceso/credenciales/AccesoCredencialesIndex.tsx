import { router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from 'lucide-react';
import * as React from 'react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import AccesoCredencialesFilters from '@/components/acceso/credenciales/AccesoCredencialesFilters';
import AccesoCredencialesMobileCards from '@/components/acceso/credenciales/AccesoCredencialesMobileCards';
import AccesoCredencialesToolbar from '@/components/acceso/credenciales/AccesoCredencialesToolbar';
import CredentialSecretViewModal from '@/components/acceso/credenciales/CredentialSecretViewModal';
import type { EntitlementSecretDetail } from '@/components/acceso/credenciales/secretDetailTypes';
import {
    formatDateTime,
    secretKindBadgeClass,
    secretKindLabel,
} from '@/components/acceso/credenciales/secretDisplay';
import type { EntitlementSecretRow } from '@/components/acceso/credenciales/secretTypes';
import {
    entitlementStatusBadgeClass,
    entitlementStatusLabel,
    formatClientFullName,
} from '@/components/acceso/entitlements/entitlementDisplay';

type Props = {
    entitlementSecrets: any;
    initialQuery: string;
    initialKind: string;
    initialEntitlementStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

function truncateId(s: string | null, len = 12): string {
    if (!s) {
        return '—';
    }
    return s.length <= len ? s : `${s.slice(0, len)}…`;
}

export default function AccesoCredencialesIndex({
    entitlementSecrets,
    initialQuery,
    initialKind,
    initialEntitlementStatus,
    initialDateFrom,
    initialDateTo,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const [detailOpen, setDetailOpen] = React.useState(false);
    const [detail, setDetail] = React.useState<EntitlementSecretDetail | null>(null);
    const [detailLoading, setDetailLoading] = React.useState(false);
    const [detailError, setDetailError] = React.useState<string | null>(null);

    const openDetail = React.useCallback(async (id: string) => {
        setDetailOpen(true);
        setDetail(null);
        setDetailError(null);
        setDetailLoading(true);
        try {
            const res = await fetch(`/panel/acceso-credenciales/${id}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            if (!res.ok) {
                throw new Error('fetch');
            }
            const json = (await res.json()) as { secret: EntitlementSecretDetail };
            setDetail(json.secret);
        } catch {
            setDetailError('No se pudo cargar el detalle de la credencial.');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const handleDetailOpenChange = (open: boolean) => {
        setDetailOpen(open);
        if (!open) {
            setDetail(null);
            setDetailError(null);
        }
    };

    const rows: EntitlementSecretRow[] = (entitlementSecrets?.data ??
        []) as EntitlementSecretRow[];
    const total = entitlementSecrets?.total ?? rows.length;
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

    const columns: AdminCrudTableColumn<EntitlementSecretRow>[] = [
        {
            header: sortableHeader('Tipo', 'kind'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        secretKindBadgeClass(r.kind),
                    ].join(' ')}
                >
                    {secretKindLabel(r.kind)}
                </span>
            ),
        },
        {
            header: sortableHeader('Etiqueta / ref.', 'label'),
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[14rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="line-clamp-1 font-medium">
                        {r.label ?? '—'}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                        {r.public_ref ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Cliente',
            cellClassName: 'px-3 py-2 align-middle max-w-[12rem]',
            render: (r) => (
                <span className="text-sm leading-snug">
                    {formatClientFullName(r.entitlement?.user ?? null)}
                </span>
            ),
        },
        {
            header: 'Producto',
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[10rem]',
            render: (r) =>
                r.entitlement?.catalog_product?.name ?? '—',
        },
        {
            header: 'Estado entitlement',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => {
                const s = r.entitlement?.status ?? '';
                return (
                    <span
                        className={[
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            entitlementStatusBadgeClass(s),
                        ].join(' ')}
                    >
                        {entitlementStatusLabel(s)}
                    </span>
                );
            },
        },
        {
            header: sortableHeader('Caduca', 'expires_at'),
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.expires_at),
        },
        {
            header: sortableHeader('Revocado', 'revoked_at'),
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.revoked_at),
        },
        {
            header: 'Entitlement',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-[#4A80B8]',
            render: (r) => truncateId(r.entitlement?.id ?? null, 14),
        },
    ];

    return (
        <>
        <AdminCrudIndex<EntitlementSecretRow>
            rows={rows}
            paginator={entitlementSecrets ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay credenciales registradas. Cuando existan filas en entitlement_secrets, aparecerán aquí."
            renderToolbar={() => (
                <AccesoCredencialesToolbar
                    totalSecrets={total}
                    rowsCount={rows.length}
                />
            )}
            renderAboveTable={() => (
                <AccesoCredencialesFilters
                    initialQuery={initialQuery}
                    initialKind={initialKind}
                    initialEntitlementStatus={initialEntitlementStatus}
                    initialDateFrom={initialDateFrom}
                    initialDateTo={initialDateTo}
                />
            )}
            renderRowActions={({ row }) => (
                <button
                    type="button"
                    className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                    aria-label="Ver detalle completo"
                    onClick={(e) => {
                        e.stopPropagation();
                        void openDetail(row.id);
                    }}
                >
                    <Eye className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                </button>
            )}
            renderMobileRows={({ rows: mobileRows }) => (
                <AccesoCredencialesMobileCards
                    rows={mobileRows}
                    emptyMessage="No hay credenciales registradas. Cuando existan filas en entitlement_secrets, aparecerán aquí."
                    onViewDetail={(row) => void openDetail(row.id)}
                />
            )}
        />

        <CredentialSecretViewModal
            open={detailOpen}
            onOpenChange={handleDetailOpenChange}
            detail={detail}
            loading={detailLoading}
            errorMessage={detailError}
        />
        </>
    );
}
