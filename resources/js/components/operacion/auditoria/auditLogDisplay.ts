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

export function previewJsonValues(value: unknown): string {
    if (value == null) {
        return '—';
    }
    try {
        const s =
            typeof value === 'string' ? value : JSON.stringify(value);
        return previewText(s, 40, 10);
    } catch {
        return '—';
    }
}
