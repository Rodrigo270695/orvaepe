import { Bell, LogOut, Pencil, QrCode, Send, Trash2 } from 'lucide-react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

import { OpenWaStatusBadge } from './OpenWaStatusBadge';
import type { OpenWaLine, OpenWaProduct } from './types';

type Props = {
    line: OpenWaLine;
    products: OpenWaProduct[];
    configured: boolean;
    onLink: () => void;
    onTest: () => void;
    onEdit: () => void;
    onLogout: () => void;
    onDelete: () => void;
};

export function OpenWaLineCard({ line, products, configured, onLink, onTest, onEdit, onLogout, onDelete }: Props) {
    const productLabels = line.productos.map((key) => products.find((p) => p.key === key)?.label ?? key);
    const showError = line.last_error && !line.is_ready;

    return (
        <div className="neumorph-inset flex flex-col gap-4 rounded-xl border border-border/60 p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold">{line.nombre}</h2>
                    <p className="font-mono text-[10px] text-muted-foreground">{line.session_name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    {line.envia_notificaciones ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--o-amber)_14%,transparent)] px-2 py-0.5 text-[10px] font-semibold">
                            <Bell className="size-3" aria-hidden /> Notificaciones
                        </span>
                    ) : null}
                    <OpenWaStatusBadge status={line.status} />
                </div>
            </div>

            <dl className="grid gap-2 text-[11px]">
                <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">Número</dt>
                    <dd className="font-mono font-medium">
                        {line.phone ?? <span className="text-muted-foreground">—</span>}
                        {line.push_name ? (
                            <span className="ml-2 font-sans text-muted-foreground">({line.push_name})</span>
                        ) : null}
                    </dd>
                </div>
                <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">Atiende</dt>
                    <dd className="flex flex-wrap gap-1.5">
                        {productLabels.length > 0 ? (
                            productLabels.map((label) => (
                                <span
                                    key={label}
                                    className="rounded-full bg-[color-mix(in_oklab,var(--o-amber)_14%,transparent)] px-2 py-0.5 text-[10px] font-semibold"
                                >
                                    {label}
                                </span>
                            ))
                        ) : (
                            <span className="text-muted-foreground">Ningún SaaS asignado</span>
                        )}
                    </dd>
                </div>
            </dl>

            {showError ? <p className="text-[11px] text-destructive">{line.last_error}</p> : null}

            <div className="mt-auto flex flex-wrap items-center gap-2">
                {line.is_ready ? (
                    <>
                        <NeuButtonRaised type="button" onClick={onTest}>
                            <Send className="size-4" aria-hidden /> Probar envío
                        </NeuButtonRaised>
                        <NeuButtonRaised type="button" onClick={onLogout} className="text-destructive">
                            <LogOut className="size-4" aria-hidden /> Desvincular
                        </NeuButtonRaised>
                    </>
                ) : (
                    <NeuButtonRaised type="button" onClick={onLink} disabled={!configured}>
                        <QrCode className="size-4" aria-hidden /> Vincular con QR
                    </NeuButtonRaised>
                )}
                <div className="ml-auto flex gap-1">
                    <NeuButtonRaised
                        type="button"
                        onClick={onEdit}
                        className="size-9 px-0 text-muted-foreground"
                        aria-label={`Editar ${line.nombre}`}
                        title="Editar"
                    >
                        <Pencil className="size-4" aria-hidden />
                    </NeuButtonRaised>
                    <NeuButtonRaised
                        type="button"
                        onClick={onDelete}
                        className="size-9 px-0 text-destructive"
                        aria-label={`Eliminar ${line.nombre}`}
                        title="Eliminar"
                    >
                        <Trash2 className="size-4" aria-hidden />
                    </NeuButtonRaised>
                </div>
            </div>
        </div>
    );
}
