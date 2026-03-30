import { Link } from '@inertiajs/react';

import { credencialesListHrefForEntitlement } from '@/components/acceso/entitlements/credencialesHrefFromEntitlement';
import {
    entitlementStatusBadgeClass,
    entitlementStatusLabel,
    formatClientFullName,
    formatDateShort,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';
import type { EntitlementRow } from '@/components/acceso/entitlements/entitlementTypes';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

type Props = {
    rows: EntitlementRow[];
    emptyMessage: string;
    onCredentialClick: (row: EntitlementRow) => void;
    dateFrom: string;
    dateTo: string;
};

export default function AccesoEntitlementsMobileCards({
    rows,
    emptyMessage,
    onCredentialClick,
    dateFrom,
    dateTo,
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
                            {(row.secrets_count ?? 0) > 0 ? (
                                <Link
                                    href={credencialesListHrefForEntitlement(
                                        row,
                                        dateFrom,
                                        dateTo,
                                    )}
                                    className="inline-flex w-full max-w-full items-center justify-center rounded-full bg-[#4A80B8]/14 px-2 py-1 text-center text-[11px] font-semibold text-[#4A80B8] hover:bg-[#4A80B8]/24"
                                >
                                    {row.secrets_count ?? 0}{' '}
                                    {(row.secrets_count ?? 0) === 1
                                        ? 'registro'
                                        : 'registros'}
                                </Link>
                            ) : (
                                <p className="text-[11px] text-muted-foreground">
                                    Sin registros
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-muted-foreground">Alta</p>
                            <p className="text-foreground">
                                {formatDateTime(row.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3">
                        <NeuButtonRaised
                            type="button"
                            className="w-full cursor-pointer gap-1.5 justify-center px-3 py-2 text-[12px] font-semibold sm:w-auto"
                            onClick={() => onCredentialClick(row)}
                        >
                            Registrar credencial
                        </NeuButtonRaised>
                    </div>
                </div>
            ))}
        </div>
    );
}
