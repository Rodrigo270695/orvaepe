import { router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import AccesoClientesFilters from '@/components/acceso/clientes/AccesoClientesFilters';
import AccesoClientesMobileCards from '@/components/acceso/clientes/AccesoClientesMobileCards';
import AccesoClientesToolbar from '@/components/acceso/clientes/AccesoClientesToolbar';
import type { ClientUserRow } from '@/components/acceso/clientes/clienteUserTypes';
import { formatClientFullName } from '@/components/sales/orders/orderDisplay';

type Props = {
    users: any;
    initialQuery: string;
    initialDateFrom: string;
    initialDateTo: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

function formatDateTime(iso: string) {
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

export default function AccesoClientesIndex({
    users,
    initialQuery,
    initialDateFrom,
    initialDateTo,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const rows: ClientUserRow[] = (users?.data ?? []) as ClientUserRow[];
    const totalUsers = users?.total ?? rows.length;
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

    const emptyState =
        'No hay usuarios cliente en este rango. Ajusta fechas o búsqueda o registra cuentas con rol client.';

    const columns: AdminCrudTableColumn<ClientUserRow>[] = [
        {
            header: sortableHeader('Cliente', 'name'),
            cellClassName: 'px-3 py-2 align-middle max-w-[16rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {formatClientFullName({
                            name: r.name,
                            lastname: r.lastname,
                            email: r.email,
                            document_number: r.document_number,
                        })}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                        {r.email}
                    </span>
                </div>
            ),
        },
        {
            header: sortableHeader('Documento', 'document_number'),
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs',
            render: (r) => r.document_number?.trim() || '—',
        },
        {
            header: 'Teléfono',
            cellClassName: 'px-3 py-2 align-middle text-sm',
            render: (r) => r.phone?.trim() || '—',
        },
        {
            header: sortableHeader('Usuario', 'username'),
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs text-[#4A80B8]',
            render: (r) => r.username,
        },
        {
            header: sortableHeader('Correo verificado', 'email_verified_at'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) =>
                r.email_verified_at ? (
                    <span className="inline-flex items-center rounded-full bg-[#4A9A72]/15 px-2 py-0.5 text-xs text-[#4A9A72]">
                        Sí
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        No
                    </span>
                ),
        },
        {
            header: sortableHeader('Alta', 'created_at'),
            cellClassName:
                'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDateTime(r.created_at),
        },
    ];

    return (
        <AdminCrudIndex<ClientUserRow>
            rows={rows}
            paginator={users ?? null}
            rowKey={(r) => String(r.id)}
            columns={columns}
            emptyState={emptyState}
            renderMobileRows={({ rows: mobileRows }) => (
                <AccesoClientesMobileCards
                    rows={mobileRows}
                    emptyMessage={emptyState}
                />
            )}
            renderToolbar={() => (
                <AccesoClientesToolbar totalUsers={totalUsers} />
            )}
            renderAboveTable={() => (
                <AccesoClientesFilters
                    initialQuery={initialQuery}
                    initialDateFrom={initialDateFrom}
                    initialDateTo={initialDateTo}
                    className="mt-1"
                />
            )}
        />
    );
}
