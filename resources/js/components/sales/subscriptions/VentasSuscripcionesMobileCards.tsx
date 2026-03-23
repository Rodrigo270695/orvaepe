import { Link } from '@inertiajs/react';
import { Ban, Pencil } from 'lucide-react';

import {
    formatClientFullName,
    formatSubscriptionPeriod,
    subscriptionItemsSummary,
    subscriptionStatusBadgeClass,
    subscriptionStatusLabel,
} from '@/components/sales/subscriptions/subscriptionDisplay';
import type { SubscriptionRow } from '@/components/sales/subscriptions/subscriptionTypes';
import panel from '@/routes/panel';

type Props = {
    rows: SubscriptionRow[];
    onCancelRequest?: (row: SubscriptionRow) => void;
};

function formatDateTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function truncateId(s: string | null, len = 14): string {
    if (!s) {
        return '—';
    }
    return s.length <= len ? s : `${s.slice(0, len)}…`;
}

export default function VentasSuscripcionesMobileCards({
    rows,
    onCancelRequest,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground neumorph-inset">
                No hay suscripciones todavía. Cuando integres el cobro
                recurrente o cargues datos, aparecerán aquí.
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
                            <p className="truncate font-mono text-[11px] text-[#4A80B8]">
                                {truncateId(row.gateway_subscription_id, 24)}
                            </p>
                            <p className="text-xs font-medium leading-snug text-foreground">
                                {formatClientFullName(row.user)}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                                {row.user?.email ?? '—'}
                            </p>
                        </div>

                        <span
                            className={[
                                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                subscriptionStatusBadgeClass(row.status),
                            ].join(' ')}
                        >
                            {subscriptionStatusLabel(row.status)}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <p className="text-muted-foreground">Ítems</p>
                            <p className="font-medium">
                                {subscriptionItemsSummary(row)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Período</p>
                            <p className="font-medium">
                                {formatSubscriptionPeriod(
                                    row.current_period_start,
                                    row.current_period_end,
                                )}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Alta</p>
                            <p className="text-muted-foreground">
                                {formatDateTime(row.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/50 pt-3">
                        <Link
                            href={panel.ventasSuscripciones.edit.url(row.id)}
                            prefetch
                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[#4A80B8]/40 bg-[#4A80B8]/10 px-3 text-xs font-medium text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/18"
                        >
                            <Pencil className="size-3.5" />
                            Editar
                        </Link>
                        <button
                            type="button"
                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[#C05050]/40 bg-[#C05050]/10 px-3 text-xs font-medium text-[#C05050] transition-colors hover:bg-[#C05050]/16 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#C05050]/10"
                            disabled={row.status === 'cancelled'}
                            onClick={() => onCancelRequest?.(row)}
                        >
                            <Ban className="size-3.5" />
                            Cancelar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
