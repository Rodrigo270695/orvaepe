import { useMemo } from 'react';
import { BarChart3, ListChecks } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';

import { InformesResponsiveChart } from '@/components/informes/InformesResponsiveChart';
import {
    CHART_H_CARD,
    formatPEN,
    seriesAt,
    tooltipContentStyle,
} from '@/components/informes/metrics';

type RevenueLine = { key: string; label: string; total: number };

export type InformesLineasViewProps = {
    revenueByLine: RevenueLine[];
};

export default function InformesLineasView({
    revenueByLine,
}: InformesLineasViewProps) {
    const total = useMemo(
        () => revenueByLine.reduce((s, r) => s + r.total, 0),
        [revenueByLine],
    );

    const rows = useMemo(
        () =>
            revenueByLine.map((r) => ({
                ...r,
                pct: total > 0 ? (r.total / total) * 100 : 0,
            })),
        [revenueByLine, total],
    );

    const chartData = useMemo(
        () => revenueByLine.map((r) => ({ label: r.label, total: r.total })),
        [revenueByLine],
    );

    const hasData = revenueByLine.some((r) => r.total > 0);

    return (
        <div className="flex flex-col gap-4">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <ListChecks className="size-4 text-[#D28C3C]" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold">
                                Ingresos por línea de negocio
                            </h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Suma de líneas de pedido en órdenes pagadas,
                                agrupadas por la línea de ingreso de la
                                categoría del producto.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                        <BarChart3 className="size-3.5" />
                        Total {formatPEN(total)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                        Líneas {revenueByLine.length}
                    </span>
                </div>
            </NeuCardRaised>

            <article className="neumorph rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-revenue)_22%,transparent)]">
                <header className="mb-4">
                    <h2 className="flex items-center gap-2 text-base font-semibold">
                        <BarChart3 className="size-4 text-[var(--dash-revenue)]" />
                        Distribución por línea
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Comparación de importes (PEN) entre líneas.
                    </p>
                </header>
                {!hasData ? (
                    <p className="text-sm text-muted-foreground">
                        Aún no hay ventas atribuibles por línea, o los productos
                        no tienen categoría con línea de ingreso.
                    </p>
                ) : (
                    <InformesResponsiveChart heightPx={CHART_H_CARD}>
                        <BarChart data={chartData} margin={{ bottom: 8 }}>
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
                                angle={-16}
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
                                {chartData.map((_, i) => (
                                    <Cell
                                        key={chartData[i].label}
                                        fill={seriesAt(i)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </InformesResponsiveChart>
                )}
            </article>

            <NeuCardRaised className="rounded-xl p-0 overflow-hidden">
                <div className="border-b border-border/60 px-4 py-3">
                    <h2 className="text-sm font-bold">Detalle por línea</h2>
                    <p className="text-[11px] text-muted-foreground">
                        Importe y participación sobre el total.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border/60 bg-muted/30 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium">
                                    Línea
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Clave
                                </th>
                                <th className="px-4 py-2.5 text-right font-medium">
                                    Importe
                                </th>
                                <th className="px-4 py-2.5 text-right font-medium">
                                    % del total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        Sin datos.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr
                                        key={row.key}
                                        className="border-b border-border/40 last:border-0"
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {row.label}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                            {row.key}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                                            {formatPEN(row.total)}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                            {total > 0
                                                ? `${row.pct.toFixed(1)} %`
                                                : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </NeuCardRaised>
        </div>
    );
}
