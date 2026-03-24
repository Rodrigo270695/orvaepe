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
                    <p className="text-sm text-muted-foreground">
                        Tienes{' '}
                        <span className="font-semibold text-foreground">
                            {unreadCount}
                        </span>{' '}
                        {unreadCount === 1 ? 'aviso sin leer' : 'avisos sin leer'}
                        .
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No hay avisos sin leer.
                    </p>
                )}

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[color-mix(in_oklab,var(--state-info)_28%,var(--border))] bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] px-6 py-16 text-center shadow-sm">
                        <div className="rounded-full bg-[color-mix(in_oklab,var(--state-info)_12%,transparent)] p-4">
                            <Bell
                                className="size-10 text-[color-mix(in_oklab,var(--state-info)_55%,var(--foreground))]"
                                aria-hidden
                            />
                        </div>
                        <p className="mt-4 text-lg font-medium text-foreground">
                            Aún no tienes notificaciones
                        </p>
                        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                            Cuando haya novedades sobre pedidos, facturación o
                            tu cuenta, aparecerán aquí.
                        </p>
                        <Button
                            asChild
                            variant="default"
                            className="mt-6 bg-[linear-gradient(120deg,var(--state-info),var(--state-success))] text-white shadow-sm hover:brightness-105 hover:text-white"
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
                                        className={`rounded-xl border bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] p-4 shadow-sm transition-shadow ${
                                            unread
                                                ? 'border-[color-mix(in_oklab,var(--state-info)_35%,var(--border))] ring-1 ring-[color-mix(in_oklab,var(--state-info)_16%,transparent)]'
                                                : 'border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))]'
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {n.channel === 'email' ? (
                                                        <Mail
                                                            className="size-4 shrink-0 text-[color-mix(in_oklab,var(--state-info)_55%,var(--foreground))]"
                                                            aria-hidden
                                                        />
                                                    ) : (
                                                        <Bell
                                                            className="size-4 shrink-0 text-[color-mix(in_oklab,var(--state-info)_55%,var(--foreground))]"
                                                            aria-hidden
                                                        />
                                                    )}
                                                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                        {channelLabel(
                                                            n.channel,
                                                        )}
                                                    </span>
                                                    {unread && (
                                                        <span className="rounded-full border border-[color-mix(in_oklab,var(--state-success)_32%,var(--border))] bg-[color-mix(in_oklab,var(--state-success)_14%,transparent)] px-2 py-0.5 text-xs font-medium text-[color-mix(in_oklab,var(--state-success)_72%,var(--foreground))]">
                                                            Nuevo
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className="mt-2 text-base font-semibold text-foreground">
                                                    {title}
                                                </h2>
                                                {body ? (
                                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                        {body}
                                                    </p>
                                                ) : null}
                                                <p className="mt-3 text-xs text-muted-foreground">
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
