import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import type { BreadcrumbItem } from '@/types';

type Line = {
    id: string;
    product_name_snapshot: string;
    sku_name_snapshot: string;
    quantity: number;
    unit_price: string;
    line_discount: string;
    tax_amount: string;
    line_total: string;
    metadata: Record<string, unknown> | null;
};

type OrderShow = {
    id: string;
    order_number: string;
    status: string;
    currency: string;
    subtotal: string;
    discount_total: string;
    tax_total: string;
    grand_total: string;
    billing_snapshot: Record<string, unknown> | null;
    notes_internal: string | null;
    placed_at: string | null;
    created_at: string;
    lines: Line[];
    user?: { name: string; email: string } | null;
    coupon?: { code: string } | null;
};

type Props = {
    order: OrderShow;
};

function statusLabel(s: string): string {
    const map: Record<string, string> = {
        draft: 'Borrador',
        pending_payment: 'Pendiente de pago',
        paid: 'Pagado',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado',
    };
    return map[s] ?? s;
}

function formatMoney(amount: string, currency: string): string {
    const n = Number.parseFloat(amount);
    if (Number.isNaN(n)) {
        return `${currency} ${amount}`;
    }
    return `${currency} ${n.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function VentasOrdenShowPage({ order }: Props) {
    const section = 'ventas-ordenes';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        { title: order.order_number, href: `/panel/ventas-ordenes/${order.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pedido ${order.order_number}`} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a órdenes
                    </Link>
                </div>

                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <ShoppingCart className="mt-0.5 size-4 text-[#D28C3C]" />
                            <div>
                                <h1 className="font-mono text-sm font-bold text-[#4A80B8]">
                                    {order.order_number}
                                </h1>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    {statusLabel(order.status)}
                                    {order.user ? (
                                        <>
                                            {' '}
                                            · {order.user.name}{' '}
                                            <span className="text-muted-foreground/80">
                                                ({order.user.email})
                                            </span>
                                        </>
                                    ) : null}
                                </p>
                                {order.coupon ? (
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        Cupón:{' '}
                                        <span className="font-mono text-[#4A9A72]">
                                            {order.coupon.code}
                                        </span>
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </NeuCardRaised>

                <div className="neumorph-inset mt-4 rounded-xl border border-border/60 p-4 md:p-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Líneas del pedido
                    </h2>
                    {order.lines.length === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Sin líneas.
                        </p>
                    ) : (
                        <>
                            <div className="mt-3 space-y-3 md:hidden">
                                {order.lines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="rounded-lg border border-border/60 bg-black/5 p-3 dark:bg-black/20"
                                    >
                                        <p className="text-sm font-medium leading-snug text-foreground">
                                            {line.product_name_snapshot}
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            {line.sku_name_snapshot}
                                        </p>
                                        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                                            <dt className="text-muted-foreground">
                                                Cantidad
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {line.quantity}
                                            </dd>
                                            <dt className="text-muted-foreground">
                                                P. unitario
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {formatMoney(
                                                    line.unit_price,
                                                    order.currency,
                                                )}
                                            </dd>
                                            <dt className="text-muted-foreground">
                                                Descuento
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {formatMoney(
                                                    line.line_discount,
                                                    order.currency,
                                                )}
                                            </dd>
                                            <dt className="text-muted-foreground">
                                                IGV / imp.
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {formatMoney(
                                                    line.tax_amount,
                                                    order.currency,
                                                )}
                                            </dd>
                                            <dt className="col-span-2 border-t border-border/40 pt-2 font-semibold text-foreground">
                                                Total línea
                                            </dt>
                                            <dd className="col-span-2 border-border/40 pt-2 text-right font-mono text-sm font-semibold text-[#4A80B8]">
                                                {formatMoney(
                                                    line.line_total,
                                                    order.currency,
                                                )}
                                            </dd>
                                        </dl>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[640px] text-left text-sm">
                                    <thead>
                                        <tr className="text-xs text-muted-foreground">
                                            <th className="px-2 py-2 font-semibold">
                                                Producto / SKU
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                Cant.
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                P. unit.
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                Desc.
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                IGV / imp.
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                Total línea
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.lines.map((line) => (
                                            <tr
                                                key={line.id}
                                                className="border-t border-border/50"
                                            >
                                                <td className="px-2 py-2 align-top">
                                                    <span className="font-medium">
                                                        {
                                                            line.product_name_snapshot
                                                        }
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                                        {line.sku_name_snapshot}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {line.quantity}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {formatMoney(
                                                        line.unit_price,
                                                        order.currency,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {formatMoney(
                                                        line.line_discount,
                                                        order.currency,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {formatMoney(
                                                        line.tax_amount,
                                                        order.currency,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs font-medium">
                                                    {formatMoney(
                                                        line.line_total,
                                                        order.currency,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                <div className="neumorph-inset mt-4 rounded-xl border border-border/60 p-4 md:p-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Totales
                    </h2>
                    <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Subtotal</dt>
                            <dd className="font-mono">
                                {formatMoney(order.subtotal, order.currency)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Descuentos</dt>
                            <dd className="font-mono">
                                {formatMoney(
                                    order.discount_total,
                                    order.currency,
                                )}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Impuestos</dt>
                            <dd className="font-mono">
                                {formatMoney(order.tax_total, order.currency)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-border/50 pt-2 font-semibold">
                            <dt>Total</dt>
                            <dd className="font-mono text-[#4A80B8]">
                                {formatMoney(order.grand_total, order.currency)}
                            </dd>
                        </div>
                    </dl>
                </div>

                {order.billing_snapshot &&
                Object.keys(order.billing_snapshot).length > 0 ? (
                    <NeuCardRaised className="mt-4 rounded-xl p-4 md:p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Datos fiscales (snapshot)
                        </h2>
                        <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/20 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                            {JSON.stringify(order.billing_snapshot, null, 2)}
                        </pre>
                    </NeuCardRaised>
                ) : null}

                {order.notes_internal ? (
                    <NeuCardRaised className="mt-4 rounded-xl p-4 md:p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Notas internas
                        </h2>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                            {order.notes_internal}
                        </p>
                    </NeuCardRaised>
                ) : null}
            </div>
        </AppLayout>
    );
}
