import { Link } from '@inertiajs/react';
import { Info } from 'lucide-react';

import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import {
    formatOrderMoney,
    orderStatusBadgeClass,
    orderStatusLabel,
} from '@/components/sales/orders/orderDisplay';
import { Button } from '@/components/ui/button';
import ClientPortalLayout from '@/layouts/client-portal-layout';

type OrderRow = {
    id: string;
    order_number: string;
    status: string;
    currency: string;
    grand_total: string;
    created_at: string;
    placed_at: string | null;
};

type Props = {
    orders: OrderRow[];
    paymentGatewayEnabled: boolean;
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
    });
}

export default function ClientePagos({ orders, paymentGatewayEnabled }: Props) {
    return (
        <ClientPortalLayout
            title="Pagos"
            headTitle="Pagos — Área del cliente"
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Pagos' },
            ]}
        >
            <div className="mx-auto max-w-5xl space-y-5">
                <ClientPageTitleCard title="Pagos y pedidos" />

                {!paymentGatewayEnabled ? (
                    <div className="flex gap-3 rounded-xl border border-[color-mix(in_oklab,var(--state-alert)_35%,var(--border))] bg-[color-mix(in_oklab,var(--state-alert)_10%,transparent)] px-4 py-3 text-sm text-[color-mix(in_oklab,var(--state-alert)_72%,var(--foreground))]">
                        <Info
                            className="size-5 shrink-0 text-[color-mix(in_oklab,var(--state-alert)_75%,var(--foreground))]"
                            aria-hidden
                        />
                        <div>
                            <p className="font-medium text-[color-mix(in_oklab,var(--state-alert)_82%,var(--foreground))]">
                                Pago en línea aún no activo
                            </p>
                            <p className="mt-1 leading-relaxed text-[color-mix(in_oklab,var(--state-alert)_66%,var(--foreground))]">
                                Aquí verás el estado de tus pedidos. Cuando
                                conectemos la pasarela (por ejemplo PayPal),
                                podrás pagar pendientes desde esta misma
                                pantalla. Si tienes una orden pendiente,
                                puedes contactarnos por soporte.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3 rounded-xl border border-[color-mix(in_oklab,var(--state-info)_30%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)] px-4 py-3 text-sm text-[color-mix(in_oklab,var(--state-info)_72%,var(--foreground))]">
                        <Info
                            className="size-5 shrink-0 text-[color-mix(in_oklab,var(--state-info)_75%,var(--foreground))]"
                            aria-hidden
                        />
                        <p className="leading-relaxed">
                            La pasarela está habilitada en configuración; el
                            botón de cobro se conectará cuando finalice la
                            integración.
                        </p>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] shadow-sm">
                    {orders.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                No tienes pedidos todavía.
                            </p>
                            <Link
                                href="/software"
                                className="mt-3 inline-block text-sm font-medium text-[color-mix(in_oklab,var(--state-info)_70%,var(--foreground))] hover:underline"
                            >
                                Ver catálogo de software
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_7%,transparent)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            <th className="px-4 py-3">
                                                Pedido
                                            </th>
                                            <th className="px-4 py-3">
                                                Fecha
                                            </th>
                                            <th className="px-4 py-3">
                                                Estado
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Total
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                Pago
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-b border-[color-mix(in_oklab,var(--state-info)_12%,var(--border))] last:border-0"
                                            >
                                                <td className="px-4 py-3 font-mono text-sm font-medium text-foreground">
                                                    {row.order_number}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDate(
                                                        row.created_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusBadgeClass(row.status)}`}
                                                    >
                                                        {orderStatusLabel(
                                                            row.status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-foreground">
                                                    {formatOrderMoney(
                                                        row.grand_total,
                                                        row.currency,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <PaymentAction
                                                        status={row.status}
                                                        gatewayEnabled={
                                                            paymentGatewayEnabled
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <ul className="divide-y divide-[color-mix(in_oklab,var(--state-info)_12%,var(--border))] md:hidden">
                                {orders.map((row) => (
                                    <li
                                        key={row.id}
                                        className="px-4 py-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-mono text-sm font-semibold text-foreground">
                                                    {row.order_number}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {formatDate(
                                                        row.created_at,
                                                    )}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusBadgeClass(row.status)}`}
                                            >
                                                {orderStatusLabel(row.status)}
                                            </span>
                                        </div>
                                        <p className="mt-2 font-mono text-sm text-foreground">
                                            {formatOrderMoney(
                                                row.grand_total,
                                                row.currency,
                                            )}
                                        </p>
                                        <div className="mt-3">
                                            <PaymentAction
                                                status={row.status}
                                                gatewayEnabled={
                                                    paymentGatewayEnabled
                                                }
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </ClientPortalLayout>
    );
}

function PaymentAction({
    status,
    gatewayEnabled,
}: {
    status: string;
    gatewayEnabled: boolean;
}) {
    if (status !== 'pending_payment') {
        return (
            <span className="text-xs text-muted-foreground">
                {status === 'paid' ? 'Cobrado' : '—'}
            </span>
        );
    }

    if (!gatewayEnabled) {
        return (
            <span className="text-xs text-muted-foreground">
                Pago online próximamente
            </span>
        );
    }

    return (
        <Button
            type="button"
            size="sm"
            disabled
            className="bg-[linear-gradient(120deg,var(--state-info),var(--state-success))] text-white opacity-70"
        >
            Pagar
        </Button>
    );
}
