import {
    formatClientFullName,
    formatDateShort,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';
import type { NotificationRow } from '@/components/acceso/notifications/notificationRowTypes';
import { cn } from '@/lib/utils';

type Props = {
    rows: NotificationRow[];
    emptyMessage: string;
    effectiveReadAt: (r: NotificationRow) => string | null;
    onRowClick: (r: NotificationRow) => void;
    rowClassName: (r: NotificationRow) => string | undefined;
    markingId: string | null;
    /** Solo filas sin leer que el usuario puede marcar como leídas (accesibilidad). */
    isRowUnreadMarkable: (r: NotificationRow) => boolean;
};

function statusBadgeClass(status: string): string {
    const base =
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium';
    const cls =
        status === 'sent'
            ? 'bg-[color-mix(in_oklab,var(--state-success)_10%,transparent)] text-[color-mix(in_oklab,var(--state-success)_80%,var(--foreground))]'
            : status === 'failed'
              ? 'bg-[color-mix(in_oklab,var(--state-danger)_10%,transparent)] text-[color-mix(in_oklab,var(--state-danger)_80%,var(--foreground))]'
              : 'bg-[color-mix(in_oklab,var(--state-alert)_10%,transparent)] text-[color-mix(in_oklab,var(--state-alert)_80%,var(--foreground))]';
    return `${base} ${cls}`;
}

export default function AccesoNotificationsMobileCards({
    rows,
    emptyMessage,
    effectiveReadAt,
    onRowClick,
    rowClassName,
    markingId,
    isRowUnreadMarkable,
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
            {rows.map((r, idx) => {
                const interactive = isRowUnreadMarkable(r);
                return (
                <div
                    key={r.id}
                    role={interactive ? 'button' : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    className={cn(
                        'px-3 py-3 outline-none transition-colors',
                        idx > 0 ? 'border-t border-border/75' : '',
                        rowClassName(r),
                        markingId === r.id && 'pointer-events-none opacity-70',
                    )}
                    onClick={() => onRowClick(r)}
                    onKeyDown={(e) => {
                        if (!interactive) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(r);
                        }
                    }}
                >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-medium leading-snug">
                                {formatClientFullName(r.user ?? null)}
                            </p>
                            <p className="truncate text-[10px] font-mono text-muted-foreground">
                                {r.user?.email ?? '—'}
                            </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                            <span className="inline-flex items-center rounded-full bg-[color-mix(in_oklab,var(--state-info)_8%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--state-info)_80%,var(--foreground))]">
                                {r.channel}
                            </span>
                            <span className={statusBadgeClass(r.status)}>
                                {r.status}
                            </span>
                        </div>
                    </div>

                    <div className="mt-2 space-y-1">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                            {r.subject ?? '(Sin asunto)'}
                        </p>
                        {r.message ? (
                            <p className="line-clamp-2 text-[11px] text-muted-foreground">
                                {r.message}
                            </p>
                        ) : null}
                    </div>

                    {r.error ? (
                        <p className="mt-2 line-clamp-3 text-[11px] text-muted-foreground">
                            {r.error}
                        </p>
                    ) : null}

                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div>
                            <p className="text-muted-foreground">Leída</p>
                            <p className="text-muted-foreground">
                                {effectiveReadAt(r)
                                    ? formatDateShort(effectiveReadAt(r)!)
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Enviada</p>
                            <p className="text-muted-foreground">
                                {r.sent_at
                                    ? formatDateTime(r.sent_at)
                                    : '—'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Creada</p>
                            <p className="text-muted-foreground">
                                {formatDateTime(r.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            );
            })}
        </div>
    );
}
