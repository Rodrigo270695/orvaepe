import { router, usePage } from '@inertiajs/react';
import { Box, Plus, Pencil, Trash2, Tags, CheckCircle2, LayoutGrid, Ban, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';

import CatalogCategoryFormFields, {
    type CatalogCategory,
} from '@/components/catalog/categories/CatalogCategoryFormFields';
import CatalogCategoriesMobileCards from '@/components/catalog/categories/CatalogCategoriesMobileCards';
import CatalogCategoriesSearch from '@/components/catalog/categories/CatalogCategoriesSearch';

type Props = {
    categories: any;
    categoriesForSelect: CatalogCategory[];
    initialQuery: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

export default function CatalogCategoriesIndex({
    categories,
    categoriesForSelect,
    initialQuery,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const revenueLineLabel = (value: string) => {
        if (value === 'software_system') return 'Sistemas';
        if (value === 'oem_license') return 'Licencias OEM';
        if (value === 'service') return 'Servicios';
        return value;
    };

    const rows: CatalogCategory[] = (categories?.data ?? []) as CatalogCategory[];
    const totalInScreen = rows.length;
    const totalCategories = categories?.total ?? totalInScreen;
    const totalActive = rows.filter((r) => r.is_active).length;
    const totalInactive = rows.filter((r) => !r.is_active).length;
    const nextSortOrder =
        Math.max(
            0,
            ...categoriesForSelect.map((c) =>
                Number(c.sort_order ?? 0),
            ),
        ) + 1;

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
        if (initialSortBy !== key) {
            return <ArrowUpDown className="size-3.5 opacity-70" />;
        }
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

    const columns: AdminCrudTableColumn<CatalogCategory>[] = [
        {
            header: sortableHeader('Estado', 'is_active'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (c) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        c.is_active
                            ? 'bg-[#4A9A72]/15 text-[#4A9A72]'
                            : 'bg-[#C05050]/15 text-[#C05050]',
                    ].join(' ')}
                >
                    {c.is_active ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            header: sortableHeader('Categoría', 'name'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (c) => (
                <div className="flex flex-col">
                    <span className="font-medium">{c.name}</span>
                    {c.parent_id ? (
                        <span className="text-xs text-muted-foreground">
                            Padre: {categoriesForSelect.find((x) => x.id === c.parent_id)?.name ?? '—'}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            Sin padre
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: sortableHeader('Slug', 'slug'),
            cellClassName: 'px-3 py-2 align-middle font-mono text-sm',
            render: (c) => c.slug,
        },
        {
            header: sortableHeader('Línea', 'revenue_line'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (c) => revenueLineLabel(c.revenue_line),
        },
        {
            header: sortableHeader('Orden', 'sort_order'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (c) => <span className="font-mono">{c.sort_order ?? 0}</span>,
        },
    ];

    const paginator = categories ?? null;

    return (
        <AdminCrudIndex<CatalogCategory>
            rows={rows}
            paginator={paginator}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay categorías todavía."
            renderToolbar={({ onCreate }) => (
                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <Box className="size-4 text-[#D28C3C]" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold">
                                    {/** Cabecera */}
                                    Categorías del catálogo
                                </h1>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Estructura jerárquica para sistemas,
                                    licencias OEM y servicios.
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
                                Nueva categoría
                            </NeuButtonRaised>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                            <Tags className="size-3.5" />
                            Categorías {totalCategories}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                            <CheckCircle2 className="size-3.5" />
                            Activas {totalActive}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#C05050]/12 px-2.5 py-1 text-xs text-[#C05050]">
                            <Ban className="size-3.5" />
                            Inactivas {totalInactive}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                            <LayoutGrid className="size-3.5" />
                            En pantalla {totalInScreen}
                        </span>
                    </div>
                </NeuCardRaised>
            )}
            renderAboveTable={() => (
                <CatalogCategoriesSearch
                    initialQuery={initialQuery}
                    className="mt-1"
                />
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
                <CatalogCategoriesMobileCards
                    rows={rows}
                    categoriesForSelect={categoriesForSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
            upsert={{
                titleCreate: 'Nueva categoría',
                titleEdit: 'Editar categoría',
                createAction: '/panel/catalogo-categorias',
                updateAction: (row) =>
                    `/panel/catalogo-categorias/${row.id}`,
                submitLabelCreate: 'Crear',
                submitLabelEdit: 'Guardar cambios',
                successToastTitle: 'Se ha guardado la categoría',
                renderFormFields: ({ mode, item, errors }) => (
                    <CatalogCategoryFormFields
                        mode={mode}
                        item={item}
                        errors={errors}
                        categoriesForSelect={categoriesForSelect}
                        nextSortOrder={nextSortOrder}
                    />
                ),
            }}
            delete={{
                title: 'Eliminar categoría',
                description:
                    'Esta acción no se puede deshacer.',
                deleteAction: (row) =>
                    `/panel/catalogo-categorias/${row.id}`,
                entityLabel: (row) => row.name,
                confirmLabel: 'Eliminar',
            }}
        />
    );
}

