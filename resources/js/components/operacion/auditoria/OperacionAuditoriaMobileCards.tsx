import {
    formatClientFullName,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';
import {
    previewJsonValues,
    previewText,
} from '@/components/operacion/auditoria/auditLogDisplay';
import type { AuditLogRow } from '@/components/operacion/auditoria/auditLogTypes';

type Props = {
    rows: AuditLogRow[];
    emptyMessage: string;
};

export default function OperacionAuditoriaMobileCards({
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
                                {row.action}
                            </p>
                            <p className="font-mono text-[10px] text-[#4A80B8]">
                                {row.entity_type} ·{' '}
                                {previewText(row.entity_id, 20, 8)}
                            </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatDateTime(row.created_at)}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Usuario</p>
                            <p className="font-medium text-foreground">
                                {row.user
                                    ? formatClientFullName(row.user)
                                    : 'Sistema'}
                            </p>
                            {row.user?.email ? (
                                <p className="truncate font-mono text-[10px] text-muted-foreground">
                                    {row.user.email}
                                </p>
                            ) : null}
                        </div>
                        <div>
                            <p className="text-muted-foreground">IP</p>
                            <p className="font-mono text-[11px] text-foreground">
                                {row.ip_address ?? '—'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Antes</p>
                            <p className="break-all font-mono text-[10px] text-muted-foreground">
                                {previewJsonValues(row.old_values)}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Después</p>
                            <p className="break-all font-mono text-[10px] text-muted-foreground">
                                {previewJsonValues(row.new_values)}
                            </p>
                        </div>
                        {row.user_agent ? (
                            <div className="col-span-2">
                                <p className="text-muted-foreground">User-Agent</p>
                                <p className="wrap-break-word font-mono text-[10px] text-foreground">
                                    {previewText(row.user_agent, 80, 20)}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}
