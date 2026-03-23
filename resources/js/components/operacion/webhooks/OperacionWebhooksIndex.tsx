import * as React from 'react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import { formatDateTime } from '@/components/acceso/entitlements/entitlementDisplay';
import OperacionWebhooksFilters from '@/components/operacion/webhooks/OperacionWebhooksFilters';
import OperacionWebhooksMobileCards from '@/components/operacion/webhooks/OperacionWebhooksMobileCards';
import OperacionWebhooksToolbar from '@/components/operacion/webhooks/OperacionWebhooksToolbar';
import {
    previewText,
    previewWebhookPayload,
    webhookProcessedBadgeClass,
    webhookProcessedLabel,
} from '@/components/operacion/webhooks/webhookEventDisplay';
import type { WebhookEventRow } from '@/components/operacion/webhooks/webhookEventTypes';

type Props = {
    webhookEvents: any;
    initialQuery: string;
    initialProcessed: string;
    initialDateFrom: string;
    initialDateTo: string;
};

export default function OperacionWebhooksIndex({
    webhookEvents,
    initialQuery,
    initialProcessed,
    initialDateFrom,
    initialDateTo,
}: Props) {
    const rows: WebhookEventRow[] = (webhookEvents?.data ?? []) as WebhookEventRow[];
    const total = webhookEvents?.total ?? rows.length;

    const countsOnPage = React.useMemo(
        () => ({
            processed: rows.filter((r) => r.processed).length,
            pending: rows.filter((r) => !r.processed).length,
            withError: rows.filter((r) => r.error != null && r.error !== '').length,
        }),
        [rows],
    );

    const columns: AdminCrudTableColumn<WebhookEventRow>[] = [
        {
            header: 'Estado',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        webhookProcessedBadgeClass(r.processed),
                    ].join(' ')}
                >
                    {webhookProcessedLabel(r.processed)}
                </span>
            ),
        },
        {
            header: 'Gateway',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[11px] text-[#4A80B8] max-w-[8rem]',
            render: (r) => (
                <span className="line-clamp-2" title={r.gateway}>
                    {r.gateway}
                </span>
            ),
        },
        {
            header: 'Tipo',
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[12rem]',
            render: (r) => (
                <span className="line-clamp-2 font-mono text-[11px]">
                    {r.event_type}
                </span>
            ),
        },
        {
            header: 'ID en pasarela',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-muted-foreground max-w-[10rem]',
            render: (r) => (
                <span
                    className="break-all"
                    title={r.gateway_event_id || undefined}
                >
                    {previewText(r.gateway_event_id, 18, 10)}
                </span>
            ),
        },
        {
            header: 'Intentos',
            cellClassName:
                'px-3 py-2 align-middle text-sm tabular-nums text-center',
            render: (r) => r.attempts,
        },
        {
            header: 'Error',
            cellClassName:
                'px-3 py-2 align-middle text-[10px] text-[#C05050] max-w-[12rem]',
            render: (r) => (
                <span
                    className="line-clamp-2 break-all"
                    title={r.error ?? undefined}
                >
                    {r.error ? previewText(r.error, 48, 12) : '—'}
                </span>
            ),
        },
        {
            header: 'Payload',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-muted-foreground max-w-[14rem]',
            render: (r) => (
                <span
                    className="line-clamp-2 break-all"
                    title={previewWebhookPayload(r.payload)}
                >
                    {previewWebhookPayload(r.payload)}
                </span>
            ),
        },
        {
            header: 'Procesado en',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.processed_at),
        },
        {
            header: 'Recibido',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.created_at),
        },
    ];

    return (
        <AdminCrudIndex<WebhookEventRow>
            rows={rows}
            paginator={webhookEvents ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay eventos de webhook registrados. Cuando la pasarela envíe notificaciones y se persistan en webhook_events, aparecerán aquí."
            renderToolbar={() => (
                <OperacionWebhooksToolbar
                    totalEvents={total}
                    rowsCount={rows.length}
                    processedOnPage={countsOnPage.processed}
                    pendingOnPage={countsOnPage.pending}
                    withErrorOnPage={countsOnPage.withError}
                />
            )}
            renderAboveTable={() => (
                <OperacionWebhooksFilters
                    initialQuery={initialQuery}
                    initialProcessed={initialProcessed}
                    initialDateFrom={initialDateFrom}
                    initialDateTo={initialDateTo}
                />
            )}
            renderMobileRows={({ rows: mobileRows }) => (
                <OperacionWebhooksMobileCards
                    rows={mobileRows}
                    emptyMessage="No hay eventos de webhook registrados. Cuando la pasarela envíe notificaciones y se persistan en webhook_events, aparecerán aquí."
                />
            )}
        />
    );
}
