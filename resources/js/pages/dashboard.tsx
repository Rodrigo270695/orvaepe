import { Head } from '@inertiajs/react';
import { useMemo, type ReactNode } from 'react';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Boxes,
    CreditCard,
    FileText,
    Layers3,
    PieChart as PieChartIcon,
    ShoppingCart,
    TrendingUp,
    Users,
    Wallet,
    Webhook,
} from 'lucide-react';
import {
    Area,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

/** Alineado a `app.css` — --dash-series-1 … 6 */
const SERIES = [
    'var(--dash-series-1)',
    'var(--dash-series-2)',
    'var(--dash-series-3)',
    'var(--dash-series-4)',
    'var(--dash-series-5)',
    'var(--dash-series-6)',
];

const tooltipContentStyle = {
    background: 'var(--dash-tooltip-bg)',
    border: '1px solid var(--dash-tooltip-border)',
    borderRadius: '10px',
    fontSize: '12px',
};

/** Recharts mide el contenedor: `height="100%"` falla si el padre aún no tiene alto (p. ej. flex). */
const CHART_H_MAIN = 320;
const CHART_H_CARD = 256;
const CHART_H_SPLIT = 224;

function ResponsiveChart({
    heightPx,
    children,
}: {
    heightPx: number;
    children: ReactNode;
}) {
    return (
        <div
            className="w-full min-w-0 shrink-0"
            style={{ height: heightPx, minHeight: heightPx }}
        >
            <ResponsiveContainer
                width="100%"
                height={heightPx}
                minWidth={0}
            >
                {children}
            </ResponsiveContainer>
        </div>
    );
}

type Kpis = {
    orders_total: number;
    orders_paid: number;
    orders_pending_payment: number;
    revenue_paid_all: number;
    revenue_paid_last_30d: number;
    subscriptions_active: number;
    entitlements_active: number;
    webhooks_pending: number;
    users_total: number;
    clients_total: number;
    products_active: number;
    skus_active: number;
    coupons_active: number;
    releases_total: number;
    audit_logs_7d: number;
};

type DailyPoint = {
    date: string;
    short_label: string;
    orders: number;
    revenue: number;
};

type NamedCount = { status: string; count: number };

type RevenueLine = { key: string; label: string; total: number };

type GatewayRow = { gateway: string; total: number };

type Props = {
    kpis: Kpis;
    dailyChart: DailyPoint[];
    ordersByStatus: NamedCount[];
    revenueByLine: RevenueLine[];
    paymentsByGateway: GatewayRow[];
    subscriptionsByStatus: NamedCount[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel',
        href: dashboard(),
    },
];

function formatPEN(n: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(n);
}

function orderStatusLabel(status: string): string {
    const m: Record<string, string> = {
        draft: 'Borrador',
        pending_payment: 'Pago pendiente',
        paid: 'Pagado',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado',
    };
    return m[status] ?? status;
}

function subscriptionStatusLabel(status: string): string {
    const m: Record<string, string> = {
        trialing: 'Prueba',
        active: 'Activa',
        past_due: 'Vencida',
        paused: 'Pausada',
        cancelled: 'Cancelada',
    };
    return m[status] ?? status;
}

function seriesAt(i: number): string {
    return SERIES[i % SERIES.length] ?? SERIES[0];
}

export default function Dashboard({
    kpis,
    dailyChart,
    ordersByStatus,
    revenueByLine,
    paymentsByGateway,
    subscriptionsByStatus,
}: Props) {
    const hasGatewayData = paymentsByGateway.some((g) => g.total > 0);
    const hasLineMix = revenueByLine.some((r) => r.total > 0);

    const ordersBarData = useMemo(
        () =>
            ordersByStatus.map((o) => ({
                label: orderStatusLabel(o.status),
                count: o.count,
                status: o.status,
            })),
        [ordersByStatus],
    );

    const revenueBarData = useMemo(
        () =>
            revenueByLine.map((r) => ({
                label: r.label,
                total: r.total,
            })),
        [revenueByLine],
    );

    const subsBarData = useMemo(
        () =>
            subscriptionsByStatus.map((s) => ({
                label: subscriptionStatusLabel(s.status),
                count: s.count,
            })),
        [subscriptionsByStatus],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel" />
            <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-3 md:p-4">
                <header className="flex flex-col gap-1 border-b border-[var(--dash-grid)] pb-3">
                    <h1 className="text-lg font-semibold text-foreground">
                        Panel operativo
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ventas, catálogo, suscripciones y colas — datos en vivo
                        para decidir.
                    </p>
                </header>

                <div className="grid auto-rows-min gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="neumorph rounded-2xl border-l-4 border-l-[var(--dash-revenue)] p-4">
                        <div className="mb-3 inline-flex rounded-xl bg-[color-mix(in_oklab,var(--dash-revenue)_18%,transparent)] p-2">
                            <Wallet className="size-4 text-[var(--dash-revenue)]" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                            Ingresos (30 días, pagado)
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-foreground">
                            {formatPEN(kpis.revenue_paid_last_30d)}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Total histórico:{' '}
                            <span className="font-medium text-[var(--dash-revenue)]">
                                {formatPEN(kpis.revenue_paid_all)}
                            </span>
                        </p>
                    </div>
                    <div className="neumorph rounded-2xl border-l-4 border-l-[var(--dash-orders)] p-4">
                        <div className="mb-3 inline-flex rounded-xl bg-[color-mix(in_oklab,var(--dash-orders)_18%,transparent)] p-2">
                            <ShoppingCart className="size-4 text-[var(--dash-orders)]" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                            Pedidos
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-foreground">
                            {kpis.orders_total}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            <span className="text-[var(--dash-series-2)]">
                                Pagados {kpis.orders_paid}
                            </span>
                            {' · '}
                            <span className="text-[var(--dash-series-5)]">
                                Pendiente {kpis.orders_pending_payment}
                            </span>
                        </p>
                    </div>
                    <div className="neumorph rounded-2xl border-l-4 border-l-[var(--dash-series-4)] p-4">
                        <div className="mb-3 inline-flex rounded-xl bg-[color-mix(in_oklab,var(--dash-series-4)_20%,transparent)] p-2">
                            <TrendingUp className="size-4 text-[var(--dash-series-4)]" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                            Suscripciones activas
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-foreground">
                            {kpis.subscriptions_active}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Entitlements:{' '}
                            <span className="font-medium text-[var(--dash-series-2)]">
                                {kpis.entitlements_active}
                            </span>
                        </p>
                    </div>
                    <div className="neumorph rounded-2xl border-l-4 border-l-[var(--dash-series-5)] p-4">
                        <div className="mb-3 inline-flex rounded-xl bg-[color-mix(in_oklab,var(--dash-series-5)_18%,transparent)] p-2">
                            <Webhook className="size-4 text-[var(--dash-series-5)]" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                            Webhooks sin procesar
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-foreground">
                            {kpis.webhooks_pending}
                        </p>
                        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            {kpis.webhooks_pending > 0 ? (
                                <>
                                    <AlertTriangle className="size-3.5 text-[var(--dash-series-5)]" />
                                    Revisar cola de pasarela
                                </>
                            ) : (
                                <span className="text-[var(--dash-revenue)]">
                                    Cola al día
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="neumorph rounded-2xl border-l-4 border-l-[var(--dash-series-6)] p-4">
                        <div className="mb-2 inline-flex rounded-lg bg-[color-mix(in_oklab,var(--dash-series-6)_16%,transparent)] p-2">
                            <Users className="size-4 text-[var(--dash-series-6)]" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                            Usuarios / clientes
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                            {kpis.users_total}{' '}
                            <span className="text-sm font-normal text-muted-foreground">
                                ({kpis.clients_total} clientes)
                            </span>
                        </p>
                    </div>
                    <div className="neumorph rounded-2xl border-l-4 border-l-[var(--dash-series-3)] p-4">
                        <div className="mb-2 inline-flex rounded-lg bg-[color-mix(in_oklab,var(--dash-series-3)_18%,transparent)] p-2">
                            <Boxes className="size-4 text-[var(--dash-series-3)]" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                            Catálogo activo
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                            {kpis.products_active} prod. · {kpis.skus_active}{' '}
                            SKUs
                        </p>
                    </div>
                    <div className="neumorph rounded-2xl border-l-4 border-l-[var(--dash-series-1)] p-4">
                        <div className="mb-2 inline-flex rounded-lg bg-[color-mix(in_oklab,var(--dash-series-1)_16%,transparent)] p-2">
                            <CreditCard className="size-4 text-[var(--dash-series-1)]" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                            Cupones activos
                        </p>
                        <p className="mt-1 text-xl font-semibold text-[var(--dash-series-1)]">
                            {kpis.coupons_active}
                        </p>
                    </div>
                    <div className="neumorph rounded-2xl border-l-4 border-l-[var(--o-tech)] p-4">
                        <div className="mb-2 inline-flex rounded-lg bg-[color-mix(in_oklab,var(--o-tech)_16%,transparent)] p-2">
                            <FileText className="size-4 text-[var(--o-tech)]" />
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                            Releases / auditoría
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-snug">
                            <span className="text-[var(--dash-series-2)]">
                                {kpis.releases_total} versiones
                            </span>
                            {' · '}
                            <span className="text-[var(--dash-series-3)]">
                                {kpis.audit_logs_7d} eventos (7 d)
                            </span>
                        </p>
                    </div>
                </div>

                <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-orders)_25%,transparent)]">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                                <Activity className="size-4 text-[var(--dash-orders)]" />
                                Últimos {dailyChart.length} días
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Barras: pedidos colocados · Área: ingresos
                                pagados (fecha de pedido).
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <span
                                    className="size-2.5 rounded-sm"
                                    style={{
                                        background: 'var(--dash-orders)',
                                    }}
                                />
                                Pedidos
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span
                                    className="size-2.5 rounded-sm"
                                    style={{
                                        background: 'var(--dash-revenue)',
                                    }}
                                />
                                Ingresos
                            </span>
                        </div>
                    </div>
                    <ResponsiveChart heightPx={CHART_H_MAIN}>
                            <ComposedChart data={dailyChart}>
                                <defs>
                                    <linearGradient
                                        id="dashRevenueFill"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="var(--dash-revenue)"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="var(--dash-revenue)"
                                            stopOpacity={0.02}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    stroke="var(--dash-grid)"
                                    strokeDasharray="3 3"
                                />
                                <XAxis
                                    dataKey="short_label"
                                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    allowDecimals={false}
                                    width={40}
                                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    width={56}
                                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                    tickFormatter={(v) =>
                                        v >= 1000
                                            ? `${(v / 1000).toFixed(1)}k`
                                            : `${v}`
                                    }
                                />
                                <Tooltip
                                    contentStyle={tooltipContentStyle}
                                    formatter={(value, name) => {
                                        if (name === 'revenue') {
                                            return [
                                                formatPEN(Number(value)),
                                                'Ingresos pagados',
                                            ];
                                        }
                                        return [value, 'Pedidos'];
                                    }}
                                    labelFormatter={(_, payload) =>
                                        payload?.[0]?.payload?.date ?? ''
                                    }
                                />
                                <Legend />
                                <Bar
                                    yAxisId="left"
                                    dataKey="orders"
                                    name="Pedidos"
                                    fill="var(--dash-orders)"
                                    radius={[5, 5, 0, 0]}
                                    maxBarSize={36}
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Ingresos (S/)"
                                    stroke="var(--dash-revenue)"
                                    strokeWidth={2.5}
                                    fill="url(#dashRevenueFill)"
                                />
                            </ComposedChart>
                    </ResponsiveChart>
                </article>

                <div className="grid gap-4 lg:grid-cols-2">
                    <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-series-1)_22%,transparent)]">
                        <header className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-base font-semibold">
                                    <BarChart3 className="size-4 text-[var(--dash-series-1)]" />
                                    Pedidos por estado
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Barras horizontales — inventario de pedidos.
                                </p>
                            </div>
                        </header>
                        {ordersBarData.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Sin pedidos aún.
                            </p>
                        ) : (
                            <ResponsiveChart heightPx={CHART_H_CARD}>
                                    <BarChart
                                        data={ordersBarData}
                                        layout="vertical"
                                        margin={{ left: 8, right: 12 }}
                                    >
                                        <CartesianGrid
                                            stroke="var(--dash-grid)"
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 11,
                                                fill: 'var(--muted-foreground)',
                                            }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="label"
                                            width={118}
                                            tick={{
                                                fontSize: 11,
                                                fill: 'var(--muted-foreground)',
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={tooltipContentStyle}
                                            formatter={(v: number) => [v, 'Cantidad']}
                                        />
                                        <Bar
                                            dataKey="count"
                                            radius={[0, 6, 6, 0]}
                                            maxBarSize={28}
                                        >
                                            {ordersBarData.map((_, i) => (
                                                <Cell
                                                    key={ordersBarData[i].status}
                                                    fill={seriesAt(i)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                            </ResponsiveChart>
                        )}
                    </article>

                    <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-revenue)_22%,transparent)]">
                        <header className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-base font-semibold">
                                    <Layers3 className="size-4 text-[var(--dash-revenue)]" />
                                    Ventas por línea de negocio
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Pedidos pagados — total por categoría.
                                </p>
                            </div>
                        </header>
                        {!hasLineMix ? (
                            <p className="text-sm text-muted-foreground">
                                Aún no hay ventas atribuibles por línea, o los
                                productos no tienen categoría.
                            </p>
                        ) : (
                            <ResponsiveChart heightPx={CHART_H_CARD}>
                                    <BarChart
                                        data={revenueBarData}
                                        margin={{ bottom: 8 }}
                                    >
                                        <CartesianGrid
                                            stroke="var(--dash-grid)"
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tick={{
                                                fontSize: 10,
                                                fill: 'var(--muted-foreground)',
                                            }}
                                            interval={0}
                                            angle={-18}
                                            textAnchor="end"
                                            height={56}
                                        />
                                        <YAxis
                                            tickFormatter={(v) =>
                                                v >= 1000
                                                    ? `${(v / 1000).toFixed(1)}k`
                                                    : `${v}`
                                            }
                                            tick={{
                                                fontSize: 11,
                                                fill: 'var(--muted-foreground)',
                                            }}
                                            width={48}
                                        />
                                        <Tooltip
                                            contentStyle={tooltipContentStyle}
                                            formatter={(v: number) =>
                                                formatPEN(Number(v))
                                            }
                                        />
                                        <Bar
                                            dataKey="total"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={48}
                                        >
                                            {revenueBarData.map((_, i) => (
                                                <Cell
                                                    key={revenueBarData[i].label}
                                                    fill={seriesAt(i)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                            </ResponsiveChart>
                        )}
                    </article>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-series-3)_25%,transparent)]">
                        <header className="mb-4">
                            <h2 className="flex items-center gap-2 text-base font-semibold">
                                <BarChart3 className="size-4 text-[var(--dash-series-3)]" />
                                Cobros por pasarela (30 d)
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Suma con{' '}
                                <code className="rounded bg-muted px-1">
                                    paid_at
                                </code>{' '}
                                en el último mes.
                            </p>
                        </header>
                        {!hasGatewayData ? (
                            <p className="text-sm text-muted-foreground">
                                Sin cobros en el periodo.
                            </p>
                        ) : (
                            <ResponsiveChart heightPx={CHART_H_CARD}>
                                    <BarChart
                                        data={paymentsByGateway}
                                        layout="vertical"
                                        margin={{ left: 8, right: 8 }}
                                    >
                                        <CartesianGrid
                                            stroke="var(--dash-grid)"
                                            strokeDasharray="3 3"
                                        />
                                        <XAxis
                                            type="number"
                                            tickFormatter={(v) =>
                                                v >= 1000
                                                    ? `${(v / 1000).toFixed(1)}k`
                                                    : `${v}`
                                            }
                                            tick={{
                                                fontSize: 11,
                                                fill: 'var(--muted-foreground)',
                                            }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="gateway"
                                            width={88}
                                            tick={{
                                                fontSize: 11,
                                                fill: 'var(--muted-foreground)',
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={tooltipContentStyle}
                                            formatter={(v: number) =>
                                                formatPEN(v)
                                            }
                                        />
                                        <Bar
                                            dataKey="total"
                                            radius={[0, 8, 8, 0]}
                                            maxBarSize={32}
                                        >
                                            {paymentsByGateway.map((_, i) => (
                                                <Cell
                                                    key={paymentsByGateway[i].gateway}
                                                    fill={seriesAt(i + 1)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                            </ResponsiveChart>
                        )}
                    </article>

                    <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-series-4)_25%,transparent)]">
                        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h2 className="flex items-center gap-2 text-base font-semibold">
                                    <PieChartIcon className="size-4 text-[var(--dash-series-4)]" />
                                    Suscripciones por estado
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Barras + proporción (pastel).
                                </p>
                            </div>
                        </header>
                        {subscriptionsByStatus.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Sin suscripciones registradas.
                            </p>
                        ) : (
                            <div className="grid min-h-0 gap-4 md:grid-cols-2">
                                <ResponsiveChart heightPx={CHART_H_SPLIT}>
                                        <BarChart data={subsBarData}>
                                            <CartesianGrid
                                                stroke="var(--dash-grid)"
                                                strokeDasharray="3 3"
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={{
                                                    fontSize: 10,
                                                    fill: 'var(--muted-foreground)',
                                                }}
                                                interval={0}
                                                angle={-14}
                                                textAnchor="end"
                                                height={52}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                width={32}
                                                tick={{
                                                    fontSize: 11,
                                                    fill: 'var(--muted-foreground)',
                                                }}
                                            />
                                            <Tooltip
                                                contentStyle={tooltipContentStyle}
                                            />
                                            <Bar
                                                dataKey="count"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={40}
                                            >
                                                {subsBarData.map((_, i) => (
                                                    <Cell
                                                        key={subsBarData[i].label}
                                                        fill={seriesAt(i)}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                </ResponsiveChart>
                                <ResponsiveChart heightPx={CHART_H_SPLIT}>
                                        <PieChart>
                                            <Pie
                                                data={
                                                    subscriptionsByStatus as unknown as Record<
                                                        string,
                                                        unknown
                                                    >[]
                                                }
                                                dataKey="count"
                                                nameKey="status"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={72}
                                                paddingAngle={3}
                                                label={(props: {
                                                    status?: string;
                                                    count?: number;
                                                }) =>
                                                    `${subscriptionStatusLabel(props.status ?? '')}: ${props.count ?? 0}`
                                                }
                                            >
                                                {subscriptionsByStatus.map(
                                                    (_, i) => (
                                                        <Cell
                                                            key={
                                                                subscriptionsByStatus[
                                                                    i
                                                                ].status
                                                            }
                                                            fill={seriesAt(i)}
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={tooltipContentStyle}
                                                formatter={(value: number) => [
                                                    value,
                                                    'Cantidad',
                                                ]}
                                                labelFormatter={(s) =>
                                                    subscriptionStatusLabel(
                                                        String(s),
                                                    )
                                                }
                                            />
                                        </PieChart>
                                </ResponsiveChart>
                            </div>
                        )}
                    </article>
                </div>
            </div>
        </AppLayout>
    );
}
