import type { SalesHubSectionTipo } from './types';

export const fieldClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent px-0 py-2 text-sm outline-none transition-colors focus:border-[var(--o-amber)]/60 disabled:opacity-60';

export const SECTION_TIPOS: { key: SalesHubSectionTipo; label: string }[] = [
    { key: 'modulo', label: 'Módulo / funcionalidad' },
    { key: 'faq', label: 'Pregunta frecuente' },
    { key: 'objecion', label: 'Objeción' },
    { key: 'novedad', label: 'Novedad' },
    { key: 'general', label: 'General' },
];

export function sectionTipoLabel(tipo: string): string {
    return SECTION_TIPOS.find((item) => item.key === tipo)?.label ?? tipo;
}

export function formatDateTime(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatPrice(value: number | null, moneda: string): string {
    if (value === null) {
        return 'a consultar';
    }

    return `${moneda === 'PEN' ? 'S/' : `${moneda} `}${value.toFixed(2)}`;
}
