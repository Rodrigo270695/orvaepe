import { formatDateTime } from '@/components/acceso/entitlements/entitlementDisplay';
import {
    previewText,
    previewWebhookPayload,
    webhookProcessedBadgeClass,
    webhookProcessedLabel,
} from '@/components/operacion/webhooks/webhookEventDisplay';
import type { WebhookEventRow } from '@/components/operacion/webhooks/webhookEventTypes';

type Props = {
    rows: WebhookEventRow[];
    emptyMessage: string;
};

export default function OperacionWebhooksMobileCards({
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
                            <p className="font-mono text-[11px] font-semibold text-[#4A80B8]">
                                {row.gateway}
                            </p>
                            <p className="break-all font-mono text-[10px] text-muted-foreground">
                                {row.event_type}
                            </p>
                        </div>
                        <span
                            className={[
                                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                webhookProcessedBadgeClass(row.processed),
                            ].join(' ')}
                        >
                            {webhookProcessedLabel(row.processed)}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2">
                            <p className="text-muted-foreground">ID en pasarela</p>
                            <p className="break-all font-mono text-[11px] text-foreground">
                                {previewText(row.gateway_event_id, 40, 12)}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Payload</p>
                            <p className="break-all font-mono text-[10px] text-muted-foreground">
                                {previewWebhookPayload(row.payload)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Intentos</p>
                            <p className="tabular-nums text-foreground">
                                {row.attempts}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Procesado</p>
                            <p className="text-foreground">
                                {formatDateTime(row.processed_at)}
                            </p>
                        </div>
                        {row.error ? (
                            <div className="col-span-2">
                                <p className="text-muted-foreground">Error</p>
                                <p className="wrap-break-word text-[11px] text-[#C05050]">
                                    {previewText(row.error, 120, 20)}
                                </p>
                            </div>
                        ) : null}
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Recibido</p>
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
