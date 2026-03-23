import * as React from 'react';

import { usePage } from '@inertiajs/react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import AccesoLicenciaEditFormFields from '@/components/acceso/licencias/AccesoLicenciaEditFormFields';
import AccesoLicenciaFormFields from '@/components/acceso/licencias/AccesoLicenciaFormFields';
import AccesoLicenciasFilters from '@/components/acceso/licencias/AccesoLicenciasFilters';
import AccesoLicenciasMobileCards from '@/components/acceso/licencias/AccesoLicenciasMobileCards';
import AccesoLicenciasToolbar from '@/components/acceso/licencias/AccesoLicenciasToolbar';
import {
    canDeleteLicense,
    canEditLicense,
    licenseActivationsUsed,
} from '@/components/acceso/licencias/licenseKeyAccess';
import LicenseKeyStatusBadge from '@/components/acceso/licencias/LicenseKeyStatusBadge';
import { formatLicenseKeyPreview } from '@/components/acceso/licencias/licenseKeyDisplay';
import type { LicenseKeyRow } from '@/components/acceso/licencias/licenseKeyTypes';
import {
    formatClientFullName,
    formatDateShort,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';
import type { ClienteUserOption } from '@/components/admin/form/admin-cliente-select';
import type { SkuOption } from '@/components/acceso/licencias/AccesoLicenciaFormFields';
import panel from '@/routes/panel';
import { Pencil, Trash2 } from 'lucide-react';

type Props = {
    licenseKeys: any;
    initialQuery: string;
    initialStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuOption[];
};

export default function AccesoLicenciasIndex({
    licenseKeys,
    initialQuery,
    initialStatus,
    initialDateFrom,
    initialDateTo,
    usersForSelect,
    skusForSelect,
}: Props) {
    const page = usePage();
    /** Misma query que la página de listado, para que el POST/PATCH/DELETE lleve filtros en la URL y el redirect no los pierda. */
    const listQuerySuffix = React.useMemo(() => {
        const u = page.url;
        const i = u.indexOf('?');
        return i >= 0 ? u.slice(i) : '';
    }, [page.url]);

    const rows: LicenseKeyRow[] = (licenseKeys?.data ?? []) as LicenseKeyRow[];
    const total = licenseKeys?.total ?? rows.length;

    const statusOnPage = React.useMemo(
        () => ({
            draft: rows.filter((r) => r.status === 'draft').length,
            active: rows.filter((r) => r.status === 'active').length,
            expired: rows.filter((r) => r.status === 'expired').length,
            revoked: rows.filter((r) => r.status === 'revoked').length,
        }),
        [rows],
    );

    const columns: AdminCrudTableColumn<LicenseKeyRow>[] = [
        {
            header: 'Estado',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => <LicenseKeyStatusBadge status={r.status} />,
        },
        {
            header: 'Clave',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[11px] max-w-[14rem]',
            render: (r) => (
                <span className="break-all text-[#4A80B8]" title={r.key}>
                    {formatLicenseKeyPreview(r.key)}
                </span>
            ),
        },
        {
            header: 'Cliente',
            cellClassName: 'px-3 py-2 align-middle max-w-[13rem]',
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
            header: 'SKU / producto',
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[12rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="line-clamp-2 font-medium">
                        {r.catalog_sku?.product?.name ?? '—'}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                        {r.catalog_sku
                            ? `${r.catalog_sku.code} · ${r.catalog_sku.name}`
                            : '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Pedido',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[11px] text-muted-foreground',
            render: (r) => r.order?.order_number ?? '—',
        },
        {
            header: 'Activaciones',
            cellClassName:
                'px-3 py-2 align-middle text-sm tabular-nums text-center',
            render: (r) => (
                <span>
                    {licenseActivationsUsed(r)}
                    <span className="text-muted-foreground">
                        {' / '}
                        {r.max_activations ?? 1}
                    </span>
                </span>
            ),
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
        <>
            <AdminCrudIndex<LicenseKeyRow>
                rows={rows}
                paginator={licenseKeys ?? null}
                rowKey={(r) => r.id}
                columns={columns}
                emptyState="No hay licencias registradas. Cuando existan filas en license_keys, aparecerán aquí."
                renderToolbar={({ onCreate }) => (
                    <AccesoLicenciasToolbar
                        totalKeys={total}
                        rowsCount={rows.length}
                        onCreate={onCreate}
                        statusOnPage={statusOnPage}
                    />
                )}
                renderAboveTable={() => (
                    <AccesoLicenciasFilters
                        initialQuery={initialQuery}
                        initialStatus={initialStatus}
                        initialDateFrom={initialDateFrom}
                        initialDateTo={initialDateTo}
                    />
                )}
                renderRowActions={({ row, onEdit, onDelete }) => (
                    <div className="flex items-center justify-end gap-1">
                        {canEditLicense(row) ? (
                            <button
                                type="button"
                                className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                                aria-label="Editar vigencia"
                                onClick={() => onEdit(row)}
                            >
                                <Pencil className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                            </button>
                        ) : null}
                        {canDeleteLicense(row) ? (
                            <button
                                type="button"
                                className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05050]/30"
                                aria-label="Eliminar licencia"
                                onClick={() => onDelete(row)}
                            >
                                <Trash2 className="size-4 text-[#C05050]/60 transition-colors group-hover:text-[#C05050]" />
                            </button>
                        ) : null}
                    </div>
                )}
                renderMobileRows={({ rows: mobileRows, onEdit, onDelete }) => (
                    <AccesoLicenciasMobileCards
                        rows={mobileRows}
                        emptyMessage="No hay licencias registradas. Cuando existan filas en license_keys, aparecerán aquí."
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )}
                upsert={{
                    titleCreate: 'Nueva licencia manual',
                    titleEdit: 'Editar licencia',
                    createAction: `${panel.accesoLicencias.store.url()}${listQuerySuffix}`,
                    updateAction: (row) =>
                        `${panel.accesoLicencias.update.url(row.id)}${listQuerySuffix}`,
                    submitLabelCreate: 'Crear licencia',
                    submitLabelEdit: 'Guardar cambios',
                    successToastTitle: 'Licencia guardada',
                    renderFormFields: ({ mode, item, errors }) =>
                        mode === 'create' ? (
                            <AccesoLicenciaFormFields
                                usersForSelect={usersForSelect}
                                skusForSelect={skusForSelect}
                                errors={errors}
                            />
                        ) : item ? (
                            <AccesoLicenciaEditFormFields item={item} errors={errors} />
                        ) : null,
                }}
                delete={{
                    title: 'Eliminar licencia',
                    description:
                        'Solo licencias en borrador, sin activaciones. Las activas no se eliminan.',
                    deleteAction: (row) =>
                        `${panel.accesoLicencias.destroy.url(row.id)}${listQuerySuffix}`,
                    entityLabel: (row) => formatLicenseKeyPreview(row.key, 16, 6),
                    confirmLabel: 'Eliminar',
                }}
            />
        </>
    );
}
