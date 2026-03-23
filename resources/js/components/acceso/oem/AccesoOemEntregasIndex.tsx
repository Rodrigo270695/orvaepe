import * as React from 'react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import AccesoOemEntregasFilters from '@/components/acceso/oem/AccesoOemEntregasFilters';
import AccesoOemEntregasMobileCards from '@/components/acceso/oem/AccesoOemEntregasMobileCards';
import AccesoOemEntregasToolbar from '@/components/acceso/oem/AccesoOemEntregasToolbar';
import {
    oemDeliveryStatusBadgeClass,
    oemDeliveryStatusLabel,
    previewPayloadText,
} from '@/components/acceso/oem/oemDeliveryDisplay';
import type { OemLicenseDeliveryRow } from '@/components/acceso/oem/oemDeliveryTypes';
import {
    formatClientFullName,
    formatDateShort,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';
import { formatLicenseKeyPreview } from '@/components/acceso/licencias/licenseKeyDisplay';

type Props = {
    oemLicenseDeliveries: any;
    initialQuery: string;
    initialStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
};

export default function AccesoOemEntregasIndex({
    oemLicenseDeliveries,
    initialQuery,
    initialStatus,
    initialDateFrom,
    initialDateTo,
}: Props) {
    const rows: OemLicenseDeliveryRow[] = (oemLicenseDeliveries?.data ??
        []) as OemLicenseDeliveryRow[];
    const total = oemLicenseDeliveries?.total ?? rows.length;

    const statusOnPage = React.useMemo(
        () => ({
            pending: rows.filter((r) => r.status === 'pending').length,
            delivered: rows.filter((r) => r.status === 'delivered').length,
            revoked: rows.filter((r) => r.status === 'revoked').length,
        }),
        [rows],
    );

    const columns: AdminCrudTableColumn<OemLicenseDeliveryRow>[] = [
        {
            header: 'Estado',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        oemDeliveryStatusBadgeClass(r.status),
                    ].join(' ')}
                >
                    {oemDeliveryStatusLabel(r.status)}
                </span>
            ),
        },
        {
            header: 'Proveedor',
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[10rem]',
            render: (r) => (
                <span className="line-clamp-2 font-medium">{r.vendor}</span>
            ),
        },
        {
            header: 'Pedido',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[11px] text-muted-foreground',
            render: (r) => r.order_line?.order?.order_number ?? '—',
        },
        {
            header: 'Cliente',
            cellClassName: 'px-3 py-2 align-middle max-w-[11rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {formatClientFullName(
                            r.order_line?.order?.user ?? null,
                        )}
                    </span>
                    <span className="truncate font-mono text-[10px] text-muted-foreground">
                        {r.order_line?.order?.user?.email ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Producto / SKU',
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[12rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="line-clamp-2 font-medium">
                        {r.order_line?.product_name_snapshot ?? '—'}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                        {r.order_line?.sku_name_snapshot ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Clave',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-[#4A80B8] max-w-[9rem]',
            render: (r) => {
                const k = r.license_code ?? '';
                return (
                    <span className="break-all" title={k || undefined}>
                        {k
                            ? formatLicenseKeyPreview(k, 10, 4)
                            : '—'}
                    </span>
                );
            },
        },
        {
            header: 'Payload',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-muted-foreground max-w-[10rem]',
            render: (r) => (
                <span
                    className="break-all"
                    title={
                        r.activation_payload?.trim()
                            ? r.activation_payload
                            : undefined
                    }
                >
                    {previewPayloadText(r.activation_payload)}
                </span>
            ),
        },
        {
            header: 'Entrega',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.delivered_at),
        },
        {
            header: 'Caduca',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateShort(r.expires_at),
        },
        {
            header: 'Alta',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.created_at),
        },
    ];

    return (
        <AdminCrudIndex<OemLicenseDeliveryRow>
            rows={rows}
            paginator={oemLicenseDeliveries ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay entregas OEM registradas. Cuando existan filas en oem_license_deliveries, aparecerán aquí."
            renderToolbar={() => (
                <AccesoOemEntregasToolbar
                    totalDeliveries={total}
                    rowsCount={rows.length}
                    pendingOnPage={statusOnPage.pending}
                    deliveredOnPage={statusOnPage.delivered}
                    revokedOnPage={statusOnPage.revoked}
                />
            )}
            renderAboveTable={() => (
                <AccesoOemEntregasFilters
                    initialQuery={initialQuery}
                    initialStatus={initialStatus}
                    initialDateFrom={initialDateFrom}
                    initialDateTo={initialDateTo}
                />
            )}
            renderMobileRows={({ rows: mobileRows }) => (
                <AccesoOemEntregasMobileCards
                    rows={mobileRows}
                    emptyMessage="No hay entregas OEM registradas. Cuando existan filas en oem_license_deliveries, aparecerán aquí."
                />
            )}
        />
    );
}
