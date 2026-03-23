export function webhookProcessedLabel(processed: boolean): string {
    return processed ? 'Procesado' : 'Pendiente';
}

export function webhookProcessedBadgeClass(processed: boolean): string {
    return processed
        ? 'bg-[#4A9A72]/15 text-[#4A9A72]'
        : 'bg-[#B8860B]/12 text-[#D4A84B]';
}

export function previewText(value: string | null, head = 36, tail = 8): string {
    if (!value) {
        return '—';
    }
    const t = value.trim();
    if (t.length <= head + tail + 3) {
        return t;
    }
    return `${t.slice(0, head)}…${t.slice(-tail)}`;
}

export function previewWebhookPayload(payload: unknown): string {
    if (payload == null) {
        return '—';
    }
    try {
        const s =
            typeof payload === 'string'
                ? payload
                : JSON.stringify(payload);
        return previewText(s, 48, 12);
    } catch {
        return '—';
    }
}
