import { router } from '@inertiajs/react';
import { Bot, Loader2, Pause, Play, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { saasColor } from '@/components/operacion/openwa/saasColors';
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
    SalesHubProductItem,
} from './types';

type Props = {
    products: SalesHubProductItem[];
    conversations: SalesHubConversationsPayload;
    indexUrl: string;
};

const ESTADOS = [
    { key: 'todos', label: 'Todas' },
    { key: 'activos', label: 'Bot activo' },
    { key: 'pausados', label: 'Pausadas' },
    { key: 'sin_producto', label: 'Sin SaaS detectado' },
];

export function SalesHubConversations({
    products,
    conversations,
    indexUrl,
}: Props) {
    const { data, meta, stats, filters } = conversations;
    const [search, setSearch] = useState(filters.search);
    const [openId, setOpenId] = useState<string | null>(null);
    const labelOf = (key: string | null) =>
        products.find((p) => p.key === key)?.label ?? key ?? 'Sin SaaS';

    const visit = (changes: Record<string, string | number | null>) => {
        router.get(
            indexUrl,
            {
                tab: 'conversaciones',
                filtro: filters.producto ?? '',
                estado: filters.estado,
                search,
                ...changes,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const open = data.find((c) => c.id === openId) ?? null;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                    ['Conversaciones', stats.total],
                    ['Bot activo', stats.activos],
                    ['Pausadas', stats.pausados],
                    ['Nuevas hoy', stats.hoy],
                ].map(([label, value]) => (
                    <NeuCardRaised key={label} className="rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground">
                            {label}
                        </p>
                        <p className="text-lg font-bold tabular-nums">
                            {value}
                        </p>
                    </NeuCardRaised>
                ))}
            </div>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { key: '', label: 'Todos' },
                            ...products.map((p) => ({
                                key: p.key,
                                label: p.label,
                            })),
                        ].map((item) => {
                            const active =
                                (filters.producto ?? '') === item.key;

                            return (
                                <button
                                    key={item.key || 'todos'}
                                    type="button"
                                    onClick={() =>
                                        visit({ filtro: item.key, page: 1 })
                                    }
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold',
                                        active
                                            ? 'bg-[#D28C3C]/15 text-[#D28C3C]'
                                            : 'text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    {item.key ? (
                                        <span
                                            className="size-2 rounded-full"
                                            style={{
                                                background: saasColor(item.key),
                                            }}
                                            aria-hidden
                                        />
                                    ) : null}
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex gap-3">
                        <select
                            className={cn(fieldClass, 'w-40 text-xs')}
                            value={filters.estado}
                            onChange={(e) =>
                                visit({ estado: e.target.value, page: 1 })
                            }
                            aria-label="Estado"
                        >
                            {ESTADOS.map((estado) => (
                                <option key={estado.key} value={estado.key}>
                                    {estado.label}
                                </option>
                            ))}
                        </select>
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
                                className={cn(fieldClass, 'w-48 pl-5 text-xs')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nombre o teléfono"
                                aria-label="Buscar"
                            />
                        </form>
                    </div>
                </div>

                {data.length === 0 ? (
                    <p className="mt-6 rounded-lg border border-dashed p-6 text-center text-[11px] text-muted-foreground">
                        Aún no hay conversaciones con estos filtros. Aparecen en
                        cuanto alguien le escribe a una línea con el bot
                        encendido.
                    </p>
                ) : (
                    <ul className="mt-4 divide-y divide-border/60">
                        {data.map((c) => (
                            <li key={c.id}>
                                <button
                                    type="button"
                                    onClick={() => setOpenId(c.id)}
                                    className="flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left hover:bg-muted/50"
                                >
                                    <span
                                        className="mt-1 size-2 shrink-0 rounded-full"
                                        style={{
                                            background: c.producto
                                                ? saasColor(c.producto)
                                                : 'var(--muted-foreground)',
                                        }}
                                        aria-hidden
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-2">
                                            <span className="truncate text-xs font-bold">
                                                {c.nombre ??
                                                    c.phone ??
                                                    'Sin nombre'}
                                            </span>
                                            {c.no_leidos > 0 ? (
                                                <span className="rounded-full bg-[#D28C3C] px-1.5 text-[10px] font-bold text-white">
                                                    {c.no_leidos}
                                                </span>
                                            ) : null}
                                        </span>
                                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                                            {c.ultimo_mensaje
                                                ? `${c.ultimo_mensaje.autor === 'cliente' ? '' : c.ultimo_mensaje.autor === 'bot' ? 'Bot: ' : 'Tú: '}${c.ultimo_mensaje.body}`
                                                : '—'}
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-right">
                                        <span className="block text-[10px] text-muted-foreground">
                                            {formatDateTime(
                                                c.last_inbound_at ??
                                                    c.created_at,
                                            )}
                                        </span>
                                        <span className="mt-0.5 block text-[10px]">
                                            {labelOf(c.producto)} ·{' '}
                                            <span
                                                className={
                                                    c.bot_activo
                                                        ? 'text-emerald-600'
                                                        : 'text-amber-600'
                                                }
                                            >
                                                {c.bot_activo
                                                    ? 'bot'
                                                    : (c.pausa_motivo ??
                                                      'pausado')}
                                            </span>
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {meta.last_page > 1 ? (
                    <div className="mt-4 flex items-center justify-end gap-2 text-[11px]">
                        <NeuButtonRaised
                            type="button"
                            disabled={meta.page <= 1}
                            onClick={() => visit({ page: meta.page - 1 })}
                        >
                            Anterior
                        </NeuButtonRaised>
                        <span className="text-muted-foreground">
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
                ) : null}
            </NeuCardRaised>

            <ConversationSheet
                conversation={open}
                productLabel={labelOf(open?.producto ?? null)}
                onClose={() => setOpenId(null)}
            />
        </div>
    );
}

function ConversationSheet({
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
                                    conversation.phone ??
                                    'Conversación'}
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
                            <div className="mt-2 flex items-center gap-2">
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
                                        : 'Reactivar bot'}
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
                                        {m.body}
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
