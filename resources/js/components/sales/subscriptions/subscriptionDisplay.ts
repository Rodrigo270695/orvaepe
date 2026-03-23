import type { SubscriptionRow } from '@/components/sales/subscriptions/subscriptionTypes';

export function subscriptionStatusLabel(s: string): string {
    const map: Record<string, string> = {
        trialing: 'Prueba',
        active: 'Activa',
        past_due: 'Vencida',
        paused: 'Pausada',
        cancelled: 'Cancelada',
    };
    return map[s] ?? s;
}

export function subscriptionStatusBadgeClass(s: string): string {
    if (s === 'active') {
        return 'bg-[#4A9A72]/15 text-[#4A9A72]';
    }
    if (s === 'trialing') {
        return 'bg-[#4A80B8]/15 text-[#4A80B8]';
    }
    if (s === 'past_due') {
        return 'bg-[#D28C3C]/15 text-[#D28C3C]';
    }
    if (s === 'paused') {
        return 'bg-muted text-muted-foreground';
    }
    if (s === 'cancelled') {
        return 'bg-[#C05050]/15 text-[#C05050]';
    }
    return 'bg-muted text-muted-foreground';
}

export function formatClientFullName(
    user: SubscriptionRow['user'],
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

export function formatSubscriptionPeriod(
    start: string | null,
    end: string | null,
): string {
    if (!start && !end) {
        return '—';
    }
    const fmt = (iso: string) => {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) {
            return '—';
        }
        return d.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };
    if (start && end) {
        return `${fmt(start)} → ${fmt(end)}`;
    }
    return fmt(start ?? end ?? '');
}

export function subscriptionItemsSummary(row: SubscriptionRow): string {
    const n = row.items_count ?? 0;
    if (n === 0) {
        return '0';
    }
    const first = row.items?.[0]?.catalog_sku?.name;
    if (n === 1 && first) {
        return first;
    }
    if (first) {
        return `${first} +${n - 1}`;
    }
    return String(n);
}
