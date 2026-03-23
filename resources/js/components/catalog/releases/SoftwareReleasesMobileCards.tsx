import { Link } from '@inertiajs/react';
import { Package, Pencil, Trash2 } from 'lucide-react';

import type { ReleaseRow } from '@/components/catalog/releases/SoftwareReleaseFormFields';

type Props = {
    rows: ReleaseRow[];
    onEdit: (row: ReleaseRow) => void;
    onDelete: (row: ReleaseRow) => void;
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

export default function SoftwareReleasesMobileCards({
    rows,
    onEdit,
    onDelete,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="neumorph-inset rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground">
                No hay versiones registradas.
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
                                {row.product?.name ?? '—'}
                            </p>
                            <p className="font-mono text-xs text-[#4A80B8]">
                                v{row.version}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                {formatReleased(row.released_at)}
                            </p>
                        </div>

                        {row.is_latest ? (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-[#4A80B8]/15 px-2 py-0.5 text-[10px] font-medium text-[#4A80B8]">
                                Última
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                        <Link
                            href={`/panel/catalogo-releases/${row.id}/assets`}
                            prefetch
                            className="group inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]/30"
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
                </div>
            ))}
        </div>
    );
}
