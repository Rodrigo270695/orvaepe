import { Link } from '@inertiajs/react';
import { Ban, Pencil } from 'lucide-react';
import * as React from 'react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import {
    formatClientFullName,
    formatSubscriptionPeriod,
    subscriptionItemsSummary,
    subscriptionStatusBadgeClass,
    subscriptionStatusLabel,
} from '@/components/sales/subscriptions/subscriptionDisplay';
import type { SubscriptionRow } from '@/components/sales/subscriptions/subscriptionTypes';
import VentasSuscripcionCancelModal from '@/components/sales/subscriptions/VentasSuscripcionCancelModal';
import VentasSuscripcionesFilters from '@/components/sales/subscriptions/VentasSuscripcionesFilters';
import VentasSuscripcionesMobileCards from '@/components/sales/subscriptions/VentasSuscripcionesMobileCards';
import VentasSuscripcionesToolbar from '@/components/sales/subscriptions/VentasSuscripcionesToolbar';
import panel from '@/routes/panel';

type Props = {
    subscriptions: any;
    initialQuery: string;
    initialStatus: string;
    initialDateFrom: string;
    initialDateTo: string;
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

function truncateGatewayId(s: string | null, len = 18): string {
    if (!s) {
        return '—';
    }
    return s.length <= len ? s : `${s.slice(0, len)}…`;
}

export default function VentasSuscripcionesIndex({
    subscriptions,
    initialQuery,
    initialStatus,
    initialDateFrom,
    initialDateTo,
}: Props) {
    const rows: SubscriptionRow[] = (subscriptions?.data ??
        []) as SubscriptionRow[];
    const totalSubscriptions = subscriptions?.total ?? rows.length;

    const [cancelTarget, setCancelTarget] =
        React.useState<SubscriptionRow | null>(null);

    const columns: AdminCrudTableColumn<SubscriptionRow>[] = [
        {
            header: 'Estado',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        subscriptionStatusBadgeClass(r.status),
                    ].join(' ')}
                >
                    {subscriptionStatusLabel(r.status)}
                </span>
            ),
        },
        {
            header: 'Cliente',
            cellClassName: 'px-3 py-2 align-middle max-w-[14rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {formatClientFullName(r.user)}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                        {r.user?.email ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Ítems / SKU',
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[16rem]',
            render: (r) => (
                <span className="line-clamp-2">
                    {subscriptionItemsSummary(r)}
                </span>
            ),
        },
        {
            header: 'Período actual',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground max-w-[12rem]',
            render: (r) =>
                formatSubscriptionPeriod(
                    r.current_period_start,
                    r.current_period_end,
                ),
        },
        {
            header: 'Gateway sub.',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[11px] text-[#4A80B8] max-w-[10rem]',
            render: (r) => truncateGatewayId(r.gateway_subscription_id),
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
            <AdminCrudIndex<SubscriptionRow>
                rows={rows}
                paginator={subscriptions ?? null}
                rowKey={(r) => r.id}
                columns={columns}
                emptyState="No hay suscripciones todavía. Cuando existan registros en la base, aparecerán en esta tabla."
                renderToolbar={() => (
                    <VentasSuscripcionesToolbar
                        totalSubscriptions={totalSubscriptions}
                        rows={rows}
                    />
                )}
                renderAboveTable={() => (
                    <VentasSuscripcionesFilters
                        initialQuery={initialQuery}
                        initialStatus={initialStatus}
                        initialDateFrom={initialDateFrom}
                        initialDateTo={initialDateTo}
                    />
                )}
                renderRowActions={({ row }) => (
                    <div className="flex items-center justify-end gap-1">
                        <Link
                            href={panel.ventasSuscripciones.edit.url(row.id)}
                            prefetch
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/15 hover:text-[#4A80B8]"
                            aria-label="Editar suscripción"
                        >
                            <Pencil className="size-4" />
                        </Link>
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#C05050] transition-colors hover:bg-[#C05050]/12 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                            aria-label="Cancelar suscripción"
                            disabled={row.status === 'cancelled'}
                            onClick={() => setCancelTarget(row)}
                        >
                            <Ban className="size-4" />
                        </button>
                    </div>
                )}
                renderMobileRows={({ rows: mobileRows }) => (
                    <VentasSuscripcionesMobileCards
                        rows={mobileRows}
                        onCancelRequest={(r) => setCancelTarget(r)}
                    />
                )}
            />

            <VentasSuscripcionCancelModal
                open={cancelTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setCancelTarget(null);
                    }
                }}
                subscription={cancelTarget}
                cancelAction={
                    cancelTarget
                        ? panel.ventasSuscripciones.cancel.url(cancelTarget.id)
                        : ''
                }
            />
        </>
    );
}
