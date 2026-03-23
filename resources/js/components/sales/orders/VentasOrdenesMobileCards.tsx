import { Link } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';

import {
    formatClientFullName,
    formatOrderMoney,
    orderCanDelete,
    orderStatusBadgeClass,
    orderStatusLabel,
} from '@/components/sales/orders/orderDisplay';
import type { OrderRow } from '@/components/sales/orders/orderTypes';
import panel from '@/routes/panel';

type Props = {
    rows: OrderRow[];
    onRequestDelete: (row: OrderRow) => void;
};

function formatDate(iso: string): string {
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

export default function VentasOrdenesMobileCards({
    rows,
    onRequestDelete,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground neumorph-inset">
                No hay pedidos todavía. Crea uno con «Nueva orden» o al
                completar compras en el checkout.
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
                            <p className="truncate font-mono text-sm font-semibold text-[#4A80B8]">
                                {row.order_number}
                            </p>
                            <p className="text-xs font-medium leading-snug text-foreground">
                                {formatClientFullName(row.user)}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                                {row.user?.document_number?.trim()
                                    ? row.user.document_number
                                    : '—'}
                            </p>
                        </div>

                        <span
                            className={[
                                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                orderStatusBadgeClass(row.status),
                            ].join(' ')}
                        >
                            {orderStatusLabel(row.status)}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <p className="text-muted-foreground">Fecha</p>
                            <p className="text-foreground">
                                {formatDate(row.created_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Líneas</p>
                            <p className="font-mono text-foreground">
                                {String(row.lines_count ?? 0)}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Total</p>
                            <p className="text-sm font-medium text-foreground">
                                {formatOrderMoney(
                                    row.grand_total,
                                    row.currency,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                        <Link
                            href={panel.ventasOrdenes.show.url(row.id)}
                            prefetch
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                            aria-label="Ver pedido"
                        >
                            <Eye className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                        </Link>
                        {orderCanDelete(row.status) ? (
                            <button
                                type="button"
                                className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05050]/30"
                                aria-label="Eliminar pedido"
                                onClick={() => onRequestDelete(row)}
                            >
                                <Trash2 className="size-4 text-[#C05050]/60 transition-colors group-hover:text-[#C05050]" />
                            </button>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}
