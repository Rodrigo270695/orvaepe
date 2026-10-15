import { router } from '@inertiajs/react';
import {
    Bot,
    Loader2,
    MessagesSquare,
    Pause,
    Play,
    Search,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { fieldClass, formatDateTime } from './salesHubUi';
import type {
    SalesHubConversation,
    SalesHubConversationsPayload,
    SalesHubMessage,
} from './types';

type Props = {
    productLabel: string;
    conversations: SalesHubConversationsPayload;
    showUrl: string;
};

const ESTADOS = [
    { key: 'todos', label: 'Todas' },
    { key: 'activos', label: 'Atiende el bot' },
    { key: 'pausados', label: 'Respondes tú' },
];

export function SalesHubConversations({
    productLabel,
    conversations,
    showUrl,
}: Props) {
    const { data, meta, filters } = conversations;
    const [search, setSearch] = useState(filters.search);
    const [openId, setOpenId] = useState<string | null>(null);

    const visit = (changes: Record<string, string | number>) => {
        router.get(
            showUrl,
            {
                tab: 'conversaciones',
                estado: filters.estado,
                search,
                ...changes,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const open = data.find((c) => c.id === openId) ?? null;

    return (
        <NeuCardRaised className="rounded-2xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div
                    className="flex flex-wrap gap-1.5"
                    role="tablist"
                    aria-label="Estado"
                >
                    {ESTADOS.map((estado) => (
                        <button
                            key={estado.key}
                            type="button"
                            role="tab"
                            aria-selected={filters.estado === estado.key}
                            onClick={() =>
                                visit({ estado: estado.key, page: 1 })
                            }
                            className={cn(
                                'rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors',
                                filters.estado === estado.key
                                    ? 'bg-[#D28C3C]/15 text-[#D28C3C]'
                                    : 'text-muted-foreground hover:bg-muted',
                            )}
                        >
                            {estado.label}
                        </button>
                    ))}
                </div>
                <form
                    className="relative"
                    onSubmit={(e) => {
                        e.preventDefault();
                        visit({ page: 1 });
                    }}
                >
                    <Search
                        className="absolute top-2.5 left-0 size-3.5 text-muted-foreground"
                        aria-hidden
                    />
                    <input
                        className={cn(
                            fieldClass,
                            'w-full pl-5 text-xs md:w-56',
                        )}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o teléfono"
                        aria-label="Buscar conversación"
                    />
                </form>
            </div>

            {data.length === 0 ? (
                <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
                    <MessagesSquare
                        className="size-6 text-muted-foreground"
                        aria-hidden
                    />
                    <p className="text-xs font-semibold">
                        Sin conversaciones aquí
                    </p>
                    <p className="max-w-sm text-[11px] text-muted-foreground">
                        Aparecen en cuanto alguien pregunta por {productLabel}{' '}
                        en una línea con el bot encendido.
                    </p>
                </div>
            ) : (
                <ul className="mt-4 divide-y divide-border/60">
                    {data.map((c) => (
                        <ConversationRow
                            key={c.id}
                            conversation={c}
                            onOpen={() => setOpenId(c.id)}
                        />
                    ))}
                </ul>
            )}

            {meta.last_page > 1 ? (
                <div className="mt-4 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-muted-foreground">
                        {meta.total} conversaciones
                    </span>
                    <div className="flex items-center gap-2">
                        <NeuButtonRaised
                            type="button"
                            disabled={meta.page <= 1}
                            onClick={() => visit({ page: meta.page - 1 })}
                        >
                            Anterior
                        </NeuButtonRaised>
                        <span className="text-muted-foreground tabular-nums">
                            {meta.page} / {meta.last_page}
                        </span>
                        <NeuButtonRaised
                            type="button"
                            disabled={meta.page >= meta.last_page}
                            onClick={() => visit({ page: meta.page + 1 })}
                        >
                            Siguiente
                        </NeuButtonRaised>
                    </div>
                </div>
            ) : null}

            <ConversationSheet
                conversation={open}
                productLabel={productLabel}
                onClose={() => setOpenId(null)}
            />
        </NeuCardRaised>
    );
}

export function ConversationRow({
    conversation: c,
    onOpen,
}: {
    conversation: SalesHubConversation;
    onOpen: () => void;
}) {
    const author =
        c.ultimo_mensaje?.autor === 'bot'
            ? 'Bot: '
            : c.ultimo_mensaje?.autor === 'humano'
              ? 'Tú: '
              : '';

    return (
        <li>
            <button
                type="button"
                onClick={onOpen}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-muted/50"
            >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {(c.nombre ?? c.phone ?? '?').charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold">
                            {c.nombre ??
                                (c.phone ? `+${c.phone}` : 'Sin nombre')}
                        </span>
                        {c.no_leidos > 0 ? (
                            <span className="rounded-full bg-[#D28C3C] px-1.5 text-[10px] font-bold text-white">
                                {c.no_leidos}
                            </span>
                        ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {c.ultimo_mensaje
                            ? `${author}${c.ultimo_mensaje.body}`
                            : '—'}
                    </span>
                </span>
                <span className="shrink-0 text-right">
                    <span className="block text-[10px] text-muted-foreground tabular-nums">
                        {formatDateTime(c.last_inbound_at ?? c.created_at)}
                    </span>
                    <span
                        className={cn(
                            'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            c.bot_activo
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                        )}
                    >
                        {c.bot_activo ? (
                            <Bot className="size-3" aria-hidden />
                        ) : (
                            <User className="size-3" aria-hidden />
                        )}
                        {c.bot_activo ? 'Bot' : 'Tú'}
                    </span>
                </span>
            </button>
        </li>
    );
}

export function ConversationSheet({
    conversation,
    productLabel,
    onClose,
}: {
    conversation: SalesHubConversation | null;
    productLabel: string;
    onClose: () => void;
}) {
    const [loaded, setLoaded] = useState<{
        url: string;
        messages: SalesHubMessage[] | null;
        error: string | null;
    } | null>(null);
    const [toggling, setToggling] = useState(false);
    const url = conversation?.routes.show ?? null;
    const messages = loaded?.url === url ? loaded.messages : null;
    const error = loaded?.url === url ? loaded.error : null;

    useEffect(() => {
        if (!url) {
            return;
        }

        let cancelled = false;

        fetch(url, {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((response) =>
                response.ok
                    ? response.json()
                    : Promise.reject(new Error(`HTTP ${response.status}`)),
            )
            .then((json: { messages: SalesHubMessage[] }) => {
                if (!cancelled) {
                    setLoaded({ url, messages: json.messages, error: null });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setLoaded({
                        url,
                        messages: null,
                        error: 'No se pudo cargar la conversación.',
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [url]);

    const toggleBot = () => {
        if (!conversation) {
            return;
        }

        setToggling(true);
        router.post(
            conversation.bot_activo
                ? conversation.routes.pausar
                : conversation.routes.reanudar,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setToggling(false),
            },
        );
    };

    return (
        <Sheet
            open={conversation !== null}
            onOpenChange={(value) => !value && onClose()}
        >
            <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
                {conversation ? (
                    <>
                        <SheetHeader className="border-b p-4">
                            <SheetTitle className="text-sm">
                                {conversation.nombre ??
                                    (conversation.phone
                                        ? `+${conversation.phone}`
                                        : 'Conversación')}
                            </SheetTitle>
                            <SheetDescription className="text-[11px]">
                                {conversation.phone
                                    ? `+${conversation.phone} · `
                                    : ''}
                                {productLabel}
                                {conversation.linea
                                    ? ` · ${conversation.linea}`
                                    : ''}
                            </SheetDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <NeuButtonRaised
                                    type="button"
                                    onClick={toggleBot}
                                    disabled={toggling}
                                    className="px-3 py-1.5"
                                >
                                    {toggling ? (
                                        <Loader2
                                            className="size-3.5 animate-spin"
                                            aria-hidden
                                        />
                                    ) : conversation.bot_activo ? (
                                        <Pause
                                            className="size-3.5"
                                            aria-hidden
                                        />
                                    ) : (
                                        <Play
                                            className="size-3.5"
                                            aria-hidden
                                        />
                                    )}
                                    {conversation.bot_activo
                                        ? 'Pausar bot (respondo yo)'
                                        : 'Devolverle el chat al bot'}
                                </NeuButtonRaised>
                                {!conversation.bot_activo &&
                                conversation.pausa_motivo ? (
                                    <span className="text-[10px] text-amber-600">
                                        {conversation.pausa_motivo}
                                    </span>
                                ) : null}
                            </div>
                        </SheetHeader>

                        <div className="flex-1 space-y-2 overflow-y-auto bg-muted/30 p-4">
                            {error ? (
                                <p className="text-center text-[11px] text-destructive">
                                    {error}
                                </p>
                            ) : null}
                            {messages === null && !error ? (
                                <p className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                                    <Loader2
                                        className="size-3.5 animate-spin"
                                        aria-hidden
                                    />{' '}
                                    Cargando…
                                </p>
                            ) : null}
                            {messages?.map((m) => (
                                <div
                                    key={m.id}
                                    className={cn(
                                        'flex',
                                        m.direccion === 'out'
                                            ? 'justify-end'
                                            : 'justify-start',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[85%] rounded-2xl px-3 py-2 text-[12px] whitespace-pre-wrap shadow-sm',
                                            m.direccion === 'out'
                                                ? m.autor === 'bot'
                                                    ? 'bg-[#D28C3C]/15'
                                                    : 'bg-emerald-500/15'
                                                : 'bg-background',
                                        )}
                                    >
                                        {m.direccion === 'out' ? (
                                            <span className="mb-0.5 flex items-center gap-1 text-[9px] font-semibold text-muted-foreground uppercase">
                                                {m.autor === 'bot' ? (
                                                    <Bot
                                                        className="size-3"
                                                        aria-hidden
                                                    />
                                                ) : (
                                                    <User
                                                        className="size-3"
                                                        aria-hidden
                                                    />
                                                )}
                                                {m.autor === 'bot'
                                                    ? 'Bot'
                                                    : 'Tú'}
                                            </span>
                                        ) : null}
                                        {m.tipo === 'audio' ? '🎤 ' : ''}
                                        <WhatsAppText text={m.body} />
                                        <span className="mt-1 block text-right text-[9px] text-muted-foreground">
                                            {formatDateTime(m.at)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}

/** Muestra *negrita* y _cursiva_ como en WhatsApp. */
function WhatsAppText({ text }: { text: string }) {
    const parts = text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g);

    return (
        <>
            {parts.map((part, index) => {
                if (
                    part.length > 2 &&
                    part.startsWith('*') &&
                    part.endsWith('*')
                ) {
                    return <strong key={index}>{part.slice(1, -1)}</strong>;
                }

                if (
                    part.length > 2 &&
                    part.startsWith('_') &&
                    part.endsWith('_')
                ) {
                    return <em key={index}>{part.slice(1, -1)}</em>;
                }

                return part;
            })}
        </>
    );
}
