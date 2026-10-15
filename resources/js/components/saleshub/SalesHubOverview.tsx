import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    CircleDashed,
    RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { cn } from '@/lib/utils';

import { ConversationRow, ConversationSheet } from './SalesHubConversations';
import type { FieldSource } from './salesHubUi';
import {
    effectiveValue,
    fieldSource,
    formatDateTime,
    formatPrice,
    SECTION_TIPOS,
    sectionCounts,
    splitKeywords,
} from './salesHubUi';
import type {
    SalesHubConversationsPayload,
    SalesHubKnowledge,
    SalesHubKnowledgeForm,
    SalesHubTab,
} from './types';

type Props = {
    productLabel: string;
    knowledge: SalesHubKnowledge;
    conversations: SalesHubConversationsPayload;
    onTab: (tab: SalesHubTab) => void;
};

const FIELDS: {
    field: keyof SalesHubKnowledgeForm;
    label: string;
    optional?: boolean;
}[] = [
    { field: 'resumen', label: 'Qué es (resumen)' },
    { field: 'publico', label: 'Para quién es' },
    { field: 'palabras_clave', label: 'Palabras clave' },
    { field: 'demo_url', label: 'Demo' },
    { field: 'registro_url', label: 'Link de registro' },
    {
        field: 'instrucciones',
        label: 'Indicaciones del equipo',
        optional: true,
    },
];

export function SalesHubOverview({
    productLabel,
    knowledge,
    conversations,
    onTab,
}: Props) {
    const { stats } = conversations;
    const recent = conversations.data.slice(0, 5);
    const [openId, setOpenId] = useState<string | null>(null);
    const open = recent.find((c) => c.id === openId) ?? null;
    const blocks = sectionCounts(knowledge);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(
                    [
                        ['Conversaciones', stats.total],
                        ['Atiende el bot', stats.activos],
                        ['Respondes tú', stats.pausados],
                        ['Nuevas hoy', stats.hoy],
                    ] as const
                ).map(([label, value]) => (
                    <NeuCardRaised key={label} className="rounded-xl p-4">
                        <p className="text-[11px] text-muted-foreground">
                            {label}
                        </p>
                        <p className="mt-1 text-2xl font-bold tabular-nums">
                            {value}
                        </p>
                    </NeuCardRaised>
                ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-5">
                <NeuCardRaised className="rounded-2xl p-4 md:p-5 lg:col-span-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold">
                                Qué sabe el bot de {productLabel}
                            </h2>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                Lo que dejas vacío en ORVAE lo toma de{' '}
                                {productLabel}.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onTab('conocimiento')}
                            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#D28C3C] hover:underline"
                        >
                            Editar{' '}
                            <ArrowRight className="size-3.5" aria-hidden />
                        </button>
                    </div>

                    <ul className="mt-4 divide-y divide-border/60">
                        {FIELDS.map(({ field, label, optional }) => {
                            const source = fieldSource(knowledge, field);
                            const value = effectiveValue(knowledge, field);
                            const preview =
                                field === 'palabras_clave'
                                    ? splitKeywords(value).join(' · ')
                                    : value;

                            return (
                                <KnowledgeRow
                                    key={field}
                                    label={label}
                                    preview={preview}
                                    source={source}
                                    optional={optional}
                                    onClick={() => onTab('conocimiento')}
                                />
                            );
                        })}
                        <KnowledgeRow
                            label="Bloques (módulos, FAQ, objeciones…)"
                            preview={SECTION_TIPOS.filter(
                                (tipo) => (blocks.counts[tipo.key] ?? 0) > 0,
                            )
                                .map(
                                    (tipo) =>
                                        `${blocks.counts[tipo.key]} ${tipo.plural.toLowerCase()}`,
                                )
                                .join(' · ')}
                            source={blocks.source}
                            onClick={() => onTab('conocimiento')}
                        />
                    </ul>
                </NeuCardRaised>

                <NeuCardRaised className="rounded-2xl p-4 md:p-5 lg:col-span-2">
                    <div className="flex items-start justify-between gap-2">
                        <h2 className="text-sm font-bold">Planes y precios</h2>
                        <SourceBadge
                            source={knowledge.saas_ok ? 'saas' : 'falta'}
                        />
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <RefreshCw className="size-3" aria-hidden />
                        Se leen solos de {productLabel}. Cambia un precio allá y
                        el bot lo usa.
                    </p>

                    {!knowledge.saas_ok ? (
                        <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-300">
                            No pudimos leer {productLabel}. Mientras no
                            responda, el bot no dará precios.
                        </p>
                    ) : knowledge.planes.length === 0 ? (
                        <p className="mt-4 text-[11px] text-muted-foreground">
                            {productLabel} no publica planes.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-2.5">
                            {knowledge.planes.map((plan) => (
                                <li
                                    key={plan.codigo ?? plan.nombre}
                                    className="rounded-xl bg-muted/40 p-3"
                                >
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-xs font-bold">
                                            {plan.nombre}
                                        </span>
                                        <span className="text-sm font-bold tabular-nums">
                                            {formatPrice(
                                                plan.precio_mensual,
                                                plan.moneda,
                                            )}
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                /mes
                                            </span>
                                        </span>
                                    </div>
                                    {plan.incluye.length > 0 ? (
                                        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                                            {plan.incluye
                                                .slice(0, 4)
                                                .join(' · ')}
                                        </p>
                                    ) : null}
                                    {plan.trial_days > 0 ? (
                                        <p className="mt-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                            {plan.trial_days} días gratis
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    )}
                    {knowledge.saas_obtenido_at ? (
                        <p className="mt-3 text-[10px] text-muted-foreground">
                            Leído {formatDateTime(knowledge.saas_obtenido_at)}
                        </p>
                    ) : null}
                </NeuCardRaised>
            </div>

            <NeuCardRaised className="rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold">
                        Últimas conversaciones
                    </h2>
                    {stats.total > 0 ? (
                        <button
                            type="button"
                            onClick={() => onTab('conversaciones')}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D28C3C] hover:underline"
                        >
                            Ver todas{' '}
                            <ArrowRight className="size-3.5" aria-hidden />
                        </button>
                    ) : null}
                </div>
                {recent.length === 0 ? (
                    <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-[11px] text-muted-foreground">
                        Nadie ha preguntado por {productLabel} todavía.
                    </p>
                ) : (
                    <ul className="mt-2 divide-y divide-border/60">
                        {recent.map((c) => (
                            <ConversationRow
                                key={c.id}
                                conversation={c}
                                onOpen={() => setOpenId(c.id)}
                            />
                        ))}
                    </ul>
                )}
            </NeuCardRaised>

            <ConversationSheet
                conversation={open}
                productLabel={productLabel}
                onClose={() => setOpenId(null)}
            />
        </div>
    );
}

function KnowledgeRow({
    label,
    preview,
    source,
    optional = false,
    onClick,
}: {
    label: string;
    preview: string;
    source: FieldSource;
    optional?: boolean;
    onClick: () => void;
}) {
    const missing = source === 'falta';

    return (
        <li>
            <button
                type="button"
                onClick={onClick}
                className="flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left transition-colors hover:bg-muted/40"
            >
                {missing ? (
                    optional ? (
                        <CircleDashed
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden
                        />
                    ) : (
                        <AlertCircle
                            className="size-4 shrink-0 text-amber-600"
                            aria-hidden
                        />
                    )
                ) : (
                    <CheckCircle2
                        className="size-4 shrink-0 text-emerald-600"
                        aria-hidden
                    />
                )}
                <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold">{label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                        {preview ||
                            (optional
                                ? 'Opcional'
                                : 'Sin dato: el bot no lo mencionará')}
                    </span>
                </span>
                <SourceBadge source={source} optional={optional} />
            </button>
        </li>
    );
}

export function SourceBadge({
    source,
    optional = false,
}: {
    source: FieldSource;
    optional?: boolean;
}) {
    const styles: Record<FieldSource, [string, string]> = {
        orvae: ['ORVAE', 'bg-[#D28C3C]/15 text-[#B5762C]'],
        saas: ['Del SaaS', 'bg-sky-500/10 text-sky-700 dark:text-sky-400'],
        falta: [
            optional ? 'Vacío' : 'Falta',
            optional
                ? 'bg-muted text-muted-foreground'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
        ],
    };
    const [label, className] = styles[source];

    return (
        <span
            className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                className,
            )}
        >
            {label}
        </span>
    );
}
