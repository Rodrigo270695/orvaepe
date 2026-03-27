import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import * as React from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { panelPath } from '@/config/admin-panel';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

const UNREAD_POLL_MS = 15_000;

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const initial =
        typeof page.props.staffUnreadNotificationsCount === 'number'
            ? page.props.staffUnreadNotificationsCount
            : 0;
    const [unread, setUnread] = React.useState(initial);

    React.useEffect(() => {
        setUnread(initial);
    }, [initial]);

    React.useEffect(() => {
        const onCount = (e: Event) => {
            const detail = (e as CustomEvent<{ count: number }>).detail;
            if (detail && typeof detail.count === 'number') {
                setUnread(detail.count);
            }
        };
        window.addEventListener('orvae:staff-notifications-count', onCount);
        return () => window.removeEventListener('orvae:staff-notifications-count', onCount);
    }, []);

    React.useEffect(() => {
        let cancelled = false;

        const fetchCount = async () => {
            try {
                const res = await fetch(
                    '/panel/acceso-notificaciones/unread-count',
                    {
                        credentials: 'same-origin',
                        headers: { Accept: 'application/json' },
                    },
                );
                if (!res.ok || cancelled) {
                    return;
                }
                const data = (await res.json()) as { count?: number };
                if (typeof data.count === 'number' && !cancelled) {
                    setUnread(data.count);
                }
            } catch {
                /* ignorar errores de red */
            }
        };

        const id = window.setInterval(fetchCount, UNREAD_POLL_MS);
        return () => {
            cancelled = true;
            window.clearInterval(id);
        };
    }, []);

    const showBadge = unread > 0;
    const badgeLabel = unread > 99 ? '99+' : String(unread);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                <Link
                    href={panelPath('acceso-notificaciones')}
                    prefetch
                    className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--state-info)_28%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_6%,transparent)] text-[color-mix(in_oklab,var(--state-info)_82%,var(--foreground))] shadow-sm transition-colors hover:bg-[color-mix(in_oklab,var(--state-info)_12%,transparent)]"
                    aria-label={`Ver notificaciones${showBadge ? `, ${unread} sin leer` : ''}`}
                >
                    <Bell className="size-4" />
                    {showBadge ? (
                        <span
                            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--state-danger)_88%,black)] px-1 text-[10px] font-bold leading-none text-white shadow-sm"
                            aria-hidden
                        >
                            {badgeLabel}
                        </span>
                    ) : null}
                </Link>
            </div>
        </header>
    );
}
