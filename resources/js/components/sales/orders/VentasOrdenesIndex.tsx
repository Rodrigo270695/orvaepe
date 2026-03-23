import { Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { ArrowDown, ArrowUp, Eye, Trash2 } from 'lucide-react';

import AdminCrudDeleteModal from '@/components/admin/crud/AdminCrudDeleteModal';
import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import {
    formatClientFullName,
    formatOrderMoney,
    orderCanDelete,
    orderStatusBadgeClass,
    orderStatusLabel,
} from '@/components/sales/orders/orderDisplay';
import type { OrderRow } from '@/components/sales/orders/orderTypes';
import VentasOrdenesFilters from '@/components/sales/orders/VentasOrdenesFilters';
import VentasOrdenesMobileCards from '@/components/sales/orders/VentasOrdenesMobileCards';
import VentasOrdenesToolbar from '@/components/sales/orders/VentasOrdenesToolbar';
import panel from '@/routes/panel';

export type { OrderRow } from '@/components/sales/orders/orderTypes';

type Props = {
    orders: any;
    initialQuery: string;
    initialStatus: string;
    initialSortDir: 'asc' | 'desc';
    initialDateFrom: string;
    initialDateTo: string;
};

export default function VentasOrdenesIndex({
    orders,
    initialQuery,
    initialStatus,
    initialSortDir,
    initialDateFrom,
    initialDateTo,
}: Props) {
    const page = usePage();
    const rows: OrderRow[] = (orders?.data ?? []) as OrderRow[];
    const totalOrders = orders?.total ?? rows.length;

    const [deleteTarget, setDeleteTarget] = React.useState<OrderRow | null>(
        null,
    );

    const openDeleteModal = (row: OrderRow) => {
        if (!orderCanDelete(row.status)) {
            return;
        }
        setDeleteTarget(row);
    };

    const toggleSort = () => {
        const currentUrl = new URL(page.url, window.location.origin);
        const currentSortDir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ??
            initialSortDir;
        const nextDir: 'asc' | 'desc' =
            currentSortDir === 'asc' ? 'desc' : 'asc';
        currentUrl.searchParams.set('sort_dir', nextDir);
        currentUrl.searchParams.set('page', '1');
        router.get(currentUrl.pathname + currentUrl.search, {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const sortIcon = () => {
        const currentUrl = new URL(page.url, window.location.origin);
        const dir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ??
            initialSortDir;
        return dir === 'asc' ? (
            <ArrowUp className="size-3.5 text-[#4A80B8]" />
        ) : (
            <ArrowDown className="size-3.5 text-[#4A80B8]" />
        );
    };

    const sortableHeader = (label: string) => (
        <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground"
            onClick={() => toggleSort()}
        >
            <span>{label}</span>
            {sortIcon()}
        </button>
    );

    const formatDate = (iso: string) => {
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
    };

    const columns: AdminCrudTableColumn<OrderRow>[] = [
        {
            header: 'Estado',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        orderStatusBadgeClass(r.status),
                    ].join(' ')}
                >
                    {orderStatusLabel(r.status)}
                </span>
            ),
        },
        {
            header: 'Pedido',
            cellClassName: 'px-3 py-2 align-middle font-mono text-sm text-[#4A80B8]',
            render: (r) => r.order_number,
        },
        {
            header: sortableHeader('Fecha'),
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDate(r.created_at),
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
                        {r.user?.document_number?.trim()
                            ? r.user.document_number
                            : '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Líneas',
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs',
            render: (r) => String(r.lines_count ?? 0),
        },
        {
            header: 'Total',
            cellClassName: 'px-3 py-2 align-middle font-medium',
            render: (r) => formatOrderMoney(r.grand_total, r.currency),
        },
    ];

    return (
        <>
            <AdminCrudIndex<OrderRow>
                rows={rows}
                paginator={orders ?? null}
                rowKey={(r) => r.id}
                columns={columns}
                emptyState="No hay pedidos todavía. Crea uno con «Nueva orden» o al completar compras en el checkout."
                renderToolbar={() => (
                    <VentasOrdenesToolbar
                        totalOrders={totalOrders}
                        rows={rows}
                    />
                )}
                renderAboveTable={() => (
                    <VentasOrdenesFilters
                        initialQuery={initialQuery}
                        initialStatus={initialStatus}
                        initialDateFrom={initialDateFrom}
                        initialDateTo={initialDateTo}
                        className="mt-1"
                    />
                )}
                renderRowActions={({ row }) => (
                    <div className="flex items-center gap-1">
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
                                onClick={() => openDeleteModal(row)}
                            >
                                <Trash2 className="size-4 text-[#C05050]/60 transition-colors group-hover:text-[#C05050]" />
                            </button>
                        ) : null}
                    </div>
                )}
                renderMobileRows={({ rows: mobileRows }) => (
                    <VentasOrdenesMobileCards
                        rows={mobileRows}
                        onRequestDelete={openDeleteModal}
                    />
                )}
            />

            <AdminCrudDeleteModal
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
                title="Eliminar pedido"
                description="Solo se pueden eliminar pedidos en borrador o pendientes de pago."
                confirmLabel="Eliminar"
                action={
                    deleteTarget
                        ? panel.ventasOrdenes.destroy.url(deleteTarget.id)
                        : '#'
                }
                method="post"
                methodOverride="delete"
                entityLabel={deleteTarget?.order_number}
            />
        </>
    );
}
