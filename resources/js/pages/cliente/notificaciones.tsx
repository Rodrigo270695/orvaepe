import { Link, router } from '@inertiajs/react';
import { Bell, Check, Mail } from 'lucide-react';
import { useCallback, useState } from 'react';

import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import { Button } from '@/components/ui/button';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import cliente from '@/routes/cliente';

type NotificationRow = {
    id: string;
    type: string;
    channel: string;
    data: Record<string, unknown>;
    read_at: string | null;
    created_at: string | null;
};

type Props = {
    notifications: NotificationRow[];
};

function formatDate(iso: string | null): string {
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

function channelLabel(channel: string): string {
    const map: Record<string, string> = {
        email: 'Correo',
        in_app: 'En la app',
    };
    return map[channel] ?? channel;
}

function pickTitle(n: NotificationRow): string {
    const d = n.data;
    if (d && typeof d.title === 'string' && d.title.trim()) {
        return d.title;
    }
    if (d && typeof d.message === 'string' && d.message.trim()) {
        return d.message;
    }
    const short = n.type.split('\\').pop() ?? n.type;
    return short.replace(/([A-Z])/g, ' $1').trim() || 'Aviso';
}

function pickBody(n: NotificationRow): string | null {
    const d = n.data;
    if (d && typeof d.body === 'string' && d.body.trim()) {
        return d.body;
    }
    if (d && typeof d.message === 'string' && d.message.trim() && pickTitle(n) !== d.message) {
        return d.message;
    }
    return null;
}

export default function ClienteNotificaciones({
    notifications,
}: Props) {
    const [busyId, setBusyId] = useState<string | null>(null);

    const markRead = useCallback((id: string) => {
        setBusyId(id);
        router.patch(
            cliente.notifications.markRead.url(id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyId(null),
            },
        );
    }, []);

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <ClientPortalLayout
            title="Notificaciones"
            headTitle="Notificaciones — Área del cliente"
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Notificaciones' },
            ]}
        >
            <div className="mx-auto max-w-3xl space-y-5">
                <ClientPageTitleCard title="Notificaciones" />

                {unreadCount > 0 ? (
                    <p className="text-sm text-zinc-600">
                        Tienes{' '}
                        <span className="font-semibold text-zinc-900">
                            {unreadCount}
                        </span>{' '}
                        {unreadCount === 1 ? 'aviso sin leer' : 'avisos sin leer'}
                        .
                    </p>
                ) : (
                    <p className="text-sm text-zinc-500">
                        No hay avisos sin leer.
                    </p>
                )}

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="rounded-full bg-zinc-100 p-4">
                            <Bell
                                className="size-10 text-zinc-400"
                                aria-hidden
                            />
                        </div>
                        <p className="mt-4 text-lg font-medium text-zinc-800">
                            Aún no tienes notificaciones
                        </p>
                        <p className="mt-2 max-w-sm text-sm text-zinc-500">
                            Cuando haya novedades sobre pedidos, facturación o
                            tu cuenta, aparecerán aquí.
                        </p>
                        <Button
                            asChild
                            variant="default"
                            className="mt-6 bg-zinc-500 text-white shadow-sm hover:bg-zinc-600 hover:text-white"
                        >
                            <Link href="/cliente" prefetch>
                                Volver al panel
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {notifications.map((n) => {
                            const unread = !n.read_at;
                            const title = pickTitle(n);
                            const body = pickBody(n);

                            return (
                                <li key={n.id}>
                                    <article
                                        className={`rounded-xl border bg-white p-4 shadow-sm transition-shadow ${
                                            unread
                                                ? 'border-violet-200 ring-1 ring-violet-100'
                                                : 'border-zinc-200'
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {n.channel === 'email' ? (
                                                        <Mail
                                                            className="size-4 shrink-0 text-zinc-400"
                                                            aria-hidden
                                                        />
                                                    ) : (
                                                        <Bell
                                                            className="size-4 shrink-0 text-zinc-400"
                                                            aria-hidden
                                                        />
                                                    )}
                                                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                                        {channelLabel(
                                                            n.channel,
                                                        )}
                                                    </span>
                                                    {unread && (
                                                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                                                            Nuevo
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className="mt-2 text-base font-semibold text-zinc-900">
                                                    {title}
                                                </h2>
                                                {body ? (
                                                    <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                                                        {body}
                                                    </p>
                                                ) : null}
                                                <p className="mt-3 text-xs text-zinc-400">
                                                    {formatDate(n.created_at)}
                                                </p>
                                            </div>
                                            {unread ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="shrink-0 gap-1"
                                                    disabled={busyId === n.id}
                                                    onClick={() =>
                                                        markRead(n.id)
                                                    }
                                                >
                                                    <Check className="size-4" />
                                                    Marcar leída
                                                </Button>
                                            ) : null}
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </ClientPortalLayout>
    );
}
