import { Link } from '@inertiajs/react';
import { Eye, FileCode2, FileText, Pencil, Trash2 } from 'lucide-react';

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
            <div className="rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground neumorph-inset">
                No hay entregas todavía. Registra una con «Nueva entrega».
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
                            <p className="truncate text-sm font-medium text-foreground">
                                {row.legal_name}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                                RUC {row.ruc}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                {planPeriodLabel(row.plan_period)} · hasta{' '}
                                {formatDeliveryDate(row.plan_ends_at)}
                            </p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                                {row.product_description}
                            </p>
                        </div>
                        <span
                            className={[
                                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                row.includes_igv
                                    ? 'bg-[#4A9A72]/12 text-[#4A9A72]'
                                    : 'bg-[#D28C3C]/12 text-[#D28C3C]',
                            ].join(' ')}
                        >
                            {row.includes_igv ? 'Con IGV' : 'Sin IGV'}
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
                            <Eye className="size-4 text-[#4A80B8]/70" />
                        </Link>
                        <Link
                            href={`/panel/ventas-entregas/${row.id}/edit`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                            aria-label="Editar entrega"
                        >
                            <Pencil className="size-4 text-[#4A80B8]/70" />
                        </Link>
                        {row.has_invoice ? (
                            <a
                                href={deliveryInvoiceUrl(row.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                                aria-label="Descargar factura"
                            >
                                <FileText className="size-4 text-[#b45309]/80" />
                            </a>
                        ) : null}
                        {row.has_xml ? (
                            <a
                                href={deliveryXmlUrl(row.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                                aria-label="Descargar XML"
                            >
                                <FileCode2 className="size-4 text-[#8B5CF6]/80" />
                            </a>
                        ) : null}
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
