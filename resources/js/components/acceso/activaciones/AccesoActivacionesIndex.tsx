import { router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import * as React from 'react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import AccesoActivacionesMobileCards from '@/components/acceso/activaciones/AccesoActivacionesMobileCards';
import {
    activationActiveBadgeClass,
    activationActiveLabel,
} from '@/components/acceso/activaciones/activationDisplay';
import type { LicenseActivationRow } from '@/components/acceso/activaciones/activationTypes';
import AccesoActivacionesFilters from '@/components/acceso/activaciones/AccesoActivacionesFilters';
import AccesoActivacionesToolbar from '@/components/acceso/activaciones/AccesoActivacionesToolbar';
import { formatLicenseKeyPreview } from '@/components/acceso/licencias/licenseKeyDisplay';
import {
    formatClientFullName,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';

function truncateFingerprint(s: string | null, len = 14): string {
    if (!s) {
        return '—';
    }
    return s.length <= len ? s : `${s.slice(0, len)}…`;
}

type Props = {
    licenseActivations: any;
    initialQuery: string;
    initialActive: string;
    initialDateFrom: string;
    initialDateTo: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

export default function AccesoActivacionesIndex({
    licenseActivations,
    initialQuery,
    initialActive,
    initialDateFrom,
    initialDateTo,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const rows: LicenseActivationRow[] = (licenseActivations?.data ??
        []) as LicenseActivationRow[];
    const total = licenseActivations?.total ?? rows.length;
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

    const statusOnPage = React.useMemo(
        () => ({
            active: rows.filter((r) => r.is_active).length,
            inactive: rows.filter((r) => !r.is_active).length,
        }),
        [rows],
    );

    const columns: AdminCrudTableColumn<LicenseActivationRow>[] = [
        {
            header: sortableHeader('Estado', 'is_active'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        activationActiveBadgeClass(r.is_active),
                    ].join(' ')}
                >
                    {activationActiveLabel(r.is_active)}
                </span>
            ),
        },
        {
            header: sortableHeader('Dominio', 'domain'),
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[12rem]',
            render: (r) => (
                <span className="line-clamp-2 font-medium">{r.domain}</span>
            ),
        },
        {
            header: sortableHeader('IP', 'ip_address'),
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[11px] text-muted-foreground',
            render: (r) => r.ip_address,
        },
        {
            header: 'Fingerprint',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-muted-foreground max-w-[9rem]',
            render: (r) => truncateFingerprint(r.server_fingerprint),
        },
        {
            header: 'Cliente',
            cellClassName: 'px-3 py-2 align-middle max-w-[11rem]',
            render: (r) => (
                <span className="text-sm leading-snug">
                    {formatClientFullName(r.license_key?.user ?? null)}
                </span>
            ),
        },
        {
            header: 'Clave',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-[#4A80B8] max-w-[10rem]',
            render: (r) => {
                const k = r.license_key?.key ?? '';
                return (
                    <span className="break-all" title={k || undefined}>
                        {k ? formatLicenseKeyPreview(k, 8, 4) : '—'}
                    </span>
                );
            },
        },
        {
            header: sortableHeader('Último ping', 'last_ping_at'),
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.last_ping_at),
        },
        {
            header: sortableHeader('Alta', 'created_at'),
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.created_at),
        },
    ];

    return (
        <AdminCrudIndex<LicenseActivationRow>
            rows={rows}
            paginator={licenseActivations ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay activaciones registradas. Cuando el software reporte uso de licencias, aparecerán aquí."
            renderToolbar={() => (
                <AccesoActivacionesToolbar
                    totalActivations={total}
                    rowsCount={rows.length}
                    activeOnPage={statusOnPage.active}
                    inactiveOnPage={statusOnPage.inactive}
                />
            )}
            renderAboveTable={() => (
                <AccesoActivacionesFilters
                    initialQuery={initialQuery}
                    initialActive={initialActive}
                    initialDateFrom={initialDateFrom}
                    initialDateTo={initialDateTo}
                />
            )}
            renderMobileRows={({ rows: mobileRows }) => (
                <AccesoActivacionesMobileCards
                    rows={mobileRows}
                    emptyMessage="No hay activaciones registradas. Cuando el software reporte uso de licencias, aparecerán aquí."
                />
            )}
        />
    );
}
