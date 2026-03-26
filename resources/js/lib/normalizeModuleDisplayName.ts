/**
 * Algunos datos de `modules` llegan como texto con JSON: {"name":"..."}.
 * Devuelve el nombre legible para UI.
 */
export function normalizeModuleDisplayName(raw: string | null | undefined): string {
    const t = (raw ?? '').trim();
    if (t === '') {
        return '';
    }
    if (t.startsWith('{') && t.includes('"name"')) {
        try {
            const o = JSON.parse(t) as { name?: unknown };
            if (typeof o?.name === 'string') {
                const n = o.name.trim();
                if (n !== '') {
                    return n;
                }
            }
        } catch {
            /* usar texto tal cual */
        }
    }
    return t;
}
