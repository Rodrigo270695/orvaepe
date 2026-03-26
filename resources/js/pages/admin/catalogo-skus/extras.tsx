import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Braces, Plus, Save, TableProperties, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { NeuButtonInset } from '@/components/ui/neu-button-inset';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { getCsrfToken } from '@/lib/csrf';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import { isSkuMetadataImageItemKey } from '@/constants/skuExtrasTemplate';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import panel from '@/routes/panel';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

type SkuPayload = {
    id: string;
    code: string;
    name: string;
    product?: {
        id: string;
        name: string;
        slug: string;
        category?: { name?: string } | null;
    } | null;
};

type Props = {
    sku: SkuPayload;
    limitsPairs?: SpecPair[] | null;
    metadataPairs?: SpecPair[] | null;
};

type TabId = 'limits' | 'metadata';
type ValueKind = 'text' | 'list';
type GroupKey = 'limits_pairs' | 'metadata_pairs';

type SpecPair = {
    code: string;
    value_kind: ValueKind;
    value: string;
    values: string[];
};

function emptyRow(): SpecPair {
    return {
        code: '',
        value_kind: 'text',
        value: '',
        values: [''],
    };
}

function normalizeIncomingPairs(raw: unknown[]): SpecPair[] {
    return raw.map((row) => {
        const r = row as Record<string, unknown>;
        const kind = r.value_kind === 'list' ? 'list' : 'text';
        const vals = Array.isArray(r.values) ? r.values : [];

        if (kind === 'list') {
            const list = vals.map((v) => String(v ?? ''));
            return {
                code: String(r.code ?? ''),
                value_kind: 'list',
                value: '',
                values: list.length > 0 ? list : [''],
            };
        }

        return {
            code: String(r.code ?? ''),
            value_kind: 'text',
            value: String(r.value ?? ''),
            values: [''],
        };
    });
}

function asPairs(raw: unknown): SpecPair[] {
    if (!Array.isArray(raw)) {
        return [];
    }
    return normalizeIncomingPairs(raw).map(normalizeImageMetadataPair);
}

/** Una sola URL para metadatos de imagen del ítem (vista /licencias). */
function deriveSingleImageUrlFromPair(pair: SpecPair): string {
    if (pair.value_kind === 'list') {
        const first = (pair.values ?? []).map((v) => v.trim()).find((v) => v !== '');
        return first ?? '';
    }
    return (pair.value ?? '').trim();
}

function normalizeImageMetadataPair(row: SpecPair): SpecPair {
    if (!isSkuMetadataImageItemKey(row.code)) {
        return row;
    }
    if (row.value_kind === 'list') {
        const url = deriveSingleImageUrlFromPair(row);
        return {
            ...row,
            value_kind: 'text',
            value: url,
            values: [''],
        };
    }
    return row;
}

export default function CatalogSkuExtrasPage({
    sku,
    limitsPairs: initialLimitsPairs,
    metadataPairs: initialMetadataPairs,
}: Props) {
    const extrasUrl = panel.catalogoSkus.extras.index.url(sku.id);
    const updateUrl = panel.catalogoSkus.extras.update.url(sku.id);
    const uploadImagesUrl = `/panel/catalogo-skus/${sku.id}/extras/imagenes`;

    const form = useForm<{
        limits_pairs: SpecPair[];
        metadata_pairs: SpecPair[];
    }>({
        limits_pairs:
            asPairs(initialLimitsPairs).length > 0
                ? asPairs(initialLimitsPairs)
                : [emptyRow()],
        metadata_pairs:
            asPairs(initialMetadataPairs).length > 0
                ? asPairs(initialMetadataPairs)
                : [emptyRow()],
    });

    const { data, setData, errors, processing, patch } = form;
    const [tab, setTab] = useState<TabId>('limits');
    const [imagesUploading, setImagesUploading] = useState(false);
    const [imagesUploadError, setImagesUploadError] = useState<string | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    const groupFromTab = (tabId: TabId): GroupKey =>
        tabId === 'limits' ? 'limits_pairs' : 'metadata_pairs';

    const rowsForTab = (tabId: TabId): SpecPair[] => {
        const rows = data[groupFromTab(tabId)];
        return Array.isArray(rows) ? rows : [emptyRow()];
    };

    const setRowsForTab = (tabId: TabId, rows: SpecPair[]) => {
        setData(groupFromTab(tabId), rows);
    };

    const addPair = (tabId: TabId) => {
        setRowsForTab(tabId, [...rowsForTab(tabId), emptyRow()]);
    };

    const removePair = (tabId: TabId, index: number) => {
        const next = rowsForTab(tabId).filter((_, i) => i !== index);
        setRowsForTab(tabId, next.length > 0 ? next : [emptyRow()]);
    };

    const updateRow = (tabId: TabId, index: number, patchRow: Partial<SpecPair>) => {
        setRowsForTab(
            tabId,
            rowsForTab(tabId).map((row, i) => (i === index ? { ...row, ...patchRow } : row)),
        );
    };

    const setValueKind = (tabId: TabId, index: number, kind: ValueKind) => {
        const row = rowsForTab(tabId)[index];
        if (!row) return;

        if (kind === 'list' && row.value_kind === 'text') {
            const lines = row.value
                .split(/\r?\n/)
                .map((s) => s.trim())
                .filter(Boolean);
            updateRow(tabId, index, {
                value_kind: 'list',
                value: '',
                values: lines.length > 0 ? lines : [''],
            });
            return;
        }

        if (kind === 'text' && row.value_kind === 'list') {
            const joined = row.values.map((s) => s.trim()).filter(Boolean).join(', ');
            updateRow(tabId, index, {
                value_kind: 'text',
                value: joined,
                values: [''],
            });
        }
    };

    const addListItem = (tabId: TabId, pairIndex: number) => {
        const row = rowsForTab(tabId)[pairIndex];
        if (!row) return;
        updateRow(tabId, pairIndex, { values: [...row.values, ''] });
    };

    const updateListItem = (tabId: TabId, pairIndex: number, valueIndex: number, value: string) => {
        const row = rowsForTab(tabId)[pairIndex];
        if (!row) return;
        const next = row.values.map((v, i) => (i === valueIndex ? value : v));
        updateRow(tabId, pairIndex, { values: next });
    };

    const removeListItem = (tabId: TabId, pairIndex: number, valueIndex: number) => {
        const row = rowsForTab(tabId)[pairIndex];
        if (!row) return;
        if (row.values.length <= 1) {
            updateRow(tabId, pairIndex, { values: [''] });
            return;
        }
        updateRow(tabId, pairIndex, {
            values: row.values.filter((_, i) => i !== valueIndex),
        });
    };

    const fieldErr = (tabId: TabId, index: number, field: 'code' | 'value' | 'values') => {
        const group = groupFromTab(tabId);
        return errors[`${group}.${index}.${field}` as keyof typeof errors];
    };

    const uploadImagesForPair = async (tabId: TabId, pairIndex: number, files: File[]): Promise<void> => {
        const row = rowsForTab(tabId)[pairIndex];
        if (!row || files.length === 0) {
            return;
        }

        setImagesUploading(true);
        setImagesUploadError(null);

        try {
            const fd = new FormData();
            const file = files[0];
            if (!file) {
                return;
            }
            fd.append('files[]', file);

            const res = await fetch(uploadImagesUrl, {
                method: 'POST',
                body: fd,
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!res.ok) {
                const j = await res
                    .json()
                    .catch(() => ({ message: 'Error al subir imágenes' }));
                throw new Error(
                    typeof j?.message === 'string' ? j.message : 'Error al subir imágenes',
                );
            }

            const json = (await res.json()) as { urls?: string[] };
            const newUrls = (json.urls ?? [])
                .map((u) => (typeof u === 'string' ? u.trim() : ''))
                .filter(Boolean);

            if (newUrls.length === 0) {
                throw new Error('No se recibieron URLs de imágenes.');
            }

            const url = newUrls[0] ?? '';

            updateRow(tabId, pairIndex, {
                value_kind: 'text',
                value: url,
                values: [''],
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al subir imágenes';
            setImagesUploadError(msg);
        } finally {
            setImagesUploading(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle('catalogo-skus'), href: panelPath('catalogo-skus') },
        { title: `Límites y metadata · ${sku.code}`, href: extrasUrl },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Límites y metadata · ${sku.name}`} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={panelPath('catalogo-skus')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a SKUs
                    </Link>
                </div>

                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-sm font-bold">Límites y metadata</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {sku.name}
                                {sku.product?.name ? (
                                    <span className="text-muted-foreground/80">
                                        {' '}
                                        · {sku.product.name}
                                    </span>
                                ) : null}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{sku.code}</p>
                        </div>
                    </div>
                </NeuCardRaised>

                <form
                    className="mt-4 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        patch(updateUrl, { preserveScroll: true });
                    }}
                >
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Cada tarjeta representa una clave del SKU. Puedes usar valor tipo texto o lista. Un solo
                        guardado aplica ambos bloques.
                    </p>

                    <div
                        className="flex flex-wrap gap-2"
                        role="tablist"
                        aria-label="Sección de edición"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'limits'}
                            className={cn(
                                'inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold transition-colors',
                                tab === 'limits'
                                    ? 'bg-[#4A80B8]/20 text-[#4A80B8]'
                                    : 'neumorph-inset text-muted-foreground hover:text-foreground',
                            )}
                            onClick={() => setTab('limits')}
                        >
                            <Braces className="size-4 shrink-0" />
                            Límites
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'metadata'}
                            className={cn(
                                'inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold transition-colors',
                                tab === 'metadata'
                                    ? 'bg-[#4A80B8]/20 text-[#4A80B8]'
                                    : 'neumorph-inset text-muted-foreground hover:text-foreground',
                            )}
                            onClick={() => setTab('metadata')}
                        >
                            <Braces className="size-4 shrink-0" />
                            Metadatos
                        </button>
                    </div>

                    <div
                        className={cn('space-y-3', tab !== 'limits' && 'hidden')}
                        role="tabpanel"
                        aria-hidden={tab !== 'limits'}
                    >
                        <div className="flex items-center justify-end gap-2">
                            <NeuButtonRaised
                                type="submit"
                                className="cursor-pointer"
                                disabled={processing}
                            >
                                <Save className="size-4 text-[#4A9A72]" />
                                {processing ? 'Guardando…' : 'Guardar límites y metadatos'}
                            </NeuButtonRaised>
                            <NeuButtonRaised
                                type="button"
                                className="cursor-pointer"
                                onClick={() => addPair('limits')}
                            >
                                <Plus className="size-4 text-[#4A9A72]" />
                                Añadir límite
                            </NeuButtonRaised>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {(data.limits_pairs ?? []).map((row, index) => (
                                <NeuCardRaised key={`limits-${index}`} className="rounded-xl border border-border/60 p-3">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            <TableProperties className="size-3.5 shrink-0 text-[#4A80B8]" />
                                            <span className="truncate">Límite {index + 1}</span>
                                        </div>
                                        <NeuButtonInset
                                            type="button"
                                            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center p-0"
                                            onClick={() => removePair('limits', index)}
                                            aria-label="Quitar límite"
                                        >
                                            <Trash2 className="size-3.5 text-[#C05050]/80" />
                                        </NeuButtonInset>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-medium text-muted-foreground">Clave</label>
                                            <input
                                                type="text"
                                                value={row.code}
                                                onChange={(e) => updateRow('limits', index, { code: e.target.value })}
                                                placeholder="ej. usuarios"
                                                className={cn(
                                                    'neumorph-inset w-full rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none',
                                                    'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                                                )}
                                            />
                                            {fieldErr('limits', index, 'code') ? (
                                                <p className="text-xs text-[#C05050]">{fieldErr('limits', index, 'code')}</p>
                                            ) : null}
                                        </div>

                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium text-muted-foreground">Tipo de valor</p>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors',
                                                        row.value_kind === 'text'
                                                            ? 'bg-[#4A80B8]/20 text-[#4A80B8]'
                                                            : 'neumorph-inset text-muted-foreground hover:text-foreground',
                                                    )}
                                                    onClick={() => setValueKind('limits', index, 'text')}
                                                >
                                                    Texto
                                                </button>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors',
                                                        row.value_kind === 'list'
                                                            ? 'bg-[#4A80B8]/20 text-[#4A80B8]'
                                                            : 'neumorph-inset text-muted-foreground hover:text-foreground',
                                                    )}
                                                    onClick={() => setValueKind('limits', index, 'list')}
                                                >
                                                    Lista
                                                </button>
                                            </div>
                                        </div>

                                        {row.value_kind === 'text' ? (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-medium text-muted-foreground">Valor</label>
                                                <textarea
                                                    value={row.value}
                                                    onChange={(e) => updateRow('limits', index, { value: e.target.value })}
                                                    rows={2}
                                                    className={cn(
                                                        'neumorph-inset min-h-13 w-full resize-y rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none',
                                                        'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                                                    )}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[10px] font-medium text-muted-foreground">Valores</span>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/12"
                                                        onClick={() => addListItem('limits', index)}
                                                    >
                                                        <Plus className="size-3.5" />
                                                        Añadir
                                                    </button>
                                                </div>
                                                <ul className="space-y-2">
                                                    {row.values.map((v, vi) => (
                                                        <li key={`limits-${index}-${vi}`} className="flex items-center gap-1.5">
                                                            <input
                                                                type="text"
                                                                value={v}
                                                                onChange={(e) =>
                                                                    updateListItem('limits', index, vi, e.target.value)
                                                                }
                                                                placeholder={`Ítem ${vi + 1}`}
                                                                className={cn(
                                                                    'neumorph-inset min-w-0 flex-1 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none',
                                                                    'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                                                                )}
                                                            />
                                                            <NeuButtonInset
                                                                type="button"
                                                                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center p-0"
                                                                onClick={() => removeListItem('limits', index, vi)}
                                                                aria-label="Quitar ítem"
                                                            >
                                                                <X className="size-3.5 text-muted-foreground" />
                                                            </NeuButtonInset>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </NeuCardRaised>
                            ))}
                        </div>
                    </div>

                    <div
                        className={cn('space-y-3', tab !== 'metadata' && 'hidden')}
                        role="tabpanel"
                        aria-hidden={tab !== 'metadata'}
                    >
                        <div className="flex items-center justify-end gap-2">
                            <NeuButtonRaised
                                type="submit"
                                className="cursor-pointer"
                                disabled={processing}
                            >
                                <Save className="size-4 text-[#4A9A72]" />
                                {processing ? 'Guardando…' : 'Guardar límites y metadatos'}
                            </NeuButtonRaised>
                            <NeuButtonRaised
                                type="button"
                                className="cursor-pointer"
                                onClick={() => addPair('metadata')}
                            >
                                <Plus className="size-4 text-[#4A9A72]" />
                                Añadir metadato
                            </NeuButtonRaised>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {(data.metadata_pairs ?? []).map((row, index) => (
                                <NeuCardRaised key={`metadata-${index}`} className="rounded-xl border border-border/60 p-3">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            <TableProperties className="size-3.5 shrink-0 text-[#4A80B8]" />
                                            <span className="truncate">Metadato {index + 1}</span>
                                        </div>
                                        <NeuButtonInset
                                            type="button"
                                            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center p-0"
                                            onClick={() => removePair('metadata', index)}
                                            aria-label="Quitar metadato"
                                        >
                                            <Trash2 className="size-3.5 text-[#C05050]/80" />
                                        </NeuButtonInset>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-medium text-muted-foreground">Clave</label>
                                            <input
                                                type="text"
                                                value={row.code}
                                                onChange={(e) => updateRow('metadata', index, { code: e.target.value })}
                                                placeholder="ej. detalle"
                                                className={cn(
                                                    'neumorph-inset w-full rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none',
                                                    'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                                                )}
                                            />
                                            {fieldErr('metadata', index, 'code') ? (
                                                <p className="text-xs text-[#C05050]">{fieldErr('metadata', index, 'code')}</p>
                                            ) : null}
                                        </div>

                                        {!isSkuMetadataImageItemKey(row.code) ? (
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-medium text-muted-foreground">Tipo de valor</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            'flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors',
                                                            row.value_kind === 'text'
                                                                ? 'bg-[#4A80B8]/20 text-[#4A80B8]'
                                                                : 'neumorph-inset text-muted-foreground hover:text-foreground',
                                                        )}
                                                        onClick={() => setValueKind('metadata', index, 'text')}
                                                    >
                                                        Texto
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            'flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors',
                                                            row.value_kind === 'list'
                                                                ? 'bg-[#4A80B8]/20 text-[#4A80B8]'
                                                                : 'neumorph-inset text-muted-foreground hover:text-foreground',
                                                        )}
                                                        onClick={() => setValueKind('metadata', index, 'list')}
                                                    >
                                                        Lista
                                                    </button>
                                                </div>
                                            </div>
                                        ) : null}

                                        {isSkuMetadataImageItemKey(row.code) ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[10px] font-medium text-muted-foreground">
                                                        Imagen del ítem
                                                    </span>
                                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-[10px] font-semibold text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/12">
                                                        <Upload className="size-3.5" />
                                                        {deriveSingleImageUrlFromPair(row) ? 'Cambiar' : 'Subir'}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={(e) => {
                                                                const files = Array.from(e.target.files ?? []);
                                                                if (files.length > 0) {
                                                                    void uploadImagesForPair('metadata', index, files);
                                                                }
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-[10px] leading-relaxed text-muted-foreground">
                                                    Solo una imagen; es la que se muestra en la tarjeta del catálogo de licencias.
                                                </p>
                                                {imagesUploading ? (
                                                    <p className="text-xs text-muted-foreground">Subiendo…</p>
                                                ) : null}
                                                {imagesUploadError ? (
                                                    <p className="text-xs text-[#C05050]">{imagesUploadError}</p>
                                                ) : null}
                                                {(() => {
                                                    const url = deriveSingleImageUrlFromPair(row);
                                                    if (url === '') {
                                                        return (
                                                            <p className="text-xs text-muted-foreground">
                                                                Sin imagen (se usará el icono por clave).
                                                            </p>
                                                        );
                                                    }
                                                    return (
                                                        <div className="relative mx-auto max-w-48">
                                                            <button
                                                                type="button"
                                                                className="block w-full cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-black/5 text-left transition-opacity hover:opacity-90"
                                                                onClick={() => setImagePreviewUrl(url)}
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt=""
                                                                    className="aspect-square w-full object-contain"
                                                                    loading="lazy"
                                                                    decoding="async"
                                                                />
                                                            </button>
                                                            <NeuButtonInset
                                                                type="button"
                                                                className="absolute right-1 top-1 z-10 inline-flex h-7 w-7 cursor-pointer items-center justify-center p-0 shadow-sm"
                                                                onClick={() => {
                                                                    updateRow('metadata', index, {
                                                                        value_kind: 'text',
                                                                        value: '',
                                                                        values: [''],
                                                                    });
                                                                }}
                                                                aria-label="Quitar imagen"
                                                            >
                                                                <X className="size-3.5 text-muted-foreground" />
                                                            </NeuButtonInset>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : row.value_kind === 'text' ? (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-medium text-muted-foreground">Valor</label>
                                                <textarea
                                                    value={row.value}
                                                    onChange={(e) => updateRow('metadata', index, { value: e.target.value })}
                                                    rows={2}
                                                    className={cn(
                                                        'neumorph-inset min-h-13 w-full resize-y rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none',
                                                        'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                                                    )}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[10px] font-medium text-muted-foreground">Valores</span>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/12"
                                                        onClick={() => addListItem('metadata', index)}
                                                    >
                                                        <Plus className="size-3.5" />
                                                        Añadir
                                                    </button>
                                                </div>
                                                <ul className="space-y-2">
                                                    {row.values.map((v, vi) => (
                                                        <li key={`metadata-${index}-${vi}`} className="flex items-center gap-1.5">
                                                            <input
                                                                type="text"
                                                                value={v}
                                                                onChange={(e) =>
                                                                    updateListItem('metadata', index, vi, e.target.value)
                                                                }
                                                                placeholder={`Ítem ${vi + 1}`}
                                                                className={cn(
                                                                    'neumorph-inset min-w-0 flex-1 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none',
                                                                    'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                                                                )}
                                                            />
                                                            <NeuButtonInset
                                                                type="button"
                                                                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center p-0"
                                                                onClick={() => removeListItem('metadata', index, vi)}
                                                                aria-label="Quitar ítem"
                                                            >
                                                                <X className="size-3.5 text-muted-foreground" />
                                                            </NeuButtonInset>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </NeuCardRaised>
                            ))}
                        </div>
                    </div>

                </form>
            </div>
            <Dialog
                open={imagePreviewUrl !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setImagePreviewUrl(null);
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] max-w-[min(96vw,56rem)] border-border/60 bg-background p-3 sm:p-4">
                    <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
                    <DialogDescription className="sr-only">
                        Vista previa ampliada de la imagen del metadato.
                    </DialogDescription>
                    {imagePreviewUrl ? (
                        <img
                            src={imagePreviewUrl}
                            alt=""
                            className="mx-auto max-h-[85vh] w-auto max-w-full object-contain"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
