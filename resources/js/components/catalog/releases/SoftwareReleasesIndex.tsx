import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    GitBranch,
    Package,
    Pencil,
    Plus,
    Sparkles,
    Trash2,
} from 'lucide-react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import SoftwareReleaseFormFields, {
    type ProductOption,
    type ReleaseRow,
} from '@/components/catalog/releases/SoftwareReleaseFormFields';
import SoftwareReleasesMobileCards from '@/components/catalog/releases/SoftwareReleasesMobileCards';
import SoftwareReleasesProductFilter from '@/components/catalog/releases/SoftwareReleasesProductFilter';
import SoftwareReleasesSearch from '@/components/catalog/releases/SoftwareReleasesSearch';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';

type Props = {
    releases: any;
    productsForSelect: ProductOption[];
    initialQuery: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
    initialCatalogProductId: string;
};

function formatReleased(iso: string | null | undefined): string {
    if (!iso) {
        return '—';
    }
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

export default function SoftwareReleasesIndex({
    releases,
    productsForSelect,
    initialQuery,
    initialSortBy,
    initialSortDir,
    initialCatalogProductId,
}: Props) {
    const page = usePage();

    const rows: ReleaseRow[] = (releases?.data ?? []) as ReleaseRow[];
    const totalInScreen = rows.length;
    const totalReleases = releases?.total ?? totalInScreen;
    const latestCount = rows.filter((r) => r.is_latest).length;

    const handleSort = (sortBy: string) => {
        const currentUrl = new URL(page.url, window.location.origin);
        const currentSortBy =
            currentUrl.searchParams.get('sort_by') ?? initialSortBy ?? '';
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

    const columns: AdminCrudTableColumn<ReleaseRow>[] = [
        {
            header: 'Producto',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {r.product?.name ?? '—'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {r.product?.slug ?? ''}
                    </span>
                </div>
            ),
        },
        {
            header: sortableHeader('Versión', 'version'),
            cellClassName:
                'px-3 py-2 align-middle font-mono text-sm text-[#4A80B8]',
            render: (r) => `v${r.version}`,
        },
        {
            header: sortableHeader('Última', 'is_latest'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) =>
                r.is_latest ? (
                    <span className="inline-flex items-center rounded-full bg-[#4A80B8]/15 px-2 py-0.5 text-[10px] font-medium text-[#4A80B8]">
                        Sí
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            header: sortableHeader('Publicado', 'released_at'),
            cellClassName: 'px-3 py-2 align-middle text-xs',
            render: (r) => formatReleased(r.released_at),
        },
        {
            header: sortableHeader('PHP mín.', 'min_php_version'),
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs',
            render: (r) => r.min_php_version ?? '—',
        },
        {
            header: 'Artefacto',
            cellClassName: 'px-3 py-2 align-middle max-w-[180px]',
            render: (r) => (
                <span
                    className="block truncate font-mono text-[10px] text-muted-foreground"
                    title={r.artifact_path ?? ''}
                >
                    {r.artifact_path ?? '—'}
                </span>
            ),
        },
    ];

    const paginator = releases ?? null;

    return (
        <AdminCrudIndex<ReleaseRow>
            rows={rows}
            paginator={paginator}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay versiones registradas."
            renderToolbar={({ onCreate }) => (
                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <GitBranch className="size-4 text-[#D28C3C]" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold">
                                    Versiones y releases
                                </h1>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Binarios y notas por producto de línea
                                    Sistemas (semver, hash, PHP mínimo).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <NeuButtonRaised
                                type="button"
                                className="cursor-pointer"
                                onClick={onCreate}
                                disabled={productsForSelect.length === 0}
                            >
                                <Plus className="size-4 text-[#4A9A72]" />
                                Nueva versión
                            </NeuButtonRaised>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                            <GitBranch className="size-3.5" />
                            Releases {totalReleases}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                            <Sparkles className="size-3.5" />
                            Marcadas &quot;última&quot; {latestCount}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                            En pantalla {totalInScreen}
                        </span>
                    </div>
                </NeuCardRaised>
            )}
            renderAboveTable={() => (
                <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <SoftwareReleasesSearch initialQuery={initialQuery} />
                    <SoftwareReleasesProductFilter
                        productsForSelect={productsForSelect}
                        initialProductId={initialCatalogProductId}
                        className="w-full md:max-w-xs"
                    />
                </div>
            )}
            renderRowActions={({ row, onEdit, onDelete }) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/panel/catalogo-releases/${row.id}/assets`}
                        prefetch
                        className="group cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]/30"
                        aria-label="Archivos del release"
                    >
                        <Package className="size-4 text-[#8B5CF6]/60 transition-colors group-hover:text-[#8B5CF6]" />
                    </Link>

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
                <SoftwareReleasesMobileCards
                    rows={rows}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
            upsert={{
                titleCreate: 'Nueva versión',
                titleEdit: 'Editar versión',
                createAction: '/panel/catalogo-releases',
                updateAction: (row) => `/panel/catalogo-releases/${row.id}`,
                submitLabelCreate: 'Registrar',
                submitLabelEdit: 'Guardar cambios',
                successToastTitle: 'Se ha guardado la versión',
                encType: 'multipart/form-data',
                renderFormFields: ({ mode, item, errors }) => (
                    <SoftwareReleaseFormFields
                        key={item?.id ?? 'create'}
                        mode={mode}
                        item={item}
                        errors={errors}
                        productsForSelect={productsForSelect}
                        defaultCatalogProductId={initialCatalogProductId}
                    />
                ),
            }}
            delete={{
                title: 'Eliminar versión',
                description: 'Esta acción no se puede deshacer.',
                deleteAction: (row) => `/panel/catalogo-releases/${row.id}`,
                entityLabel: (row) => `v${row.version}`,
                confirmLabel: 'Eliminar',
            }}
        />
    );
}
