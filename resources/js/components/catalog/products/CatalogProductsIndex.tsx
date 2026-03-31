import { useMemo } from 'react';

import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Ban,
    Box,
    CheckCircle2,
    Images,
    LayoutGrid,
    TableProperties,
    Pencil,
    Plus,
    Tags,
    Trash2,
} from 'lucide-react';

import AdminExcelExportLink from '@/components/admin/AdminExcelExportLink';
import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import {
    type CatalogProduct,
    type CatalogProductCategoryOption,
} from '@/components/catalog/products/CatalogProductFormFields';
import CatalogProductFormFields from '@/components/catalog/products/CatalogProductFormFields';
import CatalogProductsMobileCards from '@/components/catalog/products/CatalogProductsMobileCards';
import CatalogProductsSearch from '@/components/catalog/products/CatalogProductsSearch';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import panel from '@/routes/panel';

type Props = {
    products: any;
    categoriesForSelect: CatalogProductCategoryOption[];
    initialQuery: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

const revenueLineLabel = (value?: string | null) => {
    if (value === 'software_system') return 'Sistemas';
    if (value === 'oem_license') return 'Licencias OEM';
    if (value === 'service') return 'Servicios';
    return '—';
};

export default function CatalogProductsIndex({
    products,
    categoriesForSelect,
    initialQuery,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const exportUrl = useMemo(() => {
        const u = new URL(page.url, window.location.origin);
        u.pathname = '/panel/catalogo-productos/export';
        u.searchParams.delete('page');
        u.searchParams.delete('per_page');
        return u.pathname + u.search;
    }, [page.url]);
    const rows: CatalogProduct[] = (products?.data ?? []) as CatalogProduct[];
    const totalInScreen = rows.length;
    const totalProducts = products?.total ?? totalInScreen;
    const totalActive = rows.filter((r) => r.is_active).length;
    const totalInactive = rows.filter((r) => !r.is_active).length;

    const handleSort = (sortBy: string) => {
        const currentUrl = new URL(page.url, window.location.origin);
        const currentSortBy = currentUrl.searchParams.get('sort_by') ?? initialSortBy ?? '';
        const currentSortDir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ??
            initialSortDir;

        const nextDir: 'asc' | 'desc' =
            currentSortBy === sortBy && currentSortDir === 'asc'
                ? 'desc'
                : 'asc';

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

    const columns: AdminCrudTableColumn<CatalogProduct>[] = [
        {
            header: sortableHeader('Estado', 'is_active'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (p) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        p.is_active
                            ? 'bg-[#4A9A72]/15 text-[#4A9A72]'
                            : 'bg-[#C05050]/15 text-[#C05050]',
                    ].join(' ')}
                >
                    {p.is_active ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            header: sortableHeader('Producto', 'name'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (p) => (
                <div className="flex flex-col">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {p.tagline || p.category?.name || 'Sin categoría'}
                    </span>
                </div>
            ),
        },
        {
            header: sortableHeader('Slug', 'slug'),
            cellClassName: 'px-3 py-2 align-middle font-mono text-sm',
            render: (p) => p.slug,
        },
        {
            header: 'Categoría',
            cellClassName: 'px-3 py-2 align-middle',
            render: (p) => p.category?.name ?? '—',
        },
        {
            header: 'Línea',
            cellClassName: 'px-3 py-2 align-middle',
            render: (p) => revenueLineLabel(p.category?.revenue_line),
        },
    ];

    return (
        <AdminCrudIndex<CatalogProduct>
            rows={rows}
            paginator={products ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay productos todavía."
            renderToolbar={({ onCreate }) => (
                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <Box className="size-4 text-[#D28C3C]" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold">Productos del catálogo</h1>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Gestión de productos comerciales por categoría y línea.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <AdminExcelExportLink
                                href={exportUrl}
                                aria-label="Descargar listado en Excel (respeta búsqueda y orden)"
                                title="Descargar Excel — mismos filtros que la tabla"
                            />
                            <NeuButtonRaised
                                type="button"
                                className="cursor-pointer"
                                onClick={onCreate}
                            >
                                <Plus className="size-4 text-[#4A9A72]" />
                                Nuevo producto
                            </NeuButtonRaised>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                            <Tags className="size-3.5" />
                            Productos {totalProducts}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                            <CheckCircle2 className="size-3.5" />
                            Activos {totalActive}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#C05050]/12 px-2.5 py-1 text-xs text-[#C05050]">
                            <Ban className="size-3.5" />
                            Inactivos {totalInactive}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                            <LayoutGrid className="size-3.5" />
                            En pantalla {totalInScreen}
                        </span>
                    </div>
                </NeuCardRaised>
            )}
            renderAboveTable={() => (
                <CatalogProductsSearch initialQuery={initialQuery} className="mt-1" />
            )}
            renderRowActions={({ row, onEdit, onDelete }) => (
                <div className="flex items-center gap-2">
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
            )}
            renderMobileRows={({ rows: mobileRows, onEdit, onDelete }) => (
                <CatalogProductsMobileCards
                    rows={mobileRows}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
            upsert={{
                titleCreate: 'Nuevo producto',
                titleEdit: 'Editar producto',
                createAction: '/panel/catalogo-productos',
                updateAction: (row) => `/panel/catalogo-productos/${row.id}`,
                submitLabelCreate: 'Crear',
                submitLabelEdit: 'Guardar cambios',
                renderFormFields: ({ mode, item, errors }) => (
                    <CatalogProductFormFields
                        mode={mode}
                        item={item}
                        errors={errors}
                        categoriesForSelect={categoriesForSelect}
                    />
                ),
            }}
            delete={{
                title: 'Eliminar producto',
                description: 'Esta acción no se puede deshacer.',
                deleteAction: (row) => `/panel/catalogo-productos/${row.id}`,
                entityLabel: (row) => row.name,
                confirmLabel: 'Eliminar',
            }}
        />
    );
}

