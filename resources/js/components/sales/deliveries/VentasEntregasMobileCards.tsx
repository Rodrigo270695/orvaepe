import { Link, router } from '@inertiajs/react';
import { CheckCircle2, Eye, Pencil, Trash2 } from 'lucide-react';

import { formatOrderMoney } from '@/components/sales/orders/orderDisplay';

import {
    deliveryInvoiceUrl,
    deliveryXmlUrl,
    formatDeliveryDate,
    planPeriodLabel,
    type DeliveryRow,
} from '@/components/sales/deliveries/deliveryTypes';

type Props = {
    rows: DeliveryRow[];
    onRequestDelete: (row: DeliveryRow) => void;
};

export default function VentasEntregasMobileCards({
    rows,
    onRequestDelete,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="rounded-lg border border-[rgba(41,50,60,0.12)] bg-[#F7FAFC] p-4 text-center text-sm text-[#6A7A88]">
                No hay entregas todavía. Registra una con «Nueva entrega».
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-[rgba(41,50,60,0.12)] bg-[#F7FAFC]">
            {rows.map((row, idx) => (
                <div
                    key={row.id}
                    className={[
                        'px-3 py-3',
                        idx > 0 ? 'border-t border-[rgba(41,50,60,0.08)]' : '',
                    ].join(' ')}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                            <p className="truncate text-sm font-medium text-foreground">
                                {row.legal_name}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                                RUC {row.ruc}
                            </p>
                            <p className="text-[11px] text-[#6A7A88]">
                                {planPeriodLabel(row.plan_period)} · hasta{' '}
                                {formatDeliveryDate(row.plan_ends_at)}
                                {' · '}
                                {row.includes_igv ? 'Incluye IGV' : 'Sin IGV'}
                            </p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                                {row.product_description}
                            </p>
                        </div>
                        <span className="shrink-0 text-right">
                            <span className="block text-[13px] font-medium tabular-nums text-[#1C2430]">
                                {formatOrderMoney(row.sale_amount ?? '0', 'PEN')}
                            </span>
                            <span
                                className={
                                    row.is_collected
                                        ? 'mt-0.5 block text-[11px] text-[#6A7A88]'
                                        : 'mt-0.5 block text-[11px] font-medium text-[#9A5B16]'
                                }
                            >
                                {row.is_collected ? 'Cobrado' : 'Por cobrar'}
                            </span>
                        </span>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                        Entrega {formatDeliveryDate(row.delivered_at)}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                        <Link
                            href={`/panel/ventas-entregas/${row.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                            aria-label="Ver entrega"
                        >
                            <Eye className="size-4 text-[#6A7A88]" />
                        </Link>
                        <Link
                            href={`/panel/ventas-entregas/${row.id}/edit`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                            aria-label="Editar entrega"
                        >
                            <Pencil className="size-4 text-[#6A7A88]" />
                        </Link>
                        {row.has_invoice ? (
                            <a
                                href={deliveryInvoiceUrl(row.id)}
                                className="inline-flex h-8 items-center px-1.5 text-[12px] text-[#1C2430] underline decoration-[#C07828]/45 underline-offset-[3px]"
                            >
                                Factura
                            </a>
                        ) : null}
                        {row.has_xml ? (
                            <a
                                href={deliveryXmlUrl(row.id)}
                                className="inline-flex h-8 items-center px-1.5 text-[12px] text-[#1C2430] underline decoration-[#C07828]/45 underline-offset-[3px]"
                            >
                                XML
                            </a>
                        ) : null}
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                            aria-label={
                                row.is_collected
                                    ? 'Volver a por cobrar'
                                    : 'Marcar como cobrado'
                            }
                            onClick={() =>
                                router.post(
                                    `/panel/ventas-entregas/${row.id}/cobro`,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <CheckCircle2
                                className={
                                    row.is_collected
                                        ? 'size-4 text-[#1C2430]'
                                        : 'size-4 text-[#9A5B16]/80'
                                }
                            />
                        </button>
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                            aria-label="Eliminar entrega"
                            onClick={() => onRequestDelete(row)}
                        >
                            <Trash2 className="size-4 text-[#C05050]/70" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
