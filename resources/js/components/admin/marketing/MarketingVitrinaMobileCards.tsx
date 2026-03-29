import { Pencil, Trash2 } from 'lucide-react';

import type { ShowcaseClientRow } from '@/components/admin/marketing/ShowcaseClientFormFields';

type Props = {
    rows: ShowcaseClientRow[];
    onEdit: (row: ShowcaseClientRow) => void;
    onDelete: (row: ShowcaseClientRow) => void;
    onLogoPreview: (url: string, label: string) => void;
};

const SECTOR_LABEL_ES: Record<string, string> = {
    retail: 'Retail',
    logistics: 'Logística',
    industry: 'Industria',
    services: 'Servicios',
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

function formatSectorLabel(sector: string | null | undefined): string {
    const s = sector?.trim();
    if (!s) {
        return '—';
    }
    const mapped = SECTOR_LABEL_ES[s.toLowerCase()];
    return mapped ?? s;
}

export default function MarketingVitrinaMobileCards({
    rows,
    onEdit,
    onDelete,
    onLogoPreview,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground neumorph-inset">
                No hay registros. Crea uno para la vitrina pública.
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/60 neumorph-inset">
            {rows.map((row, idx) => {
                const title =
                    row.display_name?.trim() || row.legal_name;
                return (
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
                                <p className="text-sm font-semibold leading-snug text-foreground">
                                    {title}
                                </p>
                                {row.display_name ? (
                                    <p className="text-[10px] text-muted-foreground">
                                        {row.legal_name}
                                    </p>
                                ) : null}
                            </div>
                            <span
                                className={[
                                    'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                    row.is_published
                                        ? 'bg-[#4A9A72]/15 text-[#4A9A72]'
                                        : 'bg-muted text-muted-foreground',
                                ].join(' ')}
                            >
                                {row.is_published ? 'Vitrina' : 'Borrador'}
                            </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <p className="text-muted-foreground">Orden</p>
                                <p className="font-mono text-foreground">
                                    {row.sort_order}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Sector</p>
                                <p className="text-foreground">
                                    {formatSectorLabel(row.sector)}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-muted-foreground">Web</p>
                                {row.website_url ? (
                                    <a
                                        href={row.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="break-all text-[#4A80B8] underline-offset-2 hover:underline"
                                    >
                                        {row.website_url.replace(
                                            /^https?:\/\//,
                                            '',
                                        )}
                                    </a>
                                ) : (
                                    <p className="text-foreground">—</p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <p className="text-muted-foreground">
                                    Autorización
                                </p>
                                <p className="text-foreground">
                                    {formatDate(row.authorized_at)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                            <div>
                                {row.logo_public_url ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onLogoPreview(
                                                row.logo_public_url as string,
                                                title,
                                            )
                                        }
                                        className="cursor-pointer rounded-md border border-border/50 bg-muted/30 p-0.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/40"
                                        aria-label="Ver logo en tamaño completo"
                                    >
                                        <img
                                            src={row.logo_public_url}
                                            alt=""
                                            className="h-10 w-10 rounded-md object-contain"
                                        />
                                    </button>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        Sin logo
                                    </span>
                                )}
                            </div>
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
                );
            })}
        </div>
    );
}
