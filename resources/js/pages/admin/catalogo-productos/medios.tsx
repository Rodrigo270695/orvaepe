import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Archive,
    ArrowLeft,
    File,
    FileAudio,
    FileCode,
    FileImage,
    FileSpreadsheet,
    FileText,
    FileVideo,
    Presentation,
    Trash2,
    Upload,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import AdminCrudDeleteModal from '@/components/admin/crud/AdminCrudDeleteModal';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import panel from '@/routes/panel';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

type PageErrors = { file?: string };

export type CatalogMediaRow = {
    id: string;
    kind: string;
    original_filename: string | null;
    mime_type: string | null;
    size_bytes: number | null;
    sort_order: number;
    url: string;
    created_at: string | null;
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
    media: CatalogMediaRow[];
};

function kindLabel(kind: string): string {
    if (kind === 'image') return 'Imagen';
    if (kind === 'video') return 'Video';
    if (kind === 'pdf') return 'PDF';
    if (kind === 'other') return 'Archivo';
    return kind;
}

/**
 * Icono según MIME / tipo; PDF y tipos habituales tienen icono distintivo.
 */
function MediaMimeIcon({
    mime,
    kind,
    className,
}: {
    mime?: string | null;
    kind: string;
    className?: string;
}) {
    const m = (mime ?? '').toLowerCase();

    if (kind === 'image' || m.startsWith('image/')) {
        return <FileImage className={className} />;
    }
    if (kind === 'video' || m.startsWith('video/')) {
        return <FileVideo className={className} />;
    }
    if (kind === 'pdf' || m === 'application/pdf') {
        return <FileText className={cn('text-red-500', className)} />;
    }
    if (
        m.includes('zip') ||
        m.includes('rar') ||
        m.includes('7z') ||
        m.includes('tar') ||
        m.includes('gzip') ||
        m.includes('compressed')
    ) {
        return <Archive className={className} />;
    }
    if (m.startsWith('audio/')) {
        return <FileAudio className={className} />;
    }
    if (
        m.includes('spreadsheet') ||
        m.includes('excel') ||
        m.endsWith('csv') ||
        m.includes('ms-excel')
    ) {
        return <FileSpreadsheet className={className} />;
    }
    if (
        m.includes('word') ||
        m.includes('msword') ||
        m.includes('officedocument.wordprocessingml')
    ) {
        return <FileText className={cn('text-blue-500', className)} />;
    }
    if (m.includes('presentation') || m.includes('powerpoint')) {
        return <Presentation className={className} />;
    }
    if (m.startsWith('text/')) {
        return <FileText className={className} />;
    }
    if (
        m.includes('javascript') ||
        m.includes('json') ||
        m.includes('xml') ||
        m.includes('html')
    ) {
        return <FileCode className={className} />;
    }

    return <File className={className} />;
}

function MediaPreviewThumb({ item }: { item: CatalogMediaRow }) {
    const [broken, setBroken] = useState(false);
    const showImg = item.kind === 'image' && !broken;

    return (
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-black/5">
            {showImg ? (
                <img
                    src={item.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={() => setBroken(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/30">
                    <MediaMimeIcon
                        mime={item.mime_type}
                        kind={item.kind}
                        className="size-7 text-[#D28C3C]/90"
                    />
                </div>
            )}
        </div>
    );
}

function formatBytes(n: number | null): string {
    if (n == null || n <= 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let v = n;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }
    return `${v < 10 && i > 0 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

export default function CatalogProductMediosPage({ product, media }: Props) {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CatalogMediaRow | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const page = usePage<{ errors: PageErrors }>();
    const fileError = page.props.errors?.file;

    const mediosUrl = panel.catalogoProductos.medios.index.url(product.id);

    const uploadFile = useCallback(
        (f: File) => {
            setUploading(true);
            router.post(
                mediosUrl,
                { file: f },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onFinish: () => {
                        setUploading(false);
                    },
                },
            );
        },
        [mediosUrl],
    );

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) {
                uploadFile(f);
            }
        },
        [uploadFile],
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle('catalogo-productos'), href: panelPath('catalogo-productos') },
        { title: `Medios · ${product.name}`, href: mediosUrl },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Medios · ${product.name}`} />
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
                            <h1 className="text-sm font-bold">Medios del producto</h1>
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

                <NeuCardRaised className="mt-4 rounded-xl p-4 md:p-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Subir archivo
                    </h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Imágenes, PDF, vídeos u otros archivos (máx. 50&nbsp;MB por archivo).
                    </p>

                    <div
                        className={cn(
                            'mt-4 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
                            dragOver
                                ? 'border-[#4A80B8] bg-[#4A80B8]/8'
                                : 'border-border/70 bg-black/2',
                        )}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                    >
                        <Upload className="mx-auto size-8 text-[#4A80B8]/70" />
                        <p className="mt-2 text-sm text-foreground">Arrastra aquí o elige un archivo</p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="sr-only"
                                aria-hidden
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                        uploadFile(f);
                                    }
                                    e.target.value = '';
                                }}
                            />
                            <NeuButtonRaised
                                type="button"
                                className="cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="size-4 text-[#4A9A72]" />
                                Seleccionar archivo
                            </NeuButtonRaised>
                            {uploading ? (
                                <span className="text-xs text-muted-foreground">Subiendo…</span>
                            ) : null}
                        </div>
                        {fileError ? (
                            <p className="mt-3 text-xs text-[#C05050]">{fileError}</p>
                        ) : null}
                    </div>
                </NeuCardRaised>

                <NeuCardRaised className="mt-4 rounded-xl p-4 md:p-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Archivos ({media.length})
                    </h2>

                    {media.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                            Aún no hay archivos. Sube el primero arriba.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {media.map((m) => (
                                <li
                                    key={m.id}
                                    className="neumorph-inset flex flex-col gap-3 rounded-xl border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 flex-1 gap-3">
                                        <MediaPreviewThumb item={m} />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {m.original_filename ?? 'Sin nombre'}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {kindLabel(m.kind)}
                                                {m.mime_type ? ` · ${m.mime_type}` : null}
                                                {' · '}
                                                {formatBytes(m.size_bytes)}
                                            </p>
                                            <a
                                                href={m.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-block text-xs font-medium text-[#4A80B8] hover:underline"
                                            >
                                                Abrir / descargar
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 justify-end">
                                        <button
                                            type="button"
                                            aria-label="Eliminar archivo"
                                            className="group inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05050]/30"
                                            onClick={() => setDeleteTarget(m)}
                                        >
                                            <Trash2 className="size-4 text-[#C05050]/60 transition-colors group-hover:text-[#C05050]" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </NeuCardRaised>
            </div>

            {deleteTarget ? (
                <AdminCrudDeleteModal
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleteTarget(null);
                        }
                    }}
                    title="Eliminar archivo"
                    description="Se eliminará el archivo del almacenamiento. Esta acción no se puede deshacer."
                    action={panel.catalogoProductos.medios.destroy.url({
                        catalog_product: product.id,
                        catalog_media: deleteTarget.id,
                    })}
                    method="post"
                    methodOverride="delete"
                    entityLabel={deleteTarget.original_filename ?? 'Archivo'}
                    confirmLabel="Eliminar"
                />
            ) : null}
        </AppLayout>
    );
}
