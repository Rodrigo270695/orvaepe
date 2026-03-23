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
import { Pencil, Trash2 } from 'lucide-react';

type Props = {
    rows: LicenseKeyRow[];
    emptyMessage: string;
    onEdit?: (row: LicenseKeyRow) => void;
    onDelete?: (row: LicenseKeyRow) => void;
};

export default function AccesoLicenciasMobileCards({
    rows,
    emptyMessage,
    onEdit,
    onDelete,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground neumorph-inset">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/60 neumorph-inset">
            {rows.map((row, idx) => (
                <div
                    key={row.id}
                    className={[
                        'px-3 py-3',
                        idx > 0 ? 'border-t border-border/75' : '',
                        idx % 2 === 1 ? 'bg-black/3' : '',
                    ].join(' ')}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                            <p
                                className="break-all font-mono text-[11px] font-semibold text-[#4A80B8]"
                                title={row.key}
                            >
                                {formatLicenseKeyPreview(row.key)}
                            </p>
                            <p className="text-xs font-medium leading-snug">
                                {formatClientFullName(row.user ?? null)}
                            </p>
                            <p className="truncate text-[10px] font-mono text-muted-foreground">
                                {row.user?.email ?? '—'}
                            </p>
                        </div>
                        <LicenseKeyStatusBadge status={row.status} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Producto / SKU</p>
                            <p className="line-clamp-2 font-medium text-foreground">
                                {row.catalog_sku?.product?.name ?? '—'}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                {row.catalog_sku
                                    ? `${row.catalog_sku.code} · ${row.catalog_sku.name}`
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Pedido</p>
                            <p className="font-mono text-[11px] text-foreground">
                                {row.order?.order_number ?? '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Activaciones</p>
                            <p className="tabular-nums text-foreground">
                                {licenseActivationsUsed(row)}
                                <span className="text-muted-foreground">
                                    {' / '}
                                    {row.max_activations ?? 1}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Caduca</p>
                            <p className="text-foreground">
                                {formatDateShort(row.expires_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Alta</p>
                            <p className="text-foreground">
                                {formatDateTime(row.created_at)}
                            </p>
                        </div>
                    </div>

                    {onEdit || onDelete ? (
                        <div className="mt-3 flex items-center justify-end gap-2">
                            {onEdit && canEditLicense(row) ? (
                                <button
                                    type="button"
                                    className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                                    aria-label="Editar vigencia"
                                    onClick={() => onEdit(row)}
                                >
                                    <Pencil className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                                </button>
                            ) : null}
                            {onDelete && canDeleteLicense(row) ? (
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
                    ) : null}
                </div>
            ))}
        </div>
    );
}
