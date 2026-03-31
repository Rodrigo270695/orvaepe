import { router, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Ban,
    CheckCircle2,
    Pencil,
    Percent,
    Plus,
    TicketPercent,
    Trash2,
} from 'lucide-react';

import AdminExcelExportLink from '@/components/admin/AdminExcelExportLink';
import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import CouponFormFields, {
    type CouponRow,
    type SkuOption,
} from '@/components/catalog/coupons/CouponFormFields';
import CouponsMobileCards from '@/components/catalog/coupons/CouponsMobileCards';
import CouponsSearch from '@/components/catalog/coupons/CouponsSearch';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';

type Props = {
    coupons: any;
    skusForSelect: SkuOption[];
    initialQuery: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

function discountLabel(row: CouponRow): string {
    if (row.discount_type === 'percent') {
        return `${row.discount_value}%`;
    }
    return `S/ ${row.discount_value}`;
}

function skuScopeLabel(row: CouponRow): string {
    if (row.applicable_sku_ids === null) {
        return 'Todos';
    }
    if (row.applicable_sku_ids.length === 0) {
        return 'Ninguno';
    }
    return `${row.applicable_sku_ids.length} SKU(s)`;
}

function formatExpiry(row: CouponRow): string {
    if (!row.expires_at) {
        return '—';
    }
    const d = new Date(row.expires_at);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function CouponsIndex({
    coupons,
    skusForSelect,
    initialQuery,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const exportUrl = useMemo(() => {
        const u = new URL(page.url, window.location.origin);
        u.pathname = '/panel/catalogo-cupones/export';
        u.searchParams.delete('page');
        u.searchParams.delete('per_page');
        return u.pathname + u.search;
    }, [page.url]);

    const rows: CouponRow[] = (coupons?.data ?? []) as CouponRow[];
    const totalInScreen = rows.length;
    const totalCoupons = coupons?.total ?? totalInScreen;
    const totalActive = rows.filter((r) => r.is_active).length;
    const totalInactive = rows.filter((r) => !r.is_active).length;

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

    const columns: AdminCrudTableColumn<CouponRow>[] = [
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
            header: sortableHeader('Código', 'code'),
            cellClassName:
                'px-3 py-2 align-middle font-mono text-sm text-[#4A80B8]',
            render: (c) => c.code,
        },
        {
            header: sortableHeader('Tipo', 'discount_type'),
            cellClassName: 'px-3 py-2 align-middle text-xs',
            render: (c) =>
                c.discount_type === 'percent' ? 'Porcentaje' : 'Monto fijo',
        },
        {
            header: sortableHeader('Valor', 'discount_value'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (c) => (
                <span className="font-medium">{discountLabel(c)}</span>
            ),
        },
        {
            header: 'Alcance SKU',
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (c) => skuScopeLabel(c),
        },
        {
            header: sortableHeader('Usos', 'used_count'),
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs',
            render: (c) => (
                <span>
                    {c.used_count}
                    {c.max_uses != null ? ` / ${c.max_uses}` : ''}
                </span>
            ),
        },
        {
            header: sortableHeader('Vence', 'expires_at'),
            cellClassName: 'px-3 py-2 align-middle text-xs',
            render: (c) => formatExpiry(c),
        },
    ];

    const paginator = coupons ?? null;

    return (
        <AdminCrudIndex<CouponRow>
            rows={rows}
            paginator={paginator}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay cupones todavía."
            renderToolbar={({ onCreate }) => (
                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <TicketPercent className="size-4 text-[#D28C3C]" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold">
                                    Cupones de descuento
                                </h1>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Códigos reutilizables para checkout:
                                    porcentaje o monto fijo, vigencia y límites
                                    de uso.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <AdminExcelExportLink
                                href={exportUrl}
                                aria-label="Descargar listado de cupones en Excel (respeta búsqueda y orden)"
                                title="Descargar Excel — mismos filtros que la tabla"
                            />
                            <NeuButtonRaised
                                type="button"
                                className="cursor-pointer"
                                onClick={onCreate}
                            >
                                <Plus className="size-4 text-[#4A9A72]" />
                                Nuevo cupón
                            </NeuButtonRaised>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                            <Percent className="size-3.5" />
                            Cupones {totalCoupons}
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
                            <TicketPercent className="size-3.5" />
                            En pantalla {totalInScreen}
                        </span>
                    </div>
                </NeuCardRaised>
            )}
            renderAboveTable={() => (
                <CouponsSearch
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
                <CouponsMobileCards
                    rows={rows}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
            upsert={{
                titleCreate: 'Nuevo cupón',
                titleEdit: 'Editar cupón',
                createAction: '/panel/catalogo-cupones',
                updateAction: (row) => `/panel/catalogo-cupones/${row.id}`,
                submitLabelCreate: 'Crear',
                submitLabelEdit: 'Guardar cambios',
                successToastTitle: 'Se ha guardado el cupón',
                renderFormFields: ({ mode, item, errors }) => (
                    <CouponFormFields
                        key={item?.id ?? 'create'}
                        mode={mode}
                        item={item}
                        errors={errors}
                        skusForSelect={skusForSelect}
                    />
                ),
            }}
            delete={{
                title: 'Eliminar cupón',
                description: 'Esta acción no se puede deshacer.',
                deleteAction: (row) => `/panel/catalogo-cupones/${row.id}`,
                entityLabel: (row) => row.code,
                confirmLabel: 'Eliminar',
            }}
        />
    );
}
