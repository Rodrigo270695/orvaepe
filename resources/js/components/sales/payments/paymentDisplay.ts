import { formatOrderMoney } from '@/components/sales/orders/orderDisplay';
import type { PaymentRow } from '@/components/sales/payments/ventasPagosTypes';

export function paymentStatusLabel(s: string): string {
    const map: Record<string, string> = {
        completed: 'Completado',
        pending: 'Pendiente',
        processing: 'Procesando',
        failed: 'Fallido',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado',
    };
    return map[s] ?? s;
}

export function paymentStatusBadgeClass(s: string): string {
    if (s === 'completed') {
        return 'bg-[#4A9A72]/15 text-[#4A9A72]';
    }
    if (s === 'pending' || s === 'processing') {
        return 'bg-[#D28C3C]/15 text-[#D28C3C]';
    }
    if (s === 'failed' || s === 'cancelled' || s === 'refunded') {
        return 'bg-[#C05050]/15 text-[#C05050]';
    }
    return 'bg-muted text-muted-foreground';
}

export function formatPaymentMoney(row: PaymentRow): string {
    return formatOrderMoney(row.amount, row.currency);
}

export function truncateGatewayId(id: string | null, max = 14): string {
    if (id == null || id === '') {
        return '—';
    }
    const t = id.trim();
    if (t.length <= max) {
        return t;
    }
    return `${t.slice(0, max)}…`;
}
