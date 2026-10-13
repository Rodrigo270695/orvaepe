import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import { formatDateTime } from '@/components/acceso/entitlements/entitlementDisplay';
import {
    previewText,
    webhookProcessedBadgeClass,
    webhookProcessedLabel,
} from '@/components/operacion/webhooks/webhookEventDisplay';
import OperacionWhatsappCloudFilters from '@/components/operacion/whatsapp-cloud/OperacionWhatsappCloudFilters';
import OperacionWhatsappCloudMobileCards from '@/components/operacion/whatsapp-cloud/OperacionWhatsappCloudMobileCards';
import OperacionWhatsappCloudToolbar from '@/components/operacion/whatsapp-cloud/OperacionWhatsappCloudToolbar';
import {
    productoLabel,
    whatsappEventBadgeClass,
    whatsappEventLabel,
} from '@/components/operacion/whatsapp-cloud/whatsappCloudDisplay';
import type {
    WhatsappCloudEventRow,
    WhatsappCloudFilters,
    WhatsappCloudStats,
} from '@/components/operacion/whatsapp-cloud/whatsappCloudTypes';

type Props = {
    webhookEvents: any;
    stats: WhatsappCloudStats;
    productos: string[];
    webhookUrl: string;
    filters: WhatsappCloudFilters;
};

const EMPTY_MESSAGE =
    'No hay eventos de WhatsApp Cloud API en este rango. Cuando Meta notifique estados o mensajes entrantes en /webhooks/whatsapp, aparecerán aquí.';

export default function OperacionWhatsappCloudIndex({
    webhookEvents,
    stats,
    productos,
    webhookUrl,
    filters,
}: Props) {
    const rows: WhatsappCloudEventRow[] = (webhookEvents?.data ??
        []) as WhatsappCloudEventRow[];

    const columns: AdminCrudTableColumn<WhatsappCloudEventRow>[] = [
        {
            header: 'Evento',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                        whatsappEventBadgeClass(r.event_type),
                    ].join(' ')}
                    title={r.event_type}
                >
                    {whatsappEventLabel(r.event_type)}
                </span>
            ),
        },
        {
            header: 'Producto / tenant',
            cellClassName: 'px-3 py-2 align-middle text-xs max-w-[11rem]',
            render: (r) =>
                r.mensaje ? (
                    <div className="space-y-0.5">
                        <p className="font-semibold">
                            {productoLabel(r.mensaje.producto)}
                        </p>
                        <p
                            className="truncate font-mono text-[10px] text-muted-foreground"
                            title={r.mensaje.tenant_id}
                        >
                            {r.mensaje.tenant_id}
                        </p>
                    </div>
                ) : (
                    <span className="text-muted-foreground">Sin mensaje</span>
                ),
        },
        {
            header: 'Teléfono',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[11px] tabular-nums',
            render: (r) => r.mensaje?.telefono ?? '—',
        },
        {
            header: 'Recordatorio',
            cellClassName: 'px-3 py-2 align-middle text-xs max-w-[11rem]',
            render: (r) =>
                r.mensaje?.reminder_id || r.mensaje?.plantilla ? (
                    <div className="space-y-0.5">
                        {r.mensaje?.plantilla ? (
                            <p className="truncate font-mono text-[10px] text-[#4A80B8]">
                                {r.mensaje.plantilla}
                            </p>
                        ) : null}
                        <p
                            className="truncate font-mono text-[10px] text-muted-foreground"
                            title={r.mensaje?.reminder_id ?? undefined}
                        >
                            {r.mensaje?.reminder_id ?? '—'}
                        </p>
                    </div>
                ) : (
                    '—'
                ),
        },
        {
            header: 'Error de Meta',
            cellClassName:
                'px-3 py-2 align-middle text-[10px] text-[#C05050] max-w-[14rem]',
            render: (r) =>
                r.meta_error ? (
                    <span
                        className="line-clamp-2 break-all"
                        title={r.meta_error.message ?? undefined}
                    >
                        {r.meta_error.code ? `#${r.meta_error.code} ` : ''}
                        {previewText(r.meta_error.message, 60, 10)}
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            header: 'Procesado',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <div className="space-y-0.5">
                    <span
                        className={[
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            webhookProcessedBadgeClass(r.processed),
                        ].join(' ')}
                    >
                        {webhookProcessedLabel(r.processed)}
                    </span>
                    {r.error ? (
                        <p
                            className="line-clamp-2 max-w-[12rem] text-[10px] break-all text-[#C05050]"
                            title={r.error}
                        >
                            {r.attempts > 0 ? `${r.attempts}× · ` : ''}
                            {previewText(r.error, 40, 8)}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            header: 'wamid',
            cellClassName:
                'px-3 py-2 align-middle font-mono text-[10px] text-muted-foreground max-w-[10rem]',
            render: (r) => (
                <span className="break-all" title={r.wamid}>
                    {previewText(r.wamid, 14, 8)}
                </span>
            ),
        },
        {
            header: 'Recibido',
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground whitespace-nowrap',
            render: (r) => formatDateTime(r.created_at),
        },
    ];

    return (
        <AdminCrudIndex<WhatsappCloudEventRow>
            rows={rows}
            paginator={webhookEvents ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState={EMPTY_MESSAGE}
            renderToolbar={() => (
                <OperacionWhatsappCloudToolbar
                    stats={stats}
                    webhookUrl={webhookUrl}
                />
            )}
            renderAboveTable={() => (
                <OperacionWhatsappCloudFilters
                    filters={filters}
                    productos={productos}
                />
            )}
            renderMobileRows={({ rows: mobileRows }) => (
                <OperacionWhatsappCloudMobileCards
                    rows={mobileRows}
                    emptyMessage={EMPTY_MESSAGE}
                />
            )}
        />
    );
}
