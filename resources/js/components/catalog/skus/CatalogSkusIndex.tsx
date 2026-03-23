import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    BadgeDollarSign,
    Ban,
    Barcode,
    Braces,
    CheckCircle2,
    LayoutGrid,
    Pencil,
    Plus,
    Tags,
    Trash2,
} from 'lucide-react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import CatalogSkuFormFields, {
    type CatalogSku,
    type CatalogSkuProductOption,
} from '@/components/catalog/skus/CatalogSkuFormFields';
import CatalogSkusMobileCards from '@/components/catalog/skus/CatalogSkusMobileCards';
import CatalogSkusSearch from '@/components/catalog/skus/CatalogSkusSearch';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import panel from '@/routes/panel';

type Props = {
    skus: any;
    productsForSelect: CatalogSkuProductOption[];
    initialQuery: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

const modelLabel = (value: string) => {
    if (value === 'source_perpetual') return 'Código perpetuo';
    if (value === 'source_rental') return 'Código alquiler';
    if (value === 'saas_subscription') return 'SaaS';
    if (value === 'oem_license_one_time') return 'OEM único';
    if (value === 'oem_license_subscription') return 'OEM suscripción';
    if (value === 'service_project') return 'Servicio proyecto';
    if (value === 'service_subscription') return 'Servicio recurrente';
    return value;
};

export default function CatalogSkusIndex({
    skus,
    productsForSelect,
    initialQuery,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const rows: CatalogSku[] = (skus?.data ?? []) as CatalogSku[];
    const totalInScreen = rows.length;
    const totalSkus = skus?.total ?? totalInScreen;
    const totalActive = rows.filter((r) => r.is_active).length;
    const totalInactive = rows.filter((r) => !r.is_active).length;
    const nextSortOrder = Math.max(0, ...rows.map((r) => Number(r.sort_order ?? 0))) + 1;

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

    const columns: AdminCrudTableColumn<CatalogSku>[] = [
        {
            header: sortableHeader('Estado', 'is_active'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (s) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        s.is_active
                            ? 'bg-[#4A9A72]/15 text-[#4A9A72]'
                            : 'bg-[#C05050]/15 text-[#C05050]',
                    ].join(' ')}
                >
                    {s.is_active ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            header: sortableHeader('SKU', 'name'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (s) => (
                <div className="flex flex-col">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.product?.name ?? 'Sin producto'}</span>
                </div>
            ),
        },
        {
            header: sortableHeader('Código', 'code'),
            cellClassName: 'px-3 py-2 align-middle font-mono text-sm',
            render: (s) => s.code,
        },
        {
            header: sortableHeader('Precio', 'list_price'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (s) => `${s.currency} ${Number(s.list_price).toFixed(2)}`,
        },
        {
            header: sortableHeader('Modelo', 'sale_model'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (s) => modelLabel(s.sale_model),
        },
    ];

    return (
        <AdminCrudIndex<CatalogSku>
            rows={rows}
            paginator={skus ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay SKUs todavía."
            renderToolbar={({ onCreate }) => (
                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <Barcode className="size-4 text-[#D28C3C]" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold">SKUs y precios</h1>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Opciones comerciales por producto (modelo, precio y entrega).
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
                                Nuevo SKU
                            </NeuButtonRaised>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                            <Tags className="size-3.5" />
                            SKUs {totalSkus}
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/12 px-2.5 py-1 text-xs text-[#D28C3C]">
                            <BadgeDollarSign className="size-3.5" />
                            Orden sugerido {nextSortOrder}
                        </span>
                    </div>
                </NeuCardRaised>
            )}
            renderAboveTable={() => (
                <CatalogSkusSearch initialQuery={initialQuery} className="mt-1" />
            )}
            renderRowActions={({ row, onEdit, onDelete }) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={panel.catalogoSkus.extras.index.url(row.id)}
                        className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D28C3C]/30"
                        aria-label="Límites y metadata (JSON)"
                        title="Límites y metadata"
                    >
                        <Braces className="size-4 text-[#D28C3C]/70 transition-colors group-hover:text-[#D28C3C]" />
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
                <CatalogSkusMobileCards
                    rows={mobileRows}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
            upsert={{
                titleCreate: 'Nuevo SKU',
                titleEdit: 'Editar SKU',
                createAction: '/panel/catalogo-skus',
                updateAction: (row) => `/panel/catalogo-skus/${row.id}`,
                submitLabelCreate: 'Crear',
                submitLabelEdit: 'Guardar cambios',
                renderFormFields: ({ mode, item, errors }) => (
                    <CatalogSkuFormFields
                        mode={mode}
                        item={item}
                        errors={errors}
                        productsForSelect={productsForSelect}
                        nextSortOrder={nextSortOrder}
                    />
                ),
            }}
            delete={{
                title: 'Eliminar SKU',
                description: 'Esta acción no se puede deshacer.',
                deleteAction: (row) => `/panel/catalogo-skus/${row.id}`,
                entityLabel: (row) => row.name,
                confirmLabel: 'Eliminar',
            }}
        />
    );
}

