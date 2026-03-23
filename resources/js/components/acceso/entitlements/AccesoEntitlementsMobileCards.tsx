import {
    entitlementStatusBadgeClass,
    entitlementStatusLabel,
    formatClientFullName,
    formatDateShort,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';
import type { EntitlementRow } from '@/components/acceso/entitlements/entitlementTypes';

type Props = {
    rows: EntitlementRow[];
    emptyMessage: string;
};

export default function AccesoEntitlementsMobileCards({
    rows,
    emptyMessage,
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
                        <div className="min-w-0 space-y-1">
                            <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                                {row.catalog_product?.name ?? '—'}
                            </p>
                            <p className="text-xs font-medium leading-snug">
                                {formatClientFullName(row.user ?? null)}
                            </p>
                            <p className="truncate text-[10px] font-mono text-muted-foreground">
                                {row.user?.email ?? '—'}
                            </p>
                        </div>

                        <span
                            className={[
                                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                entitlementStatusBadgeClass(row.status),
                            ].join(' ')}
                        >
                            {entitlementStatusLabel(row.status)}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2">
                            <p className="text-muted-foreground">SKU</p>
                            <p className="font-mono text-[11px] text-foreground">
                                {row.catalog_sku
                                    ? `${row.catalog_sku.code} · ${row.catalog_sku.name}`
                                    : '—'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Vigencia</p>
                            <p className="text-foreground">
                                {formatDateShort(row.starts_at)}
                                {' — '}
                                {formatDateShort(row.ends_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Secretos</p>
                            <p className="font-mono tabular-nums text-foreground">
                                {String(row.secrets_count ?? 0)}
                            </p>
                        </div>
                        <div>
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
