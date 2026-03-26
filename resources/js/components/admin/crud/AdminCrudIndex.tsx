import * as React from 'react';

import AdminCrudTable, {
    type AdminCrudTableColumn,
} from '@/components/admin/crud/AdminCrudTable';
import AdminCrudPagination from '@/components/admin/crud/AdminCrudPagination';
import AdminCrudUpsertModal from '@/components/admin/crud/AdminCrudUpsertModal';
import AdminCrudDeleteModal from '@/components/admin/crud/AdminCrudDeleteModal';

type Mode = 'create' | 'edit';

type PaginatorLike = {
    links?: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    from?: number;
    to?: number;
    total?: number;
    per_page?: number;
    current_page?: number;
    last_page?: number;
};

type UpsertConfig<T> = {
    titleCreate: string;
    titleEdit: string;
    createAction: string;
    updateAction: (row: T) => string;
    submitLabelCreate: string;
    submitLabelEdit: string;
    renderFormFields: (args: {
        mode: Mode;
        item: T | null;
        errors: Record<string, string | undefined>;
        processing: boolean;
    }) => React.ReactNode;
    successToastTitle?: string;
    /** Para subida de archivos con Inertia Form. */
    encType?: React.HTMLAttributes<HTMLFormElement>['encType'];
    /** Si se define, solo estos `name` deben estar rellenos para habilitar el botón (crear). */
    requiredFieldNames?: string[];
};

type DeleteConfig<T> = {
    title: string;
    description?: string;
    deleteAction: (row: T) => string;
    entityLabel: (row: T) => string;
    confirmLabel?: string;
};

type Props<T> = {
    rows: T[];
    rowKey: (row: T) => string;
    columns: AdminCrudTableColumn<T>[];
    paginator?: PaginatorLike | null;
    /**
     * Render opcional de acciones por fila.
     * Si se provee, agregamos una columna “Acciones”.
     */
    renderRowActions?: (args: {
        row: T;
        onEdit: (row: T) => void;
        onDelete: (row: T) => void;
    }) => React.ReactNode;
    /**
     * Toolbar opcional (ej: botón “Nueva X”).
     */
    renderToolbar?: (args: { onCreate: () => void }) => React.ReactNode;
    /**
     * Render opcional entre toolbar y tabla (ej: filtros).
     */
    renderAboveTable?: () => React.ReactNode;
    /**
     * Render opcional para tarjetas en móvil.
     */
    renderMobileRows?: (args: {
        rows: T[];
        onEdit: (row: T) => void;
        onDelete: (row: T) => void;
    }) => React.ReactNode;

    emptyState?: string;

    /**
     * Listados solo lectura (sin modal crear/editar).
     */
    upsert?: UpsertConfig<T>;

    delete?: DeleteConfig<T>;
};

export default function AdminCrudIndex<T>({
    rows,
    rowKey,
    columns,
    paginator = null,
    renderRowActions,
    renderToolbar,
    renderAboveTable,
    renderMobileRows,
    emptyState = 'No hay registros todavía.',
    upsert,
    delete: deleteConfig,
}: Props<T>) {
    const [upsertOpen, setUpsertOpen] = React.useState(false);
    const [upsertMode, setUpsertMode] = React.useState<Mode>('create');
    const [selected, setSelected] = React.useState<T | null>(null);

    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<T | null>(null);

    const onCreate = () => {
        if (!upsert) {
            return;
        }
        setUpsertMode('create');
        setSelected(null);
        setUpsertOpen(true);
    };

    const onEdit = (row: T) => {
        if (!upsert) {
            return;
        }
        setUpsertMode('edit');
        setSelected(row);
        setUpsertOpen(true);
    };

    const onDelete = (row: T) => {
        if (!deleteConfig) {
            return;
        }
        setDeleteTarget(row);
        setDeleteOpen(true);
    };

    const computedColumns = React.useMemo(() => {
        if (!renderRowActions) return columns;

        return [
            ...columns,
            {
                header: 'Acciones',
                cellClassName: 'px-3 py-2 align-middle',
                render: (row: T) =>
                    renderRowActions({
                        row,
                        onEdit,
                        onDelete,
                    }),
            },
        ] as AdminCrudTableColumn<T>[];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columns, renderRowActions]);

    return (
        <div className="space-y-6">
            {renderToolbar ? renderToolbar({ onCreate }) : null}
            {renderAboveTable ? renderAboveTable() : null}

            {renderMobileRows ? (
                <div className="md:hidden">
                    {renderMobileRows({ rows, onEdit, onDelete })}
                </div>
            ) : null}

            <div className={renderMobileRows ? 'hidden md:block' : ''}>
                <AdminCrudTable
                    rows={rows}
                    rowKey={rowKey}
                    columns={computedColumns}
                    emptyState={emptyState}
                />
            </div>

            {paginator ? (
                <AdminCrudPagination paginator={paginator} />
            ) : null}

            {upsert ? (
                <AdminCrudUpsertModal
                    open={upsertOpen}
                    onOpenChange={setUpsertOpen}
                    mode={upsertMode}
                    title={
                        upsertMode === 'create'
                            ? upsert.titleCreate
                            : upsert.titleEdit
                    }
                    action={
                        upsertMode === 'create'
                            ? upsert.createAction
                            : upsert.updateAction(selected as T)
                    }
                    method="post"
                    methodOverride={upsertMode === 'edit' ? 'patch' : undefined}
                    submitLabel={
                        upsertMode === 'create'
                            ? upsert.submitLabelCreate
                            : upsert.submitLabelEdit
                    }
                    successToastTitle={upsert.successToastTitle}
                    encType={upsert.encType}
                    requiredFieldNames={upsert.requiredFieldNames}
                >
                    {({ errors, processing }) =>
                        upsert.renderFormFields({
                            mode: upsertMode,
                            item: selected,
                            errors,
                            processing,
                        })
                    }
                </AdminCrudUpsertModal>
            ) : null}

            {deleteConfig ? (
                <AdminCrudDeleteModal
                    open={deleteOpen}
                    onOpenChange={setDeleteOpen}
                    title={deleteConfig.title}
                    description={deleteConfig.description}
                    confirmLabel={deleteConfig.confirmLabel}
                    action={
                        deleteTarget
                            ? deleteConfig.deleteAction(deleteTarget)
                            : ''
                    }
                    method="post"
                    methodOverride="delete"
                    entityLabel={
                        deleteTarget
                            ? deleteConfig.entityLabel(deleteTarget)
                            : ''
                    }
                />
            ) : null}
        </div>
    );
}

