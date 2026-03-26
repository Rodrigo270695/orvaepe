import { router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import {
    formatClientFullName,
    formatDateShort,
    formatDateTime,
} from '@/components/acceso/entitlements/entitlementDisplay';

type NotificationRow = {
    id: string;
    user: {
        id: number | string;
        name: string;
        lastname?: string | null;
        email: string;
    } | null;
    type: string;
    channel: string;
    subject: string | null;
    message: string | null;
    status: string;
    error: string | null;
    created_at: string;
    read_at: string | null;
    sent_at: string | null;
};

type Props = {
    notifications: any;
    initialQuery: string;
    initialStatus: string;
    initialChannel: string;
    initialDateFrom: string;
    initialDateTo: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

export default function AccesoNotificationsIndex({
    notifications,
    initialQuery,
    initialStatus,
    initialChannel,
    initialDateFrom,
    initialDateTo,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const rows: NotificationRow[] = (notifications?.data ?? []) as NotificationRow[];
    const total = notifications?.total ?? rows.length;

    const handleSort = (sortBy: string) => {
        const currentUrl = new URL(page.url, window.location.origin);
        const currentSortBy = currentUrl.searchParams.get('sort_by') ?? initialSortBy ?? '';
        const currentSortDir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ?? initialSortDir;
        const nextDir: 'asc' | 'desc' =
            currentSortBy === sortBy && currentSortDir === 'asc' ? 'desc' : 'asc';

        currentUrl.searchParams.set('sort_by', sortBy);
        currentUrl.searchParams.set('sort_dir', nextDir);
        currentUrl.searchParams.set('page', '1');

        router.get(currentUrl.pathname + currentUrl.search, {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const sortIcon = (key: string) => {
        if (initialSortBy !== key) return <ArrowUpDown className="size-3.5 opacity-70" />;
        return initialSortDir === 'asc' ? (
            <ArrowUp className="size-3.5 text-[#4A80B8]" />
        ) : (
            <ArrowDown className="size-3.5 text-[#4A80B8]" />
        );
    };

    const sortableHeader = (label: string, key: string) => (
        <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground"
            onClick={() => handleSort(key)}
        >
            <span>{label}</span>
            {sortIcon(key)}
        </button>
    );

    const columns: AdminCrudTableColumn<NotificationRow>[] = [
        {
            header: 'Usuario',
            cellClassName: 'px-3 py-2 align-middle max-w-[13rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {formatClientFullName(r.user ?? null)}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                        {r.user?.email ?? '—'}
                    </span>
                </div>
            ),
        },
        {
            header: sortableHeader('Canal', 'channel'),
            cellClassName: 'px-3 py-2 align-middle text-xs',
            render: (r) => (
                <span className="inline-flex items-center rounded-full bg-[color-mix(in_oklab,var(--state-info)_8%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--state-info)_80%,var(--foreground))]">
                    {r.channel}
                </span>
            ),
        },
        {
            header: 'Asunto',
            cellClassName: 'px-3 py-2 align-middle text-sm max-w-[18rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="line-clamp-2 font-medium text-foreground">
                        {r.subject ?? '(Sin asunto)'}
                    </span>
                    <span className="line-clamp-1 text-[11px] text-muted-foreground">
                        {r.message ?? ''}
                    </span>
                </div>
            ),
        },
        {
            header: sortableHeader('Estado', 'status'),
            cellClassName: 'px-3 py-2 align-middle text-xs',
            render: (r) => {
                const base =
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium';
                const cls =
                    r.status === 'sent'
                        ? 'bg-[color-mix(in_oklab,var(--state-success)_10%,transparent)] text-[color-mix(in_oklab,var(--state-success)_80%,var(--foreground))]'
                        : r.status === 'failed'
                          ? 'bg-[color-mix(in_oklab,var(--state-danger)_10%,transparent)] text-[color-mix(in_oklab,var(--state-danger)_80%,var(--foreground))]'
                          : 'bg-[color-mix(in_oklab,var(--state-alert)_10%,transparent)] text-[color-mix(in_oklab,var(--state-alert)_80%,var(--foreground))]';
                return <span className={`${base} ${cls}`}>{r.status}</span>;
            },
        },
        {
            header: 'Error',
            cellClassName: 'px-3 py-2 align-middle text-[11px] text-muted-foreground max-w-[14rem]',
            render: (r) => (r.error ? <span className="line-clamp-2">{r.error}</span> : '—'),
        },
        {
            header: sortableHeader('Leída', 'read_at'),
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => (r.read_at ? formatDateShort(r.read_at) : '—'),
        },
        {
            header: sortableHeader('Enviada', 'sent_at'),
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => (r.sent_at ? formatDateTime(r.sent_at) : '—'),
        },
        {
            header: sortableHeader('Creada', 'created_at'),
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.created_at),
        },
    ];

    return (
        <AdminCrudIndex<NotificationRow>
            rows={rows}
            paginator={notifications ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay notificaciones registradas. Cuando existan filas en notifications, aparecerán aquí."
        />
    );
}

