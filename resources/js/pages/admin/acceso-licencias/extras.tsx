import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Plus, Save, TableProperties, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { NeuButtonInset } from '@/components/ui/neu-button-inset';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { getCsrfToken } from '@/lib/csrf';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

type ValueKind = 'text' | 'list';
type SpecPair = {
    code: string;
    label?: string;
    value_kind: ValueKind;
    value: string;
    values: string[];
};

type Props = {
    license: {
        id: string;
        key: string;
        status: string;
        max_activations: number;
        activation_count: number;
        expires_at: string | null;
        user?: { name: string; lastname?: string | null; email: string } | null;
        catalog_sku?: { code: string; name: string; product?: { name: string } | null } | null;
        order?: { order_number: string } | null;
    };
    metadataPairs?: SpecPair[] | null;
    latestActivation?: {
        domain: string;
        ip_address: string;
        server_fingerprint?: string | null;
        last_ping_at?: string | null;
        is_active: boolean;
    } | null;
};

function emptyRow(): SpecPair {
    return { code: '', value_kind: 'text', value: '', values: [''] };
}

function asPairs(raw: unknown): SpecPair[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((r) => {
        const row = r as Record<string, unknown>;
        const kind: ValueKind = row.value_kind === 'list' ? 'list' : 'text';
        const label = typeof row.label === 'string' ? row.label : '';
        if (kind === 'list') {
            const values = Array.isArray(row.values) ? row.values.map((v) => String(v ?? '')) : [''];
            return { code: String(row.code ?? ''), label, value_kind: 'list', value: '', values: values.length > 0 ? values : [''] };
        }
        return { code: String(row.code ?? ''), label, value_kind: 'text', value: String(row.value ?? ''), values: [''] };
    });
}

function isEvidenceImageKey(code: string): boolean {
    const k = code.trim().toLowerCase();
    if (k === '') return false;
    return (
        k.includes('evid') ||
        k.includes('captur') ||
        k.includes('imagen') ||
        k.includes('image') ||
        k.includes('img') ||
        k.includes('foto') ||
        k.includes('screenshot')
    );
}

function rowSingleUrl(row: SpecPair): string {
    if (row.value_kind === 'list') return (row.values[0] ?? '').trim();
    return row.value.trim();
}

export default function LicenseExtrasPage({ license, metadataPairs, latestActivation }: Props) {
    const backUrl = panelPath('acceso-licencias');
    const extrasUrl = `/panel/acceso-licencias/${license.id}/extras`;
    const uploadUrl = `/panel/acceso-licencias/${license.id}/extras/evidencia-imagen`;

    const form = useForm<{
        metadata_pairs: SpecPair[];
        mark_as_activated: boolean;
        activation_domain: string;
        activation_ip: string;
        activation_fingerprint: string;
    }>({
        metadata_pairs: asPairs(metadataPairs).length > 0 ? asPairs(metadataPairs) : [{ ...emptyRow(), code: 'evidencia_activacion_imagen' }],
        mark_as_activated: false,
        activation_domain: '',
        activation_ip: '',
        activation_fingerprint: '',
    });

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    const rows = form.data.metadata_pairs;

    const setRows = (next: SpecPair[]) => form.setData('metadata_pairs', next.length > 0 ? next : [emptyRow()]);

    const updateRow = (index: number, patch: Partial<SpecPair>) => {
        setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const addRow = () => setRows([...rows, emptyRow()]);
    const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

    const uploadEvidence = async (index: number, files: File[]) => {
        const file = files[0];
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch(uploadUrl, {
                method: 'POST',
                body: fd,
                headers: { 'X-CSRF-TOKEN': getCsrfToken() },
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => ({ message: 'Error al subir imagen.' }));
                throw new Error(typeof payload?.message === 'string' ? payload.message : 'Error al subir imagen.');
            }
            const json = (await res.json()) as { url?: string };
            const url = (json.url ?? '').trim();
            if (!url) throw new Error('No se recibió URL de imagen.');
            updateRow(index, { value_kind: 'text', value: url, values: [''] });
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Error al subir imagen.');
        } finally {
            setUploading(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle('acceso-licencias'), href: backUrl },
        { title: `Metadatos · ${license.key}`, href: extrasUrl },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Metadatos licencia · ${license.key}`} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link href={backUrl} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                        <ArrowLeft className="size-3.5" />
                        Volver a licencias
                    </Link>
                </div>

                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <h1 className="text-sm font-bold">Metadatos y evidencia de activación</h1>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Clave: <span className="font-mono">{license.key}</span> · Estado: <span className="uppercase">{license.status}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Activaciones: {license.activation_count} / {license.max_activations}
                    </p>
                    {latestActivation ? (
                        <div className="mt-2 grid gap-1 text-[11px] text-muted-foreground md:grid-cols-3">
                            <p>
                                <span className="font-semibold text-foreground">Dominio/equipo:</span>{' '}
                                {latestActivation.domain || '—'}
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">IP:</span>{' '}
                                {latestActivation.ip_address || '—'}
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">Fingerprint:</span>{' '}
                                {latestActivation.server_fingerprint || '—'}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                            Aún no hay activación registrada para esta licencia.
                        </p>
                    )}
                </NeuCardRaised>

                <form
                    className="mt-4 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.patch(extrasUrl, { preserveScroll: true });
                    }}
                >
                    <div className="flex items-center justify-end gap-2">
                        <NeuButtonRaised type="submit" className="cursor-pointer" disabled={form.processing}>
                            <Save className="size-4 text-[#4A9A72]" />
                            {form.processing ? 'Guardando…' : 'Guardar metadatos'}
                        </NeuButtonRaised>
                        <NeuButtonRaised type="button" className="cursor-pointer" onClick={addRow}>
                            <Plus className="size-4 text-[#4A9A72]" />
                            Añadir metadato
                        </NeuButtonRaised>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {rows.map((row, index) => (
                            <NeuCardRaised key={`meta-${index}`} className="rounded-xl border border-border/60 p-3">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        <TableProperties className="size-3.5 shrink-0 text-[#4A80B8]" />
                                        <span className="truncate">Metadato {index + 1}</span>
                                    </div>
                                    <NeuButtonInset type="button" className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center p-0" onClick={() => removeRow(index)} aria-label="Quitar metadato">
                                        <Trash2 className="size-3.5 text-[#C05050]/80" />
                                    </NeuButtonInset>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-muted-foreground">Clave</label>
                                        <input
                                            type="text"
                                            value={row.code}
                                            onChange={(e) => updateRow(index, { code: e.target.value })}
                                            className={cn('neumorph-inset w-full rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none', 'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30')}
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            {row.label && row.label.trim() !== '' ? row.label : 'Sin etiqueta'}
                                        </p>
                                    </div>

                                    {isEvidenceImageKey(row.code) ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-medium text-muted-foreground">Evidencia (imagen)</span>
                                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-[10px] font-semibold text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/12">
                                                    <Upload className="size-3.5" />
                                                    Subir
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files ?? []);
                                                            if (files.length > 0) void uploadEvidence(index, files);
                                                            e.target.value = '';
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            {uploading ? <p className="text-xs text-muted-foreground">Subiendo...</p> : null}
                                            {uploadError ? <p className="text-xs text-[#C05050]">{uploadError}</p> : null}
                                            {rowSingleUrl(row) ? (
                                                <div className="relative mx-auto max-w-48">
                                                    <button type="button" className="block w-full cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-black/5 text-left transition-opacity hover:opacity-90" onClick={() => setImagePreviewUrl(rowSingleUrl(row))}>
                                                        <img src={rowSingleUrl(row)} alt="" className="aspect-square w-full object-contain" loading="lazy" decoding="async" />
                                                    </button>
                                                    <NeuButtonInset
                                                        type="button"
                                                        className="absolute right-1 top-1 z-10 inline-flex h-7 w-7 cursor-pointer items-center justify-center p-0 shadow-sm"
                                                        onClick={() => updateRow(index, { value_kind: 'text', value: '', values: [''] })}
                                                        aria-label="Quitar imagen"
                                                    >
                                                        <X className="size-3.5 text-muted-foreground" />
                                                    </NeuButtonInset>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">Sin evidencia cargada.</p>
                                            )}
                                            <input type="hidden" value={rowSingleUrl(row)} readOnly />
                                        </div>
                                    ) : row.value_kind === 'list' ? (
                                        <textarea
                                            value={row.values.join('\n')}
                                            onChange={(e) => updateRow(index, { value_kind: 'list', value: '', values: e.target.value.split(/\r?\n/) })}
                                            rows={4}
                                            className={cn('neumorph-inset min-h-13 w-full resize-y rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none', 'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30')}
                                        />
                                    ) : (
                                        <textarea
                                            value={row.value}
                                            onChange={(e) => updateRow(index, { value_kind: 'text', value: e.target.value })}
                                            rows={3}
                                            className={cn('neumorph-inset min-h-13 w-full resize-y rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none', 'placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30')}
                                        />
                                    )}
                                </div>
                            </NeuCardRaised>
                        ))}
                    </div>

                    <NeuCardRaised className="rounded-xl border border-border/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xs font-semibold">Registrar activación manual</h2>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Marca esta opción cuando valides evidencia del cliente. Se creará/actualizará activación y la licencia pasará a activa.
                                </p>
                            </div>
                            <label className="inline-flex items-center gap-2 text-xs font-medium">
                                <input
                                    type="checkbox"
                                    checked={form.data.mark_as_activated}
                                    onChange={(e) => form.setData('mark_as_activated', e.target.checked)}
                                />
                                Activar ahora
                            </label>
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                            <input
                                type="text"
                                placeholder="Dominio o equipo (ej. PC-VENTAS-01)"
                                value={form.data.activation_domain}
                                onChange={(e) => form.setData('activation_domain', e.target.value)}
                                className="neumorph-inset rounded-lg border border-border/60 bg-background px-2.5 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                            />
                            <input
                                type="text"
                                placeholder="IP (ej. 192.168.1.10)"
                                value={form.data.activation_ip}
                                onChange={(e) => form.setData('activation_ip', e.target.value)}
                                className="neumorph-inset rounded-lg border border-border/60 bg-background px-2.5 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                            />
                            <input
                                type="text"
                                placeholder="Fingerprint (opcional)"
                                value={form.data.activation_fingerprint}
                                onChange={(e) => form.setData('activation_fingerprint', e.target.value)}
                                className="neumorph-inset rounded-lg border border-border/60 bg-background px-2.5 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                            />
                        </div>
                        {(form.errors.activation_domain || form.errors.activation_ip) ? (
                            <p className="mt-2 text-xs text-[#C05050]">
                                {form.errors.activation_domain ?? form.errors.activation_ip}
                            </p>
                        ) : null}
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <CheckCircle2 className="size-3.5 text-[#4A9A72]" />
                            Usa esto para OEM cuando valides la captura de activación.
                        </div>
                    </NeuCardRaised>
                </form>
            </div>

            <Dialog open={imagePreviewUrl !== null} onOpenChange={(open) => !open && setImagePreviewUrl(null)}>
                <DialogContent className="max-h-[92vh] max-w-[min(96vw,56rem)] border-border/60 bg-background p-3 sm:p-4">
                    <DialogTitle className="sr-only">Vista previa de evidencia</DialogTitle>
                    <DialogDescription className="sr-only">
                        Vista previa ampliada de la evidencia subida.
                    </DialogDescription>
                    {imagePreviewUrl ? <img src={imagePreviewUrl} alt="" className="mx-auto max-h-[85vh] w-auto max-w-full object-contain" /> : null}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
