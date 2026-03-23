import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import AccesoClientesFilters from '@/components/acceso/clientes/AccesoClientesFilters';
import AccesoClientesToolbar from '@/components/acceso/clientes/AccesoClientesToolbar';
import type { ClientUserRow } from '@/components/acceso/clientes/clienteUserTypes';
import { formatClientFullName } from '@/components/sales/orders/orderDisplay';

type Props = {
    users: any;
    initialQuery: string;
    initialDateFrom: string;
    initialDateTo: string;
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
}: Props) {
    const rows: ClientUserRow[] = (users?.data ?? []) as ClientUserRow[];
    const totalUsers = users?.total ?? rows.length;

    const columns: AdminCrudTableColumn<ClientUserRow>[] = [
        {
            header: 'Cliente',
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
            header: 'Documento',
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs',
            render: (r) => r.document_number?.trim() || '—',
        },
        {
            header: 'Teléfono',
            cellClassName: 'px-3 py-2 align-middle text-sm',
            render: (r) => r.phone?.trim() || '—',
        },
        {
            header: 'Usuario',
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs text-[#4A80B8]',
            render: (r) => r.username,
        },
        {
            header: 'Correo verificado',
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
            header: 'Alta',
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
            emptyState="No hay usuarios cliente en este rango. Ajusta fechas o búsqueda o registra cuentas con rol client."
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
