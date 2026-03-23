import { Pencil, Trash2 } from 'lucide-react';

import type { CatalogCategory } from '@/components/catalog/categories/CatalogCategoryFormFields';

type Props = {
    rows: CatalogCategory[];
    categoriesForSelect: CatalogCategory[];
    onEdit: (row: CatalogCategory) => void;
    onDelete: (row: CatalogCategory) => void;
};

const revenueLineLabel = (value: string) => {
    if (value === 'software_system') {
        return 'Sistemas';
    }

    if (value === 'oem_license') {
        return 'Licencias OEM';
    }

    if (value === 'service') {
        return 'Servicios';
    }

    return value;
};

export default function CatalogCategoriesMobileCards({
    rows,
    categoriesForSelect,
    onEdit,
    onDelete,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="neumorph-inset rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground">
                No hay categorías todavía.
            </div>
        );
    }

    return (
        <div className="neumorph-inset rounded-xl border border-border/60">
            {rows.map((row, idx) => (
                <div
                    key={row.id}
                    className={[
                        'px-3 py-3',
                        idx > 0 ? 'border-t border-border/75' : '',
                        idx % 2 === 1 ? 'bg-black/3' : '',
                    ].join(' ')}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {row.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {row.parent_id
                                    ? `Padre: ${categoriesForSelect.find((x) => x.id === row.parent_id)?.name ?? '—'}`
                                    : 'Sin padre'}
                            </p>
                        </div>

                        <span
                            className={[
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                row.is_active
                                    ? 'bg-[#4A9A72]/15 text-[#4A9A72]'
                                    : 'bg-[#C05050]/15 text-[#C05050]',
                            ].join(' ')}
                        >
                            {row.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <p className="text-muted-foreground">Slug</p>
                            <p className="truncate font-mono text-foreground">
                                {row.slug}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Línea</p>
                            <p className="text-foreground">
                                {revenueLineLabel(row.revenue_line)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            Orden:{' '}
                            <span className="font-mono text-foreground">
                                {row.sort_order ?? 0}
                            </span>
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Editar"
                                className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                                onClick={() => onEdit(row)}
                            >
                                <Pencil className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                            </button>
                            <button
                                type="button"
                                aria-label="Eliminar"
                                className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05050]/30"
                                onClick={() => onDelete(row)}
                            >
                                <Trash2 className="size-4 text-[#C05050]/60 transition-colors group-hover:text-[#C05050]" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
