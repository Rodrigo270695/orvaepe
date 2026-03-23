import * as React from 'react';

import { cn } from '@/lib/utils';

export type AdminCrudTableColumn<T> = {
    header: React.ReactNode;
    cellClassName?: string;
    headerClassName?: string;
    /**
     * Render del contenido de la celda.
     */
    render: (row: T) => React.ReactNode;
};

export type AdminCrudTableProps<T> = {
    rows: T[];
    rowKey: (row: T) => string;
    columns: AdminCrudTableColumn<T>[];
    /**
     * Texto cuando `rows` está vacío.
     */
    emptyState?: string;
};

export default function AdminCrudTable<T>({
    rows,
    rowKey,
    columns,
    emptyState = 'No hay registros todavía.',
}: AdminCrudTableProps<T>) {
    return (
        <div className="neumorph-inset overflow-x-auto rounded-xl border border-border/60 p-1">
            <table className="w-full min-w-[900px] border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                        {columns.map((col, idx) => (
                            <th
                                key={`header-${idx}`}
                                className={cn(
                                    col.headerClassName ?? 'px-3',
                                    'py-2 font-semibold',
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={rowKey(row)}
                            className=""
                        >
                            {columns.map((col, idx) => (
                                <td
                                    key={`${rowKey(row)}-col-${idx}`}
                                    className={
                                        col.cellClassName ??
                                        'px-3 py-2 align-middle'
                                    }
                                >
                                    {col.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))}

                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-3 py-6 text-center"
                            >
                                <p className="text-sm text-muted-foreground">
                                    {emptyState}
                                </p>
                            </td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        </div>
    );
}

