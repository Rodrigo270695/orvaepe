export function secretKindLabel(kind: string): string {
    const map: Record<string, string> = {
        api_key: 'API key',
        hmac_secret: 'HMAC',
        oauth_refresh: 'OAuth refresh',
        certificate: 'Certificado',
        custom: 'Personalizado',
    };
    return map[kind] ?? kind;
}

export function secretKindBadgeClass(kind: string): string {
    if (kind === 'api_key') {
        return 'bg-[#4A80B8]/15 text-[#4A80B8]';
    }
    if (kind === 'certificate') {
        return 'bg-[#D28C3C]/15 text-[#D28C3C]';
    }
    if (kind === 'oauth_refresh') {
        return 'bg-[#8B5CF6]/15 text-[#8B5CF6]';
    }
    if (kind === 'hmac_secret') {
        return 'bg-[#4A9A72]/15 text-[#4A9A72]';
    }
    return 'bg-muted text-muted-foreground';
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
