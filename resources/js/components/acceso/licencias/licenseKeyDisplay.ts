export function licenseKeyStatusLabel(s: string): string {
    const map: Record<string, string> = {
        draft: 'Borrador',
        active: 'Activa',
        expired: 'Vencida',
        revoked: 'Revocada',
    };
    return map[s] ?? s;
}

export function licenseKeyStatusBadgeClass(s: string): string {
    if (s === 'draft') {
        return 'border-[#B8860B]/40 bg-[#B8860B]/12 text-[#D4A84B] shadow-sm';
    }
    if (s === 'active') {
        return 'border-[#4A9A72]/35 bg-[#4A9A72]/12 text-[#4A9A72] shadow-sm';
    }
    if (s === 'expired') {
        return 'border-border/80 bg-muted/80 text-muted-foreground shadow-sm';
    }
    if (s === 'revoked') {
        return 'border-[#C05050]/35 bg-[#C05050]/12 text-[#C05050] shadow-sm';
    }
    return 'border-border/60 bg-muted text-muted-foreground';
}

/** Muestra una versión corta de la clave en tabla (no oculta el valor completo en admin). */
export function formatLicenseKeyPreview(key: string, head = 10, tail = 6): string {
    if (!key) {
        return '—';
    }
    if (key.length <= head + tail + 3) {
        return key;
    }
    return `${key.slice(0, head)}…${key.slice(-tail)}`;
}
