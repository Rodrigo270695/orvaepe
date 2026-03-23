import {
    activationActiveBadgeClass,
    activationActiveLabel,
} from '@/components/acceso/activaciones/activationDisplay';
import type { LicenseActivationRow } from '@/components/acceso/activaciones/activationTypes';
import { formatLicenseKeyPreview } from '@/components/acceso/licencias/licenseKeyDisplay';
import {
    formatClientFullName,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';

type Props = {
    rows: LicenseActivationRow[];
    emptyMessage: string;
};

function truncateFingerprint(s: string | null, len = 18): string {
    if (!s) {
        return '—';
    }
    return s.length <= len ? s : `${s.slice(0, len)}…`;
}

export default function AccesoActivacionesMobileCards({
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
                            <p className="wrap-break-word text-sm font-semibold text-foreground">
                                {row.domain}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                                {row.ip_address}
                            </p>
                        </div>
                        <span
                            className={[
                                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                activationActiveBadgeClass(row.is_active),
                            ].join(' ')}
                        >
                            {activationActiveLabel(row.is_active)}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Cliente</p>
                            <p className="font-medium text-foreground">
                                {formatClientFullName(
                                    row.license_key?.user ?? null,
                                )}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Clave</p>
                            <p className="break-all font-mono text-[11px] text-[#4A80B8]">
                                {row.license_key?.key
                                    ? formatLicenseKeyPreview(
                                          row.license_key.key,
                                          12,
                                          4,
                                      )
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Fingerprint</p>
                            <p className="font-mono text-[10px] text-foreground">
                                {truncateFingerprint(row.server_fingerprint)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Último ping</p>
                            <p className="text-foreground">
                                {formatDateTime(row.last_ping_at)}
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
