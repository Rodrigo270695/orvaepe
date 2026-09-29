export type PlanPeriod = 'monthly' | 'annual' | 'two_years' | 'three_years';

export type DeliveryRow = {
    id: string;
    ruc: string;
    legal_name: string;
    product_description: string;
    includes_igv: boolean;
    delivered_at: string | null;
    plan_period: PlanPeriod | string | null;
    plan_ends_at: string | null;
    has_invoice: boolean;
    has_xml: boolean;
    invoice_original_name: string | null;
    xml_original_name: string | null;
    created_at: string | null;
};

export const planPeriodOptions: { value: PlanPeriod; label: string }[] = [
    { value: 'monthly', label: 'Mensual' },
    { value: 'annual', label: 'Anual' },
    { value: 'two_years', label: '2 años' },
    { value: 'three_years', label: '3 años' },
];

export function planPeriodLabel(period: string | null | undefined): string {
    return (
        planPeriodOptions.find((option) => option.value === period)?.label ??
        '—'
    );
}

function monthsForPlan(period: PlanPeriod): number {
    if (period === 'monthly') {
        return 1;
    }
    if (period === 'two_years') {
        return 24;
    }
    if (period === 'three_years') {
        return 36;
    }
    return 12;
}

export function planEndDate(startYmd: string, period: PlanPeriod): string {
    const [year, month, day] = startYmd.split('-').map(Number);
    if (!year || !month || !day) {
        return '';
    }
    const target = new Date(year, month - 1 + monthsForPlan(period), 1);
    const lastDay = new Date(
        target.getFullYear(),
        target.getMonth() + 1,
        0,
    ).getDate();
    const result = new Date(
        target.getFullYear(),
        target.getMonth(),
        Math.min(day, lastDay),
    );
    const y = result.getFullYear();
    const m = String(result.getMonth() + 1).padStart(2, '0');
    const d = String(result.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function deliveryInvoiceUrl(id: string): string {
    return `/panel/ventas-entregas/${id}/factura`;
}

export function deliveryXmlUrl(id: string): string {
    return `/panel/ventas-entregas/${id}/xml`;
}

export function formatDeliveryDate(ymd: string | null | undefined): string {
    if (!ymd) {
        return '—';
    }
    const [year, month, day] = ymd.split('-').map(Number);
    if (!year || !month || !day) {
        return ymd;
    }
    return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
