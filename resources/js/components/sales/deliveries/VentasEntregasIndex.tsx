import { Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, Eye, Pencil, Trash2 } from 'lucide-react';

import { formatOrderMoney } from '@/components/sales/orders/orderDisplay';
import AdminCrudDeleteModal from '@/components/admin/crud/AdminCrudDeleteModal';
import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import {
    deliveryInvoiceUrl,
    deliveryXmlUrl,
    formatDeliveryDate,
    planPeriodLabel,
    type DeliveryRow,
    type DeliverySummary,
} from '@/components/sales/deliveries/deliveryTypes';
import VentasEntregasFilters from '@/components/sales/deliveries/VentasEntregasFilters';
import VentasEntregasMobileCards from '@/components/sales/deliveries/VentasEntregasMobileCards';
import VentasEntregasToolbar from '@/components/sales/deliveries/VentasEntregasToolbar';

type Props = {
    deliveries: any;
    summary: DeliverySummary;
    initialQuery: string;
    initialIgv: string;
    initialPlan: string;
    initialCobro: string;
    initialSortDir: 'asc' | 'desc';
    initialDateFrom: string;
    initialDateTo: string;
};

export default function VentasEntregasIndex({
    deliveries,
    summary,
    initialQuery,
    initialIgv,
    initialPlan,
    initialCobro,
    initialSortDir,
    initialDateFrom,
    initialDateTo,
}: Props) {
    const page = usePage();
    const rows: DeliveryRow[] = (deliveries?.data ?? []) as DeliveryRow[];
    const [deleteTarget, setDeleteTarget] = React.useState<DeliveryRow | null>(
        null,
    );

    const toggleSort = () => {
        const currentUrl = new URL(page.url, window.location.origin);
        const currentSortDir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ??
            initialSortDir;
        const nextDir: 'asc' | 'desc' = currentSortDir === 'asc' ? 'desc' : 'asc';
        currentUrl.searchParams.set('sort_dir', nextDir);
        currentUrl.searchParams.set('page', '1');
        router.get(
            currentUrl.pathname + currentUrl.search,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const sortIcon = () => {
        const currentUrl = new URL(page.url, window.location.origin);
        const dir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ??
            initialSortDir;
        return dir === 'asc' ? (
            <ArrowUp className="size-3.5 text-[#6A7A88]" />
        ) : (
            <ArrowDown className="size-3.5 text-[#6A7A88]" />
        );
    };

    const columns: AdminCrudTableColumn<DeliveryRow>[] = [
        {
            header: (
                <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground"
                    onClick={() => toggleSort()}
                >
                    <span>Entrega</span>
                    {sortIcon()}
                </button>
            ),
            cellClassName: 'px-3 py-2 align-middle whitespace-nowrap text-sm',
            render: (row) => formatDeliveryDate(row.delivered_at),
        },
        {
            header: 'Empresa',
            cellClassName: 'px-3 py-2 align-middle max-w-[16rem]',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {row.legal_name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                        RUC {row.ruc}
                    </span>
                </div>
            ),
        },
        {
            header: 'Producto',
            cellClassName: 'px-3 py-2 align-middle max-w-[18rem]',
            render: (row) => (
                <span className="line-clamp-2 text-sm text-muted-foreground">
                    {row.product_description}
                </span>
            ),
        },
        {
            header: 'Monto',
            headerClassName: 'px-3 text-right',
            cellClassName:
                'px-3 py-3 align-middle whitespace-nowrap text-right',
            render: (row) => (
                <div>
                    <span className="font-medium tabular-nums text-[#1C2430]">
                        {formatOrderMoney(row.sale_amount ?? '0', 'PEN')}
                    </span>
                    <span
                        className={[
                            'mt-0.5 block text-[11px]',
                            row.is_collected
                                ? 'text-[#6A7A88]'
                                : 'font-medium text-[#9A5B16]',
                        ].join(' ')}
                    >
                        {row.is_collected ? 'Cobrado' : 'Por cobrar'}
                    </span>
                </div>
            ),
        },
        {
            header: 'IGV',
            cellClassName: 'px-3 py-2 align-middle',
            render: (row) => (
                <span className="text-[13px] text-[#1C2430]">
                    {row.includes_igv ? 'Incluye' : 'No incluye'}
                </span>
            ),
        },
        {
            header: 'Plan',
            cellClassName: 'px-3 py-2 align-middle whitespace-nowrap',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                        {planPeriodLabel(row.plan_period)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        Hasta {formatDeliveryDate(row.plan_ends_at)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Documentos',
            cellClassName: 'px-3 py-2 align-middle',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    {row.has_invoice ? (
                        <a
                            href={deliveryInvoiceUrl(row.id)}
                            className="text-[13px] text-[#1C2430] underline decoration-[#C07828]/45 underline-offset-[3px] hover:decoration-[#C07828]"
                        >
                            Factura
                        </a>
                    ) : (
                        <span className="text-[13px] text-[#8A97A3]">
                            Sin factura
                        </span>
                    )}
                    {row.has_xml ? (
                        <a
                            href={deliveryXmlUrl(row.id)}
                            className="text-[13px] text-[#1C2430] underline decoration-[#C07828]/45 underline-offset-[3px] hover:decoration-[#C07828]"
                        >
                            XML
                        </a>
                    ) : null}
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminCrudIndex<DeliveryRow>
                className="space-y-4"
                ledger
                rows={rows}
                paginator={deliveries ?? null}
                rowKey={(row) => row.id}
                columns={columns}
                emptyState="No hay entregas todavía. Registra una con «Nueva entrega»."
                renderToolbar={() => (
                    <VentasEntregasToolbar summary={summary}>
                        <VentasEntregasFilters
                            initialQuery={initialQuery}
                            initialIgv={initialIgv}
                            initialPlan={initialPlan}
                            initialCobro={initialCobro}
                            initialDateFrom={initialDateFrom}
                            initialDateTo={initialDateTo}
                        />
                    </VentasEntregasToolbar>
                )}
                renderRowActions={({ row }) => (
                    <div className="flex items-center gap-1">
                        <Link
                            href={`/panel/ventas-entregas/${row.id}`}
                            prefetch
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C07828]/30"
                            aria-label="Ver entrega"
                        >
                            <Eye className="size-4 text-[#6A7A88] transition-colors group-hover:text-[#1C2430]" />
                        </Link>
                        <Link
                            href={`/panel/ventas-entregas/${row.id}/edit`}
                            prefetch
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C07828]/30"
                            aria-label="Editar entrega"
                        >
                            <Pencil className="size-4 text-[#6A7A88] transition-colors group-hover:text-[#1C2430]" />
                        </Link>
                        <button
                            type="button"
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C07828]/30"
                            aria-label={
                                row.is_collected
                                    ? 'Volver a por cobrar'
                                    : 'Marcar como cobrado'
                            }
                            title={
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
                                        : 'size-4 text-[#9A5B16]/80 transition-colors group-hover:text-[#9A5B16]'
                                }
                            />
                        </button>
                        <button
                            type="button"
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05050]/30"
                            aria-label="Eliminar entrega"
                            onClick={() => setDeleteTarget(row)}
                        >
                            <Trash2 className="size-4 text-[#C05050]/60 transition-colors group-hover:text-[#C05050]" />
                        </button>
                    </div>
                )}
                renderMobileRows={({ rows: mobileRows }) => (
                    <VentasEntregasMobileCards
                        rows={mobileRows}
                        onRequestDelete={setDeleteTarget}
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
                title="Eliminar entrega"
                description="Se quita el registro y los archivos de factura y XML."
                confirmLabel="Eliminar"
                action={
                    deleteTarget
                        ? `/panel/ventas-entregas/${deleteTarget.id}`
                        : '#'
                }
                method="post"
                methodOverride="delete"
                entityLabel={deleteTarget?.legal_name}
            />
        </>
    );
}
