import type {
    SalesHubKnowledge,
    SalesHubKnowledgeForm,
    SalesHubSectionTipo,
} from './types';

export const fieldClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent px-0 py-2 text-sm outline-none transition-colors focus:border-[var(--o-amber)]/60 disabled:opacity-60';

export const SECTION_TIPOS: {
    key: SalesHubSectionTipo;
    label: string;
    plural: string;
    help: string;
}[] = [
    {
        key: 'modulo',
        label: 'Módulo',
        plural: 'Módulos',
        help: 'Qué hace el sistema. El bot conecta un módulo con el problema que le cuenta el cliente.',
    },
    {
        key: 'faq',
        label: 'Pregunta frecuente',
        plural: 'Preguntas frecuentes',
        help: 'Lo que siempre preguntan: SUNAT, soporte, migración de datos, si funciona en celular…',
    },
    {
        key: 'objecion',
        label: 'Objeción',
        plural: 'Objeciones',
        help: 'Qué responder cuando dicen «es caro», «ya uso Excel» o «lo pienso».',
    },
    {
        key: 'novedad',
        label: 'Novedad',
        plural: 'Novedades',
        help: 'Lo nuevo del sistema. El bot lo usa como gancho, una por mensaje.',
    },
    {
        key: 'general',
        label: 'General',
        plural: 'Otros datos',
        help: 'Cualquier dato útil que no encaje en lo anterior.',
    },
];

export function sectionTipoLabel(tipo: string): string {
    return SECTION_TIPOS.find((item) => item.key === tipo)?.label ?? tipo;
}

export type FieldSource = 'orvae' | 'saas' | 'falta';

export function fieldSource(
    knowledge: SalesHubKnowledge,
    field: keyof SalesHubKnowledgeForm,
): FieldSource {
    if (knowledge.form[field].trim() !== '') {
        return 'orvae';
    }

    return knowledge.saas[field].trim() !== '' ? 'saas' : 'falta';
}

export function effectiveValue(
    knowledge: SalesHubKnowledge,
    field: keyof SalesHubKnowledgeForm,
): string {
    return knowledge.form[field].trim() || knowledge.saas[field].trim();
}

/** Bloques que usa el bot hoy: los de ORVAE si hay alguno activo; si no, los del SaaS. */
export function sectionCounts(knowledge: SalesHubKnowledge): {
    source: FieldSource;
    counts: Partial<Record<SalesHubSectionTipo, number>>;
} {
    const active = knowledge.sections.filter((section) => section.activo);

    if (active.length > 0) {
        const counts: Partial<Record<SalesHubSectionTipo, number>> = {};
        active.forEach((section) => {
            counts[section.tipo] = (counts[section.tipo] ?? 0) + 1;
        });

        return { source: 'orvae', counts };
    }

    const total = Object.values(knowledge.saas_tipos).reduce(
        (sum, n) => sum + (n ?? 0),
        0,
    );

    return {
        source: total > 0 ? 'saas' : 'falta',
        counts: knowledge.saas_tipos,
    };
}

export function splitKeywords(value: string): string[] {
    return [
        ...new Set(
            value
                .split(/[,\n]+/)
                .map((item) => item.trim())
                .filter(Boolean),
        ),
    ];
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
