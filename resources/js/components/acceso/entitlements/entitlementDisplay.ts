export function entitlementStatusLabel(s: string): string {
    const map: Record<string, string> = {
        pending: 'Pendiente',
        active: 'Activo',
        expired: 'Vencido',
        suspended: 'Suspendido',
        revoked: 'Revocado',
    };
    return map[s] ?? s;
}

export function entitlementStatusBadgeClass(s: string): string {
    if (s === 'active') {
        return 'bg-[#4A9A72]/15 text-[#4A9A72]';
    }
    if (s === 'pending') {
        return 'bg-[#D28C3C]/15 text-[#D28C3C]';
    }
    if (s === 'expired') {
        return 'bg-muted text-muted-foreground';
    }
    if (s === 'suspended') {
        return 'bg-[#8B5CF6]/15 text-[#8B5CF6]';
    }
    if (s === 'revoked') {
        return 'bg-[#C05050]/15 text-[#C05050]';
    }
    return 'bg-muted text-muted-foreground';
}

export function formatClientFullName(
    user: {
        name: string;
        lastname: string | null;
    } | null,
): string {
    if (!user) {
        return '—';
    }
    const parts = [user.name, user.lastname].filter(
        (x): x is string => Boolean(x && String(x).trim()),
    );
    return parts.length ? parts.join(' ') : user.name || '—';
}

export function formatDateShort(iso: string | null): string {
    if (!iso) {
        return '—';
    }
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

export function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
