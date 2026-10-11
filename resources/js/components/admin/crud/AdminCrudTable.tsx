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
    /** Clases por fila (ej. sombreado si no leída). */
    rowClassName?: (row: T) => string | undefined;
    /** Clic en la fila (ej. marcar como leída). */
    onRowClick?: (row: T) => void;
    /** Tabla plana, sin filas flotantes. */
    ledger?: boolean;
};

export default function AdminCrudTable<T>({
    rows,
    rowKey,
    columns,
    emptyState = 'No hay registros todavía.',
    rowClassName,
    onRowClick,
    ledger = false,
}: AdminCrudTableProps<T>) {
    return (
        <div
            className={
                ledger
                    ? 'overflow-x-auto rounded-lg border border-[rgba(41,50,60,0.12)] bg-[#F7FAFC]'
                    : 'neumorph-inset overflow-x-auto rounded-xl border border-border/60 p-1'
            }
        >
            <table
                className={
                    ledger
                        ? 'w-full min-w-[900px] border-collapse text-[13px]'
                        : 'w-full min-w-[900px] border-separate border-spacing-y-2'
                }
            >
                <thead>
                    <tr
                        className={
                            ledger
                                ? 'border-b border-[rgba(41,50,60,0.12)] text-left text-[11px] font-medium uppercase tracking-[0.08em] text-[#6A7A88]'
                                : 'text-left text-xs text-muted-foreground'
                        }
                    >
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
                            className={cn(
                                onRowClick ? 'cursor-pointer transition-colors' : '',
                                ledger
                                    ? 'border-b border-[rgba(41,50,60,0.08)] last:border-b-0 hover:bg-[rgba(41,50,60,0.03)]'
                                    : '',
                                rowClassName?.(row),
                            )}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                            role={onRowClick ? 'button' : undefined}
                            tabIndex={onRowClick ? 0 : undefined}
                            onKeyDown={
                                onRowClick
                                    ? (e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                              e.preventDefault();
                                              onRowClick(row);
                                          }
                                      }
                                    : undefined
                            }
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

