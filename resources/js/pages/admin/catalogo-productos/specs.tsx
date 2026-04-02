import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Plus,
    Save,
    TableProperties,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useState } from 'react';

import AdminModalShell from '@/components/ui/admin-modal-shell';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { NeuButtonInset } from '@/components/ui/neu-button-inset';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import panel from '@/routes/panel';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';
import { getCsrfToken } from '@/lib/csrf';
import {
    isSoftwareSpecsImagesKey,
    SOFTWARE_SPECS_IMAGES_CANONICAL,
} from '@/constants/softwareSpecsTemplate';

export type ValueKind = 'text' | 'list';

export type SpecPair = {
    code: string;
    value_kind: ValueKind;
    value: string;
    values: string[];
};

type ProductPayload = {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    category?: { name?: string; revenue_line?: string } | null;
};

type Props = {
    product: ProductPayload;
    pairs: SpecPair[];
};

function normalizeIncomingPairs(raw: unknown[]): SpecPair[] {
    return raw.map((row) => {
        const r = row as Record<string, unknown>;
        const kind = r.value_kind === 'list' ? 'list' : 'text';
        const vals = r.values;
        if (kind === 'list' && Array.isArray(vals)) {
            const list = vals.map((v) => String(v ?? ''));
            return {
                code: String(r.code ?? ''),
                value_kind: 'list' as const,
                value: '',
                values: list.length > 0 ? list : [''],
            };
        }
        return {
            code: String(r.code ?? ''),
            value_kind: 'text' as const,
            value: String(r.value ?? ''),
            values: [''],
        };
    });
}

const emptyRow = (): SpecPair => ({
    code: '',
    value_kind: 'text',
    value: '',
    values: [''],
});

function deriveImageUrlsFromPair(pair: SpecPair): string[] {
    if (pair.value_kind === 'list') {
        return (pair.values ?? []).map((v) => v.trim()).filter(Boolean);
    }

    // Si está en modo texto, intentamos interpretar la cadena como múltiples URLs.
    const raw = pair.value ?? '';
    return raw
        .split(/[\n\r,]+/)
        .map((v) => v.trim())
        .filter(Boolean);
}

export default function CatalogProductSpecsPage({ product, pairs: initialPairs }: Props) {
    const specsUrl = panel.catalogoProductos.specs.index.url(product.id);
    const updateUrl = panel.catalogoProductos.specs.update.url(product.id);

    const form = useForm<{ pairs: SpecPair[] }>({
        pairs:
            initialPairs.length > 0
                ? normalizeIncomingPairs(initialPairs as unknown[])
                : [emptyRow()],
    });

    const { data, setData, errors, processing, patch } = form;

    const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
    const [specImagePreview, setSpecImagePreview] = useState<{
        url: string;
    } | null>(null);

    const addPair = () => {
        setData('pairs', [...data.pairs, emptyRow()]);
    };

    const removePair = (index: number) => {
        const next = data.pairs.filter((_, i) => i !== index);
        setData('pairs', next.length > 0 ? next : [emptyRow()]);
    };

    const updateRow = (index: number, patchRow: Partial<SpecPair>) => {
        setData(
            'pairs',
            data.pairs.map((row, i) => (i === index ? { ...row, ...patchRow } : row)),
        );
    };

    const setValueKind = (index: number, kind: ValueKind) => {
        const row = data.pairs[index];
        if (!row) return;
        if (kind === 'list' && row.value_kind === 'text') {
            const v = row.value.trim();
            const lines = v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
            updateRow(index, {
                value_kind: 'list',
                value: '',
                values: lines.length > 0 ? lines : [''],
            });
        } else if (kind === 'text' && row.value_kind === 'list') {
            const joined = row.values.map((s) => s.trim()).filter(Boolean).join(', ');
            updateRow(index, {
                value_kind: 'text',
                value: joined,
                values: [''],
            });
        }
    };

    const addListItem = (index: number) => {
        const row = data.pairs[index];
        if (!row) return;
        updateRow(index, { values: [...row.values, ''] });
    };

    const updateListItem = (pairIndex: number, valueIndex: number, value: string) => {
        const row = data.pairs[pairIndex];
        if (!row) return;
        const next = row.values.map((v, i) => (i === valueIndex ? value : v));
        updateRow(pairIndex, { values: next });
    };

    const removeListItem = (pairIndex: number, valueIndex: number) => {
        const row = data.pairs[pairIndex];
        if (!row) return;
        if (row.values.length <= 1) {
            updateRow(pairIndex, { values: [''] });
            return;
        }
        updateRow(pairIndex, {
            values: row.values.filter((_, i) => i !== valueIndex),
        });
    };

    const specsImagesUploadUrl = `/panel/catalogo-productos/${product.id}/medios/specs-images`;
    const [imagesUploading, setImagesUploading] = useState(false);
    const [imagesUploadError, setImagesUploadError] = useState<string | null>(
        null,
    );

    const uploadImagesForPair = async (
        pairIndex: number,
        files: File[],
    ): Promise<void> => {
        const row = data.pairs[pairIndex];
        if (!row || files.length === 0) {
            return;
        }

        setImagesUploading(true);
        setImagesUploadError(null);

        try {
            const fd = new FormData();
            files.forEach((f) => fd.append('files[]', f));

            const res = await fetch(specsImagesUploadUrl, {
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
                    typeof j?.message === 'string'
                        ? j.message
                        : 'Error al subir imágenes',
                );
            }

            const json = (await res.json()) as {
                urls?: string[];
            };

            const newUrls = (json.urls ?? [])
                .map((u) => (typeof u === 'string' ? u.trim() : ''))
                .filter(Boolean);

            if (newUrls.length === 0) {
                throw new Error(
                    'No se recibieron URLs de imágenes (respuesta vacía).',
                );
            }

            const currentUrls = deriveImageUrlsFromPair(row);
            const nextUrls = [...currentUrls, ...newUrls];

            updateRow(pairIndex, {
                value_kind: 'list',
                value: '',
                values: nextUrls.length > 0 ? nextUrls : [''],
            });
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : 'Error al subir imágenes';
            setImagesUploadError(msg);
        } finally {
            setImagesUploading(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle('catalogo-productos'), href: panelPath('catalogo-productos') },
        { title: `Especificaciones · ${product.name}`, href: specsUrl },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Especificaciones · ${product.name}`} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={panelPath('catalogo-productos')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a productos
                    </Link>
                </div>

                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-sm font-bold">Especificaciones técnicas</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {product.name}
                                {product.category?.name ? (
                                    <span className="text-muted-foreground/80">
                                        {' '}
                                        · {product.category.name}
                                    </span>
                                ) : null}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{product.slug}</p>
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
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <p className="max-w-xl text-[11px] leading-relaxed text-muted-foreground">
                            Cada tarjeta es un <span className="font-medium text-foreground">código</span> con valor en
                            modo <strong className="text-foreground">texto</strong> o{' '}
                            <strong className="text-foreground">lista</strong> (varios ítems; se guarda como array JSON
                            tipo <code className="text-[10px]">[&quot;ventas&quot;,&quot;compras&quot;]</code>).
                        </p>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <NeuButtonRaised
                                type="button"
                                className="cursor-pointer shrink-0"
                                onClick={addPair}
                            >
                                <Plus className="size-4 text-[#4A9A72]" />
                                Añadir fila
                            </NeuButtonRaised>
                            <NeuButtonRaised
                                type="submit"
                                className="cursor-pointer shrink-0"
                                disabled={processing}
                            >
                                <Save className="size-4 text-[#4A80B8]" />
                                {processing ? 'Guardando…' : 'Guardar especificaciones'}
                            </NeuButtonRaised>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {data.pairs.map((row, index) => (
                            <NeuCardRaised
                                key={index}
                                className="rounded-xl border border-border/60 p-3"
                            >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        <TableProperties className="size-3.5 shrink-0 text-[#4A80B8]" />
                                        <span className="truncate">Esp. {index + 1}</span>
                                    </div>
                                    <NeuButtonInset
                                        type="button"
                                        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center p-0"
                                        onClick={() => setPendingDeleteIndex(index)}
                                        aria-label="Quitar fila"
                                    >
                                        <Trash2 className="size-3.5 text-[#C05050]/80" />
                                    </NeuButtonInset>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="space-y-1">
                                        <label
                                            htmlFor={`spec-code-${index}`}
                                            className="text-[10px] font-medium text-muted-foreground"
                                        >
                                            Código
                                        </label>
                                        <input
                                            id={`spec-code-${index}`}
                                            type="text"
                                            value={row.code}
                                            onChange={(e) =>
                                                updateRow(index, { code: e.target.value })
                                            }
                                            placeholder="ej. modulos"
                                            autoComplete="off"
                                            className={cn(
                                                'neumorph-inset w-full rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none',
                                                'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                                            )}
                                        />
                                        <FieldError
                                            message={fieldErr(errors, index, 'code')}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-medium text-muted-foreground"
                                        >
                                            Tipo de valor
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className={cn(
                                                    'flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors',
                                                    row.value_kind === 'text'
                                                        ? 'bg-[#4A80B8]/20 text-[#4A80B8]'
                                                        : 'neumorph-inset text-muted-foreground hover:text-foreground',
                                                )}
                                                onClick={() => setValueKind(index, 'text')}
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
                                                onClick={() => setValueKind(index, 'list')}
                                            >
                                                Lista
                                            </button>
                                        </div>
                                    </div>

                                    {isSoftwareSpecsImagesKey(row.code) ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-medium text-muted-foreground">
                                                    Imágenes
                                                </span>
                                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-[10px] font-semibold text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/12">
                                                    <Upload className="size-3.5" />
                                                    Subir
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const files = Array.from(
                                                                e.target.files ?? [],
                                                            );
                                                            if (files.length > 0) {
                                                                void uploadImagesForPair(
                                                                    index,
                                                                    files,
                                                                );
                                                            }
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                </label>
                                            </div>

                                            {imagesUploading ? (
                                                <p className="text-xs text-muted-foreground">
                                                    Subiendo…
                                                </p>
                                            ) : null}
                                            {imagesUploadError ? (
                                                <p className="text-xs text-[#C05050]">
                                                    {imagesUploadError}
                                                </p>
                                            ) : null}

                                            {(() => {
                                                const urls =
                                                    deriveImageUrlsFromPair(row);
                                                if (urls.length === 0) {
                                                    return (
                                                        <p className="text-xs text-muted-foreground">
                                                            Aún no hay imágenes.
                                                        </p>
                                                    );
                                                }

                                                return (
                                                    <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4">
                                                        {urls.map((url, vi) => (
                                                            <li
                                                                key={`${url}-${vi}`}
                                                                className="relative list-none"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="block w-full cursor-pointer overflow-hidden rounded-md border border-border/60 bg-black/5 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                                                                    onClick={() =>
                                                                        setSpecImagePreview({
                                                                            url,
                                                                        })
                                                                    }
                                                                >
                                                                    <img
                                                                        src={url}
                                                                        alt=""
                                                                        className="aspect-square w-full object-cover"
                                                                        loading="lazy"
                                                                        decoding="async"
                                                                    />
                                                                </button>
                                                                <NeuButtonInset
                                                                    type="button"
                                                                    className="absolute right-1 top-1 z-10 inline-flex h-7 w-7 cursor-pointer items-center justify-center p-0 shadow-sm"
                                                                    onClick={() => {
                                                                        const currentUrls =
                                                                            deriveImageUrlsFromPair(
                                                                                row,
                                                                            );
                                                                        const nextUrls =
                                                                            currentUrls.filter(
                                                                                (_, i) =>
                                                                                    i !== vi,
                                                                            );
                                                                        updateRow(index, {
                                                                            value_kind:
                                                                                'list',
                                                                            value: '',
                                                                            values:
                                                                                nextUrls.length >
                                                                                0
                                                                                    ? nextUrls
                                                                                    : [''],
                                                                        });
                                                                    }}
                                                                    aria-label="Quitar imagen"
                                                                >
                                                                    <X className="size-3.5 text-muted-foreground" />
                                                                </NeuButtonInset>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                );
                                            })()}
                                        </div>
                                    ) : row.value_kind === 'text' ? (
                                        <div className="space-y-1">
                                            <label
                                                htmlFor={`spec-value-${index}`}
                                                className="text-[10px] font-medium text-muted-foreground"
                                            >
                                                Valor
                                            </label>
                                            <textarea
                                                id={`spec-value-${index}`}
                                                value={row.value}
                                                onChange={(e) =>
                                                    updateRow(index, { value: e.target.value })
                                                }
                                                placeholder="ej. 8.2+"
                                                rows={2}
                                                className={cn(
                                                    'neumorph-inset w-full resize-y rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none',
                                                    'min-h-13 placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30',
                                                )}
                                            />
                                            <FieldError
                                                message={fieldErr(errors, index, 'value')}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-medium text-muted-foreground">
                                                    Valores
                                                </span>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/12"
                                                    onClick={() => addListItem(index)}
                                                >
                                                    <Plus className="size-3.5" />
                                                    Añadir
                                                </button>
                                            </div>
                                            <ul className="space-y-2">
                                                {row.values.map((v, vi) => (
                                                    <li
                                                        key={vi}
                                                        className="flex items-center gap-1.5"
                                                    >
                                                        <input
                                                            type="text"
                                                            value={v}
                                                            onChange={(e) =>
                                                                updateListItem(
                                                                    index,
                                                                    vi,
                                                                    e.target.value,
                                                                )
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
                                                            onClick={() =>
                                                                removeListItem(index, vi)
                                                            }
                                                            aria-label="Quitar ítem"
                                                        >
                                                            <X className="size-3.5 text-muted-foreground" />
                                                        </NeuButtonInset>
                                                    </li>
                                                ))}
                                            </ul>
                                            <FieldError
                                                message={fieldErr(errors, index, 'values')}
                                            />
                                        </div>
                                    )}
                                </div>
                            </NeuCardRaised>
                        ))}
                    </div>
                </form>
            </div>

            <Dialog
                open={specImagePreview !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSpecImagePreview(null);
                    }
                }}
            >
                <DialogContent className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden border-border/60 bg-background p-2 sm:max-w-[calc(100vw-2rem)] sm:p-3">
                    <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
                    <DialogDescription className="sr-only">
                        Vista previa ampliada de la imagen de especificación.
                    </DialogDescription>
                    {specImagePreview ? (
                        <img
                            src={specImagePreview.url}
                            alt=""
                            className="mx-auto block h-auto max-h-[min(88vh,88dvh)] w-auto max-w-full object-contain"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>

            {pendingDeleteIndex !== null ? (
                <AdminModalShell
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setPendingDeleteIndex(null);
                        }
                    }}
                    title="Quitar especificación"
                    description="Confirmar eliminación de la fila del formulario"
                >
                    <div className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                            ¿Seguro que deseas quitar esta fila
                            {data.pairs[pendingDeleteIndex]?.code ? (
                                <>
                                    {' '}
                                    (
                                    <span className="font-mono font-semibold text-foreground">
                                        {data.pairs[pendingDeleteIndex].code}
                                    </span>
                                    )
                                </>
                            ) : (
                                <span className="text-foreground"> (Esp. {pendingDeleteIndex + 1})</span>
                            )}
                            ? Los cambios en el formulario no se guardan en el servidor hasta que pulses
                            «Guardar especificaciones».
                        </p>
                        <DialogFooter className="gap-2 sm:justify-end">
                            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
                                <NeuButtonInset
                                    type="button"
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-[13px] sm:w-auto"
                                    onClick={() => setPendingDeleteIndex(null)}
                                >
                                    <X className="size-4 text-[#C05050]" />
                                    Cancelar
                                </NeuButtonInset>
                                <NeuButtonRaised
                                    type="button"
                                    className="w-full cursor-pointer text-[13px] sm:w-auto"
                                    onClick={() => {
                                        removePair(pendingDeleteIndex);
                                        setPendingDeleteIndex(null);
                                    }}
                                >
                                    <Trash2 className="size-4 text-[#C05050]" />
                                    Quitar fila
                                </NeuButtonRaised>
                            </div>
                        </DialogFooter>
                    </div>
                </AdminModalShell>
            ) : null}
        </AppLayout>
    );
}

function fieldErr(
    errors: Record<string, string | undefined>,
    index: number,
    field: 'code' | 'value' | 'values',
): string | undefined {
    return errors[`pairs.${index}.${field}`];
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-[#C05050]">{message}</p>;
}
