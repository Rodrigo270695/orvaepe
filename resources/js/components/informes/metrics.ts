/** Utilidades compartidas informes / gráficos operativos (alineado a app.css --dash-*) */

export const DASH_SERIES = [
    'var(--dash-series-1)',
    'var(--dash-series-2)',
    'var(--dash-series-3)',
    'var(--dash-series-4)',
    'var(--dash-series-5)',
    'var(--dash-series-6)',
] as const;

export function seriesAt(i: number): string {
    return DASH_SERIES[i % DASH_SERIES.length] ?? DASH_SERIES[0];
}

export const tooltipContentStyle = {
    background: 'var(--dash-tooltip-bg)',
    border: '1px solid var(--dash-tooltip-border)',
    borderRadius: '10px',
    fontSize: '12px',
};

export const CHART_H_MAIN = 320;
export const CHART_H_CARD = 256;
export const CHART_H_SPLIT = 224;

export function formatPEN(n: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(n);
}

export function orderStatusLabel(status: string): string {
    const m: Record<string, string> = {
        draft: 'Borrador',
        pending_payment: 'Pago pendiente',
        paid: 'Pagado',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado',
    };
    return m[status] ?? status;
}

export function subscriptionStatusLabel(status: string): string {
    const m: Record<string, string> = {
        trialing: 'Prueba',
        active: 'Activa',
        past_due: 'Vencida',
        paused: 'Pausada',
        cancelled: 'Cancelada',
    };
    return m[status] ?? status;
}
