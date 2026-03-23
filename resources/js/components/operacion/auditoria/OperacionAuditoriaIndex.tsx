import * as React from 'react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import {
    formatClientFullName,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';
import OperacionAuditoriaFilters from '@/components/operacion/auditoria/OperacionAuditoriaFilters';
import OperacionAuditoriaMobileCards from '@/components/operacion/auditoria/OperacionAuditoriaMobileCards';
import OperacionAuditoriaToolbar from '@/components/operacion/auditoria/OperacionAuditoriaToolbar';
import {
    previewJsonValues,
    previewText,
} from '@/components/operacion/auditoria/auditLogDisplay';
import type { AuditLogRow } from '@/components/operacion/auditoria/auditLogTypes';

type Props = {
    auditLogs: any;
    initialQuery: string;
    initialUserScope: string;
    initialDateFrom: string;
    initialDateTo: string;
};

export default function OperacionAuditoriaIndex({
    auditLogs,
    initialQuery,
    initialUserScope,
    initialDateFrom,
    initialDateTo,
}: Props) {
    const rows: AuditLogRow[] = (auditLogs?.data ?? []) as AuditLogRow[];
    const total = auditLogs?.total ?? rows.length;

    const countsOnPage = React.useMemo(
        () => ({
            withUser: rows.filter((r) => r.user_id != null).length,
            system: rows.filter((r) => r.user_id == null).length,
        }),
        [rows],
    );

    const columns: AdminCrudTableColumn<AuditLogRow>[] = [
        {
            header: 'Fecha',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground whitespace-nowrap',
            render: (r) => formatDateTime(r.created_at),
        },
        {
            header: 'Acción',
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[10rem]',
            render: (r) => (
                <span className="line-clamp-2 font-medium">{r.action}</span>
            ),
        },
        {
            header: 'Entidad',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[11px] text-[#4A80B8] max-w-[10rem]',
            render: (r) => (
                <span className="line-clamp-2" title={r.entity_type}>
                    {r.entity_type}
                </span>
            ),
        },
        {
            header: 'ID entidad',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-muted-foreground max-w-[9rem]',
            render: (r) => (
                <span className="break-all" title={r.entity_id}>
                    {previewText(r.entity_id, 14, 8)}
                </span>
            ),
        },
        {
            header: 'Usuario',
            cellClassName: 'px-3 py-2 align-middle max-w-[11rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {r.user
                            ? formatClientFullName(r.user)
                            : 'Sistema'}
                    </span>
                    {r.user?.email ? (
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                            {r.user.email}
                        </span>
                    ) : null}
                </div>
            ),
        },
        {
            header: 'IP',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[11px] text-muted-foreground',
            render: (r) => r.ip_address ?? '—',
        },
        {
            header: 'Antes',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-muted-foreground max-w-[12rem]',
            render: (r) => (
                <span
                    className="line-clamp-2 break-all"
                    title={previewJsonValues(r.old_values)}
                >
                    {previewJsonValues(r.old_values)}
                </span>
            ),
        },
        {
            header: 'Después',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-muted-foreground max-w-[12rem]',
            render: (r) => (
                <span
                    className="line-clamp-2 break-all"
                    title={previewJsonValues(r.new_values)}
                >
                    {previewJsonValues(r.new_values)}
                </span>
            ),
        },
        {
            header: 'User-Agent',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-muted-foreground max-w-[14rem]',
            render: (r) => (
                <span
                    className="line-clamp-2 break-all"
                    title={r.user_agent ?? undefined}
                >
                    {r.user_agent ? previewText(r.user_agent, 56, 16) : '—'}
                </span>
            ),
        },
    ];

    return (
        <AdminCrudIndex<AuditLogRow>
            rows={rows}
            paginator={auditLogs ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay registros de auditoría. Cuando la aplicación persista eventos en audit_logs, aparecerán aquí."
            renderToolbar={() => (
                <OperacionAuditoriaToolbar
                    totalLogs={total}
                    rowsCount={rows.length}
                    withUserOnPage={countsOnPage.withUser}
                    systemOnPage={countsOnPage.system}
                />
            )}
            renderAboveTable={() => (
                <OperacionAuditoriaFilters
                    initialQuery={initialQuery}
                    initialUserScope={initialUserScope}
                    initialDateFrom={initialDateFrom}
                    initialDateTo={initialDateTo}
                />
            )}
            renderMobileRows={({ rows: mobileRows }) => (
                <OperacionAuditoriaMobileCards
                    rows={mobileRows}
                    emptyMessage="No hay registros de auditoría. Cuando la aplicación persista eventos en audit_logs, aparecerán aquí."
                />
            )}
        />
    );
}
