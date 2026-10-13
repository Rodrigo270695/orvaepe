import { formatDateTime } from '@/components/acceso/entitlements/entitlementDisplay';
import {
    previewText,
    webhookProcessedBadgeClass,
    webhookProcessedLabel,
} from '@/components/operacion/webhooks/webhookEventDisplay';
import {
    productoLabel,
    whatsappEventBadgeClass,
    whatsappEventLabel,
} from '@/components/operacion/whatsapp-cloud/whatsappCloudDisplay';
import type { WhatsappCloudEventRow } from '@/components/operacion/whatsapp-cloud/whatsappCloudTypes';

type Props = {
    rows: WhatsappCloudEventRow[];
    emptyMessage: string;
};

export default function OperacionWhatsappCloudMobileCards({
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
        <div className="neumorph-inset rounded-xl border border-border/60">
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
                            <span
                                className={[
                                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                    whatsappEventBadgeClass(row.event_type),
                                ].join(' ')}
                            >
                                {whatsappEventLabel(row.event_type)}
                            </span>
                            <p className="font-mono text-[11px] text-foreground tabular-nums">
                                {row.mensaje?.telefono ?? '—'}
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
                        <div>
                            <p className="text-muted-foreground">Producto</p>
                            <p className="text-foreground">
                                {row.mensaje
                                    ? productoLabel(row.mensaje.producto)
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Tenant</p>
                            <p className="font-mono text-[11px] break-all text-foreground">
                                {row.mensaje?.tenant_id ?? '—'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">
                                Recordatorio
                            </p>
                            <p className="font-mono text-[11px] break-all text-foreground">
                                {[
                                    row.mensaje?.plantilla,
                                    row.mensaje?.reminder_id,
                                ]
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                            </p>
                        </div>
                        {row.meta_error ? (
                            <div className="col-span-2">
                                <p className="text-muted-foreground">
                                    Error de Meta
                                </p>
                                <p className="text-[11px] wrap-break-word text-[#C05050]">
                                    {row.meta_error.code
                                        ? `#${row.meta_error.code} `
                                        : ''}
                                    {previewText(
                                        row.meta_error.message,
                                        120,
                                        20,
                                    )}
                                </p>
                            </div>
                        ) : null}
                        {row.error ? (
                            <div className="col-span-2">
                                <p className="text-muted-foreground">
                                    Error al procesar
                                </p>
                                <p className="text-[11px] wrap-break-word text-[#C05050]">
                                    {previewText(row.error, 120, 20)}
                                </p>
                            </div>
                        ) : null}
                        <div className="col-span-2">
                            <p className="text-muted-foreground">wamid</p>
                            <p className="font-mono text-[10px] break-all text-muted-foreground">
                                {previewText(row.wamid, 40, 12)}
                            </p>
                        </div>
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
