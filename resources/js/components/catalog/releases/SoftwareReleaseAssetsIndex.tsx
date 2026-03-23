import { Pencil, Plus, Trash2, Package } from 'lucide-react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import ReleaseAssetFormFields, {
    type ReleaseAssetRow,
} from '@/components/catalog/releases/ReleaseAssetFormFields';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';

type ProductPayload = {
    id: string;
    name: string;
    slug: string;
};

type Props = {
    releaseId: string;
    version: string;
    product: ProductPayload | null;
    assets: ReleaseAssetRow[];
};

export default function SoftwareReleaseAssetsIndex({
    releaseId,
    version,
    product,
    assets,
}: Props) {
    const rows = assets;
    const base = `/panel/catalogo-releases/${releaseId}/assets`;

    const columns: AdminCrudTableColumn<ReleaseAssetRow>[] = [
        {
            header: 'Etiqueta',
            cellClassName: 'px-3 py-2 align-middle font-medium',
            render: (r) => r.label,
        },
        {
            header: 'Ruta / URL',
            cellClassName: 'px-3 py-2 align-middle max-w-[280px]',
            render: (r) => (
                <span
                    className="block truncate font-mono text-[11px] text-muted-foreground"
                    title={r.path}
                >
                    {r.path}
                </span>
            ),
        },
        {
            header: 'SHA-256',
            cellClassName: 'px-3 py-2 align-middle max-w-[140px]',
            render: (r) => (
                <span
                    className="block truncate font-mono text-[10px] text-muted-foreground"
                    title={r.sha256 ?? ''}
                >
                    {r.sha256 ?? '—'}
                </span>
            ),
        },
    ];

    return (
        <AdminCrudIndex<ReleaseAssetRow>
            rows={rows}
            paginator={null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay archivos adicionales. Añade ZIPs, parches o docs."
            renderToolbar={({ onCreate }) => (
                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <Package className="size-4 text-[#D28C3C]" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold">
                                    Archivos del release
                                </h1>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Varias rutas por versión (artefactos extra
                                    además del principal en la ficha del
                                    release).
                                </p>
                                <p className="mt-1 font-mono text-[11px] text-[#4A80B8]">
                                    v{version}
                                    {product ? (
                                        <span className="text-foreground">
                                            {' '}
                                            · {product.name}
                                        </span>
                                    ) : null}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <NeuButtonRaised
                                type="button"
                                className="cursor-pointer"
                                onClick={onCreate}
                            >
                                <Plus className="size-4 text-[#4A9A72]" />
                                Añadir archivo
                            </NeuButtonRaised>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                            <Package className="size-3.5" />
                            Archivos {rows.length}
                        </span>
                    </div>
                </NeuCardRaised>
            )}
            renderRowActions={({ row, onEdit, onDelete }) => (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label="Editar"
                        className="group cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                        onClick={() => onEdit(row)}
                    >
                        <Pencil className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                    </button>

                    <button
                        type="button"
                        aria-label="Eliminar"
                        className="group cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05050]/30"
                        onClick={() => onDelete(row)}
                    >
                        <Trash2 className="size-4 text-[#C05050]/60 transition-colors group-hover:text-[#C05050]" />
                    </button>
                </div>
            )}
            renderMobileRows={({ rows, onEdit, onDelete }) => (
                <div className="neumorph-inset rounded-xl border border-border/60">
                    {rows.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No hay archivos adicionales.
                        </div>
                    ) : (
                        rows.map((row, idx) => (
                            <div
                                key={row.id}
                                className={[
                                    'px-3 py-3',
                                    idx > 0 ? 'border-t border-border/75' : '',
                                    idx % 2 === 1 ? 'bg-black/3' : '',
                                ].join(' ')}
                            >
                                <p className="text-sm font-medium">{row.label}</p>
                                <p
                                    className="mt-1 truncate font-mono text-[10px] text-muted-foreground"
                                    title={row.path}
                                >
                                    {row.path}
                                </p>
                                <div className="mt-3 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        aria-label="Editar"
                                        className="group cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg"
                                        onClick={() => onEdit(row)}
                                    >
                                        <Pencil className="size-4 text-[#4A80B8]/60 group-hover:text-[#4A80B8]" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Eliminar"
                                        className="group cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg"
                                        onClick={() => onDelete(row)}
                                    >
                                        <Trash2 className="size-4 text-[#C05050]/60 group-hover:text-[#C05050]" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            upsert={{
                titleCreate: 'Nuevo archivo',
                titleEdit: 'Editar archivo',
                createAction: base,
                updateAction: (row) => `${base}/${row.id}`,
                submitLabelCreate: 'Añadir',
                submitLabelEdit: 'Guardar',
                successToastTitle: 'Archivo guardado',
                renderFormFields: ({ mode, item, errors }) => (
                    <ReleaseAssetFormFields
                        key={item?.id ?? 'create'}
                        mode={mode}
                        item={item}
                        errors={errors}
                    />
                ),
            }}
            delete={{
                title: 'Eliminar archivo',
                description: 'Esta acción no se puede deshacer.',
                deleteAction: (row) => `${base}/${row.id}`,
                entityLabel: (row) => row.label,
                confirmLabel: 'Eliminar',
            }}
        />
    );
}
