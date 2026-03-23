import { Link } from '@inertiajs/react';
import { Braces, Pencil, Trash2 } from 'lucide-react';

import type { CatalogSku } from '@/components/catalog/skus/CatalogSkuFormFields';
import panel from '@/routes/panel';

type Props = {
    rows: CatalogSku[];
    onEdit: (row: CatalogSku) => void;
    onDelete: (row: CatalogSku) => void;
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

export default function CatalogSkusMobileCards({ rows, onEdit, onDelete }: Props) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-border/60 p-4 text-center text-sm text-muted-foreground neumorph-inset">
                No hay SKUs todavía.
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/60 neumorph-inset">
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
                            <p className="truncate text-sm font-semibold text-foreground">{row.name}</p>
                            <p className="text-xs text-muted-foreground">{row.product?.name ?? 'Sin producto'}</p>
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
                            <p className="text-muted-foreground">Código</p>
                            <p className="truncate font-mono text-foreground">{row.code}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Precio</p>
                            <p className="text-foreground">
                                {row.currency} {Number(row.list_price).toFixed(2)}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-muted-foreground">Modelo</p>
                            <p className="text-foreground">{modelLabel(row.sale_model)}</p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
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
                </div>
            ))}
        </div>
    );
}

