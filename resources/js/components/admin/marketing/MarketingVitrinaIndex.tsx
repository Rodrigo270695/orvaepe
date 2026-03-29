import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import {
    Ban,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Building2,
    CheckCircle2,
    Pencil,
    Plus,
    Sparkles,
    Trash2,
} from 'lucide-react';

import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import ShowcaseClientFormFields, {
    type ShowcaseClientRow,
} from '@/components/admin/marketing/ShowcaseClientFormFields';
import MarketingVitrinaMobileCards from '@/components/admin/marketing/MarketingVitrinaMobileCards';
import MarketingVitrinaSearch from '@/components/admin/marketing/MarketingVitrinaSearch';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    showcaseClients: any;
    /** Valor que se mostrará al crear (coincide con el que aplicará el servidor). */
    nextSortOrder: number;
    initialQuery: string;
    initialSortBy: string;
    initialSortDir: 'asc' | 'desc';
};

function formatDate(iso: string | null | undefined): string {
    if (!iso) {
        return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/** Misma nomenclatura que el select de `ShowcaseClientFormFields` (valor BD → UI). */
const SECTOR_LABEL_ES: Record<string, string> = {
    retail: 'Retail',
    logistics: 'Logística',
    industry: 'Industria',
    services: 'Servicios',
};

function formatSectorLabel(sector: string | null | undefined): string {
    const s = sector?.trim();
    if (!s) {
        return '—';
    }
    const mapped = SECTOR_LABEL_ES[s.toLowerCase()];
    return mapped ?? s;
}

export default function MarketingVitrinaIndex({
    showcaseClients,
    nextSortOrder,
    initialQuery,
    initialSortBy,
    initialSortDir,
}: Props) {
    const page = usePage();
    const [logoPreview, setLogoPreview] = useState<{
        url: string;
        label: string;
    } | null>(null);

    const rows: ShowcaseClientRow[] = (showcaseClients?.data ??
        []) as ShowcaseClientRow[];
    const total = showcaseClients?.total ?? rows.length;
    const publishedCount = rows.filter((r) => r.is_published).length;
    const draftCount = rows.filter((r) => !r.is_published).length;
    const handleSort = (sortBy: string) => {
        const currentUrl = new URL(page.url, window.location.origin);
        const currentSortBy = currentUrl.searchParams.get('sort_by') ?? initialSortBy ?? '';
        const currentSortDir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ?? initialSortDir;
        const nextDir: 'asc' | 'desc' =
            currentSortBy === sortBy && currentSortDir === 'asc' ? 'desc' : 'asc';

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

    const columns: AdminCrudTableColumn<ShowcaseClientRow>[] = [
        {
            header: sortableHeader('Estado', 'is_published'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        r.is_published
                            ? 'bg-[#4A9A72]/15 text-[#4A9A72]'
                            : 'bg-muted text-muted-foreground',
                    ].join(' ')}
                >
                    {r.is_published ? 'Vitrina' : 'Borrador'}
                </span>
            ),
        },
        {
            header: sortableHeader('Orden', 'sort_order'),
            cellClassName:
                'px-3 py-2 align-middle font-mono text-xs text-muted-foreground',
            render: (r) => r.sort_order,
        },
        {
            header: sortableHeader('Empresa', 'legal_name'),
            cellClassName: 'px-3 py-2 align-middle max-w-[14rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {r.display_name?.trim() || r.legal_name}
                    </span>
                    {r.display_name ? (
                        <span className="text-[10px] text-muted-foreground">
                            {r.legal_name}
                        </span>
                    ) : null}
                </div>
            ),
        },
        {
            header: sortableHeader('Sector', 'sector'),
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatSectorLabel(r.sector),
        },
        {
            header: sortableHeader('Web', 'website_url'),
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) =>
                r.website_url ? (
                    <a
                        href={r.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="max-w-[10rem] truncate text-xs text-[#4A80B8] underline-offset-2 hover:underline"
                    >
                        {r.website_url.replace(/^https?:\/\//, '')}
                    </a>
                ) : (
                    '—'
                ),
        },
        {
            header: 'Logo',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) =>
                r.logo_public_url ? (
                    <button
                        type="button"
                        onClick={() =>
                            setLogoPreview({
                                url: r.logo_public_url as string,
                                label:
                                    r.display_name?.trim() || r.legal_name,
                            })
                        }
                        className="cursor-pointer rounded-md border border-border/50 bg-muted/30 p-0.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/40"
                        aria-label="Ver logo en tamaño completo"
                    >
                        <img
                            src={r.logo_public_url}
                            alt=""
                            className="h-9 w-9 rounded-md object-contain"
                        />
                    </button>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                ),
        },
        {
            header: sortableHeader('Autorización', 'authorized_at'),
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDate(r.authorized_at),
        },
    ];

    return (
        <>
            <Dialog
                open={logoPreview !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setLogoPreview(null);
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] max-w-[min(96vw,56rem)] border-border/60 bg-background p-3 sm:p-4">
                    <DialogTitle className="sr-only">
                        Logo {logoPreview?.label ?? ''}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Vista previa ampliada del logo.
                    </DialogDescription>
                    {logoPreview ? (
                        <img
                            src={logoPreview.url}
                            alt=""
                            className="mx-auto max-h-[85vh] w-auto max-w-full object-contain"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
            <AdminCrudIndex<ShowcaseClientRow>
            rows={rows}
            paginator={showcaseClients ?? null}
            rowKey={(r) => r.id}
            columns={columns}
            emptyState="No hay registros. Crea uno para la vitrina pública."
            renderToolbar={({ onCreate }) => (
                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <Sparkles className="size-4 text-[#D28C3C]" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold">
                                    Vitrina de clientes
                                </h1>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Logos y datos mostrados en la web pública
                                    (confían en ORVAE). Solo los marcados como
                                    vitrina son visibles en el sitio.
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
                                Nuevo cliente
                            </NeuButtonRaised>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                            <Building2 className="size-3.5" />
                            Total {total}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                            <CheckCircle2 className="size-3.5" />
                            En vitrina {publishedCount}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                            <Ban className="size-3.5" />
                            Borrador {draftCount}
                        </span>
                    </div>
                </NeuCardRaised>
            )}
            renderAboveTable={() => (
                <MarketingVitrinaSearch
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
            renderMobileRows={({ rows: mobileRows, onEdit, onDelete }) => (
                <MarketingVitrinaMobileCards
                    rows={mobileRows}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLogoPreview={(url, label) =>
                        setLogoPreview({ url, label })
                    }
                />
            )}
            upsert={{
                titleCreate: 'Nuevo cliente de vitrina',
                titleEdit: 'Editar cliente de vitrina',
                createAction: '/panel/marketing-vitrina',
                updateAction: (row) => `/panel/marketing-vitrina/${row.id}`,
                submitLabelCreate: 'Crear',
                submitLabelEdit: 'Guardar cambios',
                successToastTitle: 'Cliente de vitrina guardado',
                encType: 'multipart/form-data',
                /** Slug y logo son opcionales; la heurística global pedía `slug` lleno. */
                requiredFieldNames: ['legal_name'],
                renderFormFields: ({ mode, item, errors }) => (
                    <ShowcaseClientFormFields
                        key={item?.id ?? 'create'}
                        mode={mode}
                        item={item}
                        errors={errors}
                        nextSortOrder={nextSortOrder}
                    />
                ),
            }}
            delete={{
                title: 'Eliminar registro',
                description:
                    'Se quitará de la base de datos. Si estaba en vitrina, dejará de mostrarse en la web.',
                deleteAction: (row) => `/panel/marketing-vitrina/${row.id}`,
                entityLabel: (row) =>
                    row.display_name?.trim() || row.legal_name,
                confirmLabel: 'Eliminar',
            }}
        />
        </>
    );
}
