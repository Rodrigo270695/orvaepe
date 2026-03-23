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
    rows: EntitlementSecretRow[];
    emptyMessage: string;
};

function truncateId(s: string | null, len = 14): string {
    if (!s) {
        return '—';
    }
    return s.length <= len ? s : `${s.slice(0, len)}…`;
}

export default function AccesoCredencialesMobileCards({
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
            {rows.map((row, idx) => {
                const entStatus = row.entitlement?.status ?? '';
                return (
                    <div
                        key={row.id}
                        className={[
                            'px-3 py-3',
                            idx > 0 ? 'border-t border-border/75' : '',
                            idx % 2 === 1 ? 'bg-black/3' : '',
                        ].join(' ')}
                    >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <span
                                className={[
                                    'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                    secretKindBadgeClass(row.kind),
                                ].join(' ')}
                            >
                                {secretKindLabel(row.kind)}
                            </span>
                            <span
                                className={[
                                    'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                    entitlementStatusBadgeClass(entStatus),
                                ].join(' ')}
                            >
                                {entitlementStatusLabel(entStatus)}
                            </span>
                        </div>

                        <div className="mt-2 min-w-0 space-y-1">
                            <p className="line-clamp-2 text-sm font-medium text-foreground">
                                {row.label ?? '—'}
                            </p>
                            <p className="truncate font-mono text-[10px] text-muted-foreground">
                                {row.public_ref ?? '—'}
                            </p>
                            <p className="text-xs leading-snug">
                                {formatClientFullName(
                                    row.entitlement?.user ?? null,
                                )}
                            </p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                                {row.entitlement?.catalog_product?.name ?? '—'}
                            </p>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <p className="text-muted-foreground">Caduca</p>
                                <p className="text-foreground">
                                    {formatDateTime(row.expires_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Revocado</p>
                                <p className="text-foreground">
                                    {formatDateTime(row.revoked_at)}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-muted-foreground">
                                    Entitlement
                                </p>
                                <p className="font-mono text-[10px] text-[#4A80B8]">
                                    {truncateId(row.entitlement?.id ?? null)}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
