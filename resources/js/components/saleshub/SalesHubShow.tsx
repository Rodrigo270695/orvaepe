import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    LayoutDashboard,
    MessagesSquare,
    Phone,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { useState } from 'react';

import { saasColor } from '@/components/operacion/openwa/saasColors';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { cn } from '@/lib/utils';

import { SalesHubConversations } from './SalesHubConversations';
import { SalesHubKnowledgeEditor } from './SalesHubKnowledgeEditor';
import { SalesHubOverview } from './SalesHubOverview';
import { fieldSource } from './salesHubUi';
import type { SalesHubPageProps, SalesHubTab } from './types';

export function SalesHubShow({
    tab: initialTab,
    product,
    knowledge,
    conversations,
    routes,
}: SalesHubPageProps) {
    const [tab, setTab] = useState<SalesHubTab>(initialTab);
    const color = saasColor(product.key);
    const missing = (
        ['resumen', 'palabras_clave', 'demo_url', 'registro_url'] as const
    ).filter((field) => fieldSource(knowledge, field) === 'falta').length;

    const changeTab = (next: SalesHubTab) => {
        setTab(next);
        router.get(
            routes.show,
            { tab: next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const tabs: {
        key: SalesHubTab;
        label: string;
        icon: typeof BookOpen;
        badge?: string | number;
    }[] = [
        { key: 'resumen', label: 'Resumen', icon: LayoutDashboard },
        {
            key: 'conversaciones',
            label: 'Conversaciones',
            icon: MessagesSquare,
            badge: conversations.stats.total || undefined,
        },
        {
            key: 'conocimiento',
            label: 'Conocimiento',
            icon: BookOpen,
            badge: missing > 0 ? `Falta ${missing}` : undefined,
        },
    ];

    return (
        <div
            className="space-y-5"
            style={{ '--hub-color': color } as CSSProperties}
        >
            <Link
                href={routes.openwa}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-3.5" aria-hidden /> Líneas de OpenWA
            </Link>

            <NeuCardRaised className="relative overflow-hidden rounded-2xl p-5 md:p-6">
                <span
                    className="absolute inset-y-0 left-0 w-1.5 bg-[var(--hub-color)]"
                    aria-hidden
                />
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <span
                            className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm"
                            style={{ background: color }}
                            aria-hidden
                        >
                            {product.label.charAt(0)}
                        </span>
                        <div>
                            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                Centro de Ventas
                            </p>
                            <h1 className="text-xl font-bold md:text-2xl">
                                {product.label}
                            </h1>
                        </div>
                    </div>
                    <BotStatus product={product} />
                </div>

                {product.lines.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                        {product.lines.map((line) => (
                            <li
                                key={line.id}
                                className="inline-flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-1.5 text-[11px]"
                            >
                                <span
                                    className={cn(
                                        'size-2 rounded-full',
                                        line.is_ready
                                            ? 'bg-emerald-500'
                                            : 'bg-red-500',
                                    )}
                                    aria-hidden
                                />
                                <span className="font-semibold">
                                    {line.nombre}
                                </span>
                                {line.phone ? (
                                    <span className="inline-flex items-center gap-1 text-muted-foreground tabular-nums">
                                        <Phone className="size-3" aria-hidden />
                                        +{line.phone}
                                    </span>
                                ) : null}
                                <span className="text-muted-foreground">
                                    ·{' '}
                                    {line.is_ready
                                        ? 'conectada'
                                        : 'desconectada'}{' '}
                                    · bot{' '}
                                    {line.bot_activo ? 'encendido' : 'apagado'}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </NeuCardRaised>

            <nav
                className="flex gap-1 overflow-x-auto border-b"
                role="tablist"
                aria-label="Secciones"
            >
                {tabs.map(({ key, label, icon: Icon, badge }) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={tab === key}
                        onClick={() => changeTab(key)}
                        className={cn(
                            '-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors',
                            tab === key
                                ? 'border-[var(--hub-color)] text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Icon className="size-4" aria-hidden />
                        {label}
                        {badge !== undefined ? (
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums',
                                    typeof badge === 'string'
                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {badge}
                            </span>
                        ) : null}
                    </button>
                ))}
            </nav>

            {tab === 'resumen' ? (
                <SalesHubOverview
                    productLabel={product.label}
                    knowledge={knowledge}
                    conversations={conversations}
                    onTab={changeTab}
                />
            ) : null}
            {tab === 'conversaciones' ? (
                <SalesHubConversations
                    productLabel={product.label}
                    conversations={conversations}
                    showUrl={routes.show}
                />
            ) : null}
            {tab === 'conocimiento' ? (
                <SalesHubKnowledgeEditor
                    productLabel={product.label}
                    knowledge={knowledge}
                />
            ) : null}
        </div>
    );
}

function BotStatus({ product }: { product: SalesHubPageProps['product'] }) {
    const selling = product.lines.some(
        (line) => line.is_ready && line.bot_activo,
    );
    const [ok, title, detail] = !product.bot_global
        ? [
              false,
              'Bot de ventas apagado',
              'Está desactivado en la configuración de ORVAE (SALESHUB_BOT_ENABLED).',
          ]
        : product.lines.length === 0
          ? [
                false,
                'Ninguna línea lo vende',
                'Vincúlalo a una línea en el tablero de OpenWA.',
            ]
          : selling
            ? [
                  true,
                  'El bot lo está vendiendo',
                  'Responde solo en las líneas conectadas con el bot encendido.',
              ]
            : [
                  false,
                  'No está respondiendo',
                  'Conecta la línea o enciende su bot en OpenWA.',
              ];

    return (
        <div
            className={cn(
                'flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 md:max-w-xs',
                ok ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            )}
        >
            <span
                className={cn(
                    'mt-1 size-2.5 shrink-0 rounded-full',
                    ok ? 'animate-pulse bg-emerald-500' : 'bg-amber-500',
                )}
                aria-hidden
            />
            <div>
                <p
                    className={cn(
                        'text-xs font-bold',
                        ok
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-amber-800 dark:text-amber-300',
                    )}
                >
                    {title}
                </p>
                <p className="text-[11px] text-muted-foreground">{detail}</p>
            </div>
        </div>
    );
}
