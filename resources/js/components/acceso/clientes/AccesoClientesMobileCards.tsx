import type { ClientUserRow } from '@/components/acceso/clientes/clienteUserTypes';
import { formatClientFullName } from '@/components/sales/orders/orderDisplay';

type Props = {
    rows: ClientUserRow[];
    emptyMessage: string;
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

export default function AccesoClientesMobileCards({
    rows,
    emptyMessage,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground neumorph-inset">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/60 neumorph-inset">
            {rows.map((row, idx) => (
                <div
                    key={row.id}
                    className={[
                        'px-3 py-3',
                        idx > 0 ? 'border-t border-border/75' : '',
                        idx % 2 === 1 ? 'bg-black/3' : '',
                    ].join(' ')}
                >
                    <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium leading-snug text-foreground">
                            {formatClientFullName({
                                name: row.name,
                                lastname: row.lastname,
                                email: row.email,
                                document_number: row.document_number,
                            })}
                        </p>
                        <p className="truncate text-[10px] font-mono text-muted-foreground">
                            {row.email}
                        </p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div>
                            <p className="text-muted-foreground">Documento</p>
                            <p className="font-mono text-foreground">
                                {row.document_number?.trim() || '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Teléfono</p>
                            <p className="text-foreground">
                                {row.phone?.trim() || '—'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Usuario</p>
                            <p className="break-all font-mono text-[#4A80B8]">
                                {row.username}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                Correo verificado
                            </p>
                            <p>
                                {row.email_verified_at ? (
                                    <span className="inline-flex items-center rounded-full bg-[#4A9A72]/15 px-2 py-0.5 text-xs text-[#4A9A72]">
                                        Sí
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                        No
                                    </span>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Alta</p>
                            <p className="text-muted-foreground">
                                {formatDateTime(row.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
