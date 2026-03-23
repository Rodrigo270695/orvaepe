import { Link } from '@inertiajs/react';

import panel from '@/routes/panel';
import { Images, Pencil, TableProperties, Trash2 } from 'lucide-react';

import type { CatalogProduct } from '@/components/catalog/products/CatalogProductFormFields';

type Props = {
    rows: CatalogProduct[];
    onEdit: (row: CatalogProduct) => void;
    onDelete: (row: CatalogProduct) => void;
};

const revenueLineLabel = (value?: string | null) => {
    if (value === 'software_system') return 'Sistemas';
    if (value === 'oem_license') return 'Licencias OEM';
    if (value === 'service') return 'Servicios';
    return value ?? '—';
};

export default function CatalogProductsMobileCards({ rows, onEdit, onDelete }: Props) {
    if (rows.length === 0) {
        return (
            <div className="neumorph-inset rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground">
                No hay productos todavía.
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
                                {row.tagline || row.category?.name || 'Sin categoría'}
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
                            <p className="truncate font-mono text-foreground">{row.slug}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Línea</p>
                            <p className="text-foreground">
                                {revenueLineLabel(row.category?.revenue_line)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                        <Link
                            href={panel.catalogoProductos.medios.index.url(row.id)}
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D28C3C]/30"
                            aria-label="Medios del producto"
                            title="Medios del producto"
                        >
                            <Images className="size-4 text-[#D28C3C]/60 transition-colors group-hover:text-[#D28C3C]" />
                        </Link>
                        <Link
                            href={panel.catalogoProductos.specs.index.url(row.id)}
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                            aria-label="Especificaciones del producto"
                            title="Especificaciones (specs)"
                        >
                            <TableProperties className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                        </Link>
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
            ))}
        </div>
    );
}

