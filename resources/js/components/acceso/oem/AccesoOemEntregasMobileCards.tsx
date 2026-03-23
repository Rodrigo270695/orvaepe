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
    rows: OemLicenseDeliveryRow[];
    emptyMessage: string;
};

export default function AccesoOemEntregasMobileCards({
    rows,
    emptyMessage,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="neumorph-inset rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground">
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
                            <p className="text-sm font-semibold text-foreground">
                                {row.vendor}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                                {row.order_line?.order?.order_number ?? '—'}
                            </p>
                        </div>
                        <span
                            className={[
                                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                oemDeliveryStatusBadgeClass(row.status),
                            ].join(' ')}
                        >
                            {oemDeliveryStatusLabel(row.status)}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Cliente</p>
                            <p className="font-medium text-foreground">
                                {formatClientFullName(
                                    row.order_line?.order?.user ?? null,
                                )}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Producto / SKU</p>
                            <p className="line-clamp-2 font-medium text-foreground">
                                {row.order_line?.product_name_snapshot ?? '—'}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                {row.order_line?.sku_name_snapshot ?? '—'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Clave / payload</p>
                            <p className="break-all font-mono text-[11px] text-[#4A80B8]">
                                {row.license_code
                                    ? formatLicenseKeyPreview(
                                          row.license_code,
                                          14,
                                          4,
                                      )
                                    : previewPayloadText(row.activation_payload)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Entrega</p>
                            <p className="text-foreground">
                                {formatDateTime(row.delivered_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Caduca</p>
                            <p className="text-foreground">
                                {formatDateShort(row.expires_at)}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Alta</p>
                            <p className="text-foreground">
                                {formatDateTime(row.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
