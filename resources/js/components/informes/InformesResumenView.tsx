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
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';

import { InformesResponsiveChart } from '@/components/informes/InformesResponsiveChart';
import {
    CHART_H_CARD,
    CHART_H_MAIN,
    CHART_H_SPLIT,
    formatPEN,
    orderStatusLabel,
    seriesAt,
    subscriptionStatusLabel,
    tooltipContentStyle,
} from '@/components/informes/metrics';

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

export type InformesResumenViewProps = {
    kpis: Kpis;
    dailyChart: DailyPoint[];
    ordersByStatus: NamedCount[];
    revenueByLine: RevenueLine[];
    paymentsByGateway: GatewayRow[];
    subscriptionsByStatus: NamedCount[];
};

export default function InformesResumenView({
    kpis,
    dailyChart,
    ordersByStatus,
    revenueByLine,
    paymentsByGateway,
    subscriptionsByStatus,
}: InformesResumenViewProps) {
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
        <div className="flex flex-col gap-4">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <BarChart3 className="size-4 text-[#D28C3C]" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold">
                                Resumen comercial
                            </h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                KPIs, tendencia diaria y reparto por estado —
                                mismos datos que el panel operativo.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                        <Wallet className="size-3.5" />
                        30 días {formatPEN(kpis.revenue_paid_last_30d)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                        <ShoppingCart className="size-3.5" />
                        Pedidos {kpis.orders_total}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                        <TrendingUp className="size-3.5" />
                        Suscripciones {kpis.subscriptions_active}
                    </span>
                </div>
            </NeuCardRaised>

            <div className="grid auto-rows-min gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <KpiNeu
                    accentVar="--dash-revenue"
                    icon={<Wallet className="size-4 text-[var(--dash-revenue)]" />}
                    label="Ingresos (30 días, pagado)"
                    value={formatPEN(kpis.revenue_paid_last_30d)}
                    sub={
                        <>
                            Total histórico:{' '}
                            <span className="font-medium text-[var(--dash-revenue)]">
                                {formatPEN(kpis.revenue_paid_all)}
                            </span>
                        </>
                    }
                />
                <KpiNeu
                    accentVar="--dash-orders"
                    icon={
                        <ShoppingCart className="size-4 text-[var(--dash-orders)]" />
                    }
                    label="Pedidos"
                    value={String(kpis.orders_total)}
                    sub={
                        <>
                            <span className="text-[var(--dash-series-2)]">
                                Pagados {kpis.orders_paid}
                            </span>
                            {' · '}
                            <span className="text-[var(--dash-series-5)]">
                                Pendiente {kpis.orders_pending_payment}
                            </span>
                        </>
                    }
                />
                <KpiNeu
                    accentVar="--dash-series-4"
                    icon={
                        <TrendingUp className="size-4 text-[var(--dash-series-4)]" />
                    }
                    label="Suscripciones activas"
                    value={String(kpis.subscriptions_active)}
                    sub={
                        <>
                            Entitlements:{' '}
                            <span className="font-medium text-[var(--dash-series-2)]">
                                {kpis.entitlements_active}
                            </span>
                        </>
                    }
                />
                <KpiNeu
                    accentVar="--dash-series-5"
                    icon={<Webhook className="size-4 text-[var(--dash-series-5)]" />}
                    label="Webhooks sin procesar"
                    value={String(kpis.webhooks_pending)}
                    sub={
                        kpis.webhooks_pending > 0 ? (
                            <span className="inline-flex items-center gap-1">
                                <AlertTriangle className="size-3.5 text-[var(--dash-series-5)]" />
                                Revisar cola
                            </span>
                        ) : (
                            <span className="text-[var(--dash-revenue)]">
                                Cola al día
                            </span>
                        )
                    }
                />
            </div>

            <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-orders)_25%,transparent)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                            <Activity className="size-4 text-[var(--dash-orders)]" />
                            Últimos {dailyChart.length} días
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Barras: pedidos colocados · Área: ingresos pagados.
                        </p>
                    </div>
                </div>
                <InformesResponsiveChart heightPx={CHART_H_MAIN}>
                    <ComposedChart data={dailyChart}>
                        <defs>
                            <linearGradient
                                id="informesRevenueFill"
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
                            formatter={(value, _name, item) => {
                                if (item?.dataKey === 'revenue') {
                                    return [
                                        formatPEN(Number(value)),
                                        'Ingresos',
                                    ];
                                }
                                if (item?.dataKey === 'orders') {
                                    return [value, 'Pedidos'];
                                }
                                return [value, String(item?.name ?? '')];
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
                            fill="url(#informesRevenueFill)"
                        />
                    </ComposedChart>
                </InformesResponsiveChart>
            </article>

            <div className="grid gap-4 lg:grid-cols-2">
                <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-series-1)_22%,transparent)]">
                    <header className="mb-4">
                        <h2 className="flex items-center gap-2 text-base font-semibold">
                            <BarChart3 className="size-4 text-[var(--dash-series-1)]" />
                            Pedidos por estado
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Inventario de pedidos por estado.
                        </p>
                    </header>
                    {ordersBarData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Sin pedidos aún.
                        </p>
                    ) : (
                        <InformesResponsiveChart heightPx={CHART_H_CARD}>
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
                        </InformesResponsiveChart>
                    )}
                </article>

                <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-revenue)_22%,transparent)]">
                    <header className="mb-4">
                        <h2 className="flex items-center gap-2 text-base font-semibold">
                            <Layers3 className="size-4 text-[var(--dash-revenue)]" />
                            Ventas por línea de negocio
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Pedidos pagados — total por categoría.
                        </p>
                    </header>
                    {!hasLineMix ? (
                        <p className="text-sm text-muted-foreground">
                            Aún no hay ventas atribuibles por línea.
                        </p>
                    ) : (
                        <InformesResponsiveChart heightPx={CHART_H_CARD}>
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
                                    formatter={(v: number) => formatPEN(Number(v))}
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
                        </InformesResponsiveChart>
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
                    </header>
                    {!hasGatewayData ? (
                        <p className="text-sm text-muted-foreground">
                            Sin cobros en el periodo.
                        </p>
                    ) : (
                        <InformesResponsiveChart heightPx={CHART_H_CARD}>
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
                                    formatter={(v: number) => formatPEN(v)}
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
                        </InformesResponsiveChart>
                    )}
                </article>

                <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-series-4)_25%,transparent)]">
                    <header className="mb-4">
                        <h2 className="flex items-center gap-2 text-base font-semibold">
                            <PieChartIcon className="size-4 text-[var(--dash-series-4)]" />
                            Suscripciones por estado
                        </h2>
                    </header>
                    {subscriptionsByStatus.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Sin suscripciones registradas.
                        </p>
                    ) : (
                        <div className="grid min-h-0 gap-4 md:grid-cols-2">
                            <InformesResponsiveChart heightPx={CHART_H_SPLIT}>
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
                                    <Tooltip contentStyle={tooltipContentStyle} />
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
                            </InformesResponsiveChart>
                            <InformesResponsiveChart heightPx={CHART_H_SPLIT}>
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
                                        {subscriptionsByStatus.map((_, i) => (
                                            <Cell
                                                key={subscriptionsByStatus[i].status}
                                                fill={seriesAt(i)}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={tooltipContentStyle}
                                        formatter={(value: number) => [
                                            value,
                                            'Cantidad',
                                        ]}
                                        labelFormatter={(s) =>
                                            subscriptionStatusLabel(String(s))
                                        }
                                    />
                                </PieChart>
                            </InformesResponsiveChart>
                        </div>
                    )}
                </article>
            </div>

            <div className="grid auto-rows-min gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniKpi
                    accentVar="--dash-series-6"
                    icon={<Users className="size-4 text-[var(--dash-series-6)]" />}
                    label="Usuarios / clientes"
                    value={`${kpis.users_total} (${kpis.clients_total} clientes)`}
                />
                <MiniKpi
                    accentVar="--dash-series-3"
                    icon={<Boxes className="size-4 text-[var(--dash-series-3)]" />}
                    label="Catálogo activo"
                    value={`${kpis.products_active} prod. · ${kpis.skus_active} SKUs`}
                />
                <MiniKpi
                    accentVar="--dash-series-1"
                    icon={
                        <CreditCard className="size-4 text-[var(--dash-series-1)]" />
                    }
                    label="Cupones activos"
                    value={String(kpis.coupons_active)}
                />
                <MiniKpi
                    accentVar="--o-tech"
                    icon={<FileText className="size-4 text-[var(--o-tech)]" />}
                    label="Releases / auditoría"
                    value={`${kpis.releases_total} ver. · ${kpis.audit_logs_7d} evt. (7 d)`}
                />
            </div>
        </div>
    );
}

function KpiNeu({
    accentVar,
    icon,
    label,
    value,
    sub,
}: {
    accentVar: string;
    icon: ReactNode;
    label: string;
    value: string;
    sub: ReactNode;
}) {
    return (
        <div
            className="neumorph rounded-2xl border-l-4 p-4"
            style={{ borderLeftColor: `var(${accentVar})` }}
        >
            <div
                className="mb-3 inline-flex rounded-xl p-2"
                style={{
                    background: `color-mix(in oklab, var(${accentVar}) 18%, transparent)`,
                }}
            >
                {icon}
            </div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
        </div>
    );
}

function MiniKpi({
    accentVar,
    icon,
    label,
    value,
}: {
    accentVar: string;
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div
            className="neumorph rounded-2xl border-l-4 p-4"
            style={{ borderLeftColor: `var(${accentVar})` }}
        >
            <div
                className="mb-2 inline-flex rounded-lg p-2"
                style={{
                    background: `color-mix(in oklab, var(${accentVar}) 16%, transparent)`,
                }}
            >
                {icon}
            </div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
    );
}
