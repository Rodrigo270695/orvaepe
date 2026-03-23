export function oemDeliveryStatusLabel(s: string): string {
    const map: Record<string, string> = {
        pending: 'Pendiente',
        delivered: 'Entregada',
        revoked: 'Revocada',
    };
    return map[s] ?? s;
}

export function oemDeliveryStatusBadgeClass(s: string): string {
    if (s === 'pending') {
        return 'bg-[#B8860B]/12 text-[#D4A84B]';
    }
    if (s === 'delivered') {
        return 'bg-[#4A9A72]/15 text-[#4A9A72]';
    }
    if (s === 'revoked') {
        return 'bg-[#C05050]/15 text-[#C05050]';
    }
    return 'bg-muted text-muted-foreground';
}

export function previewPayloadText(
    value: string | null,
    head = 28,
    tail = 6,
): string {
    if (!value) {
        return '—';
    }
    const t = value.trim();
    if (t.length <= head + tail + 3) {
        return t;
    }
    return `${t.slice(0, head)}…${t.slice(-tail)}`;
}
