/** Helpers compartidos (tabla + móvil) — mismos estilos que el resto del panel. */

import type { OrderRow } from '@/components/sales/orders/orderTypes';

export function orderStatusLabel(s: string): string {
    const map: Record<string, string> = {
        draft: 'Borrador',
        pending_payment: 'Pendiente de pago',
        paid: 'Pagado',
        cancelled: 'Cancelado',
        refunded: 'Reembolsado',
    };
    return map[s] ?? s;
}

export function orderStatusBadgeClass(s: string): string {
    if (s === 'paid') {
        return 'bg-[#4A9A72]/15 text-[#4A9A72]';
    }
    if (s === 'pending_payment') {
        return 'bg-[#D28C3C]/15 text-[#D28C3C]';
    }
    if (s === 'cancelled' || s === 'refunded') {
        return 'bg-[#C05050]/15 text-[#C05050]';
    }
    return 'bg-muted text-muted-foreground';
}

export function formatClientFullName(
    user: OrderRow['user'],
): string {
    if (!user) {
        return '—';
    }
    const parts = [user.name, user.lastname].filter(
        (x): x is string => Boolean(x && String(x).trim()),
    );
    const joined = parts.join(' ').trim();
    return joined || user.name || '—';
}

export function orderCanDelete(status: string): boolean {
    return status === 'draft' || status === 'pending_payment';
}

export function formatOrderMoney(amount: string, currency: string): string {
    const n = Number.parseFloat(amount);
    if (Number.isNaN(n)) {
        return `${currency} ${amount}`;
    }
    return `${currency} ${n.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
