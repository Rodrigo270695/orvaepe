import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import { Checkbox } from '@/components/ui/checkbox';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { Upload, X } from 'lucide-react';
import * as React from 'react';

export type ShowcaseClientRow = {
    id: string;
    legal_name: string;
    display_name: string | null;
    slug: string | null;
    logo_path: string | null;
    /** URL pública para previsualizar (accessor backend). */
    logo_public_url?: string | null;
    website_url: string | null;
    sector: string | null;
    is_published: boolean;
    sort_order: number;
    admin_notes: string | null;
    authorized_at: string | null;
};

function dateOnly(iso: string | null | undefined): string {
    if (!iso) {
        return '';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type Props = {
    mode: 'create' | 'edit';
    item: ShowcaseClientRow | null;
    errors: Record<string, string | undefined>;
    /** Solo creación: siguiente orden (max + 1 o 1). */
    nextSortOrder: number;
};

/** Radix Select no permite `value=""` en items; el backend convierte esto a null. */
const SECTOR_NONE = '__none__' as const;

const SHOWCASE_SECTOR_OPTIONS = [
    { value: SECTOR_NONE, label: 'Sin sector' },
    { value: 'retail', label: 'Retail' },
    { value: 'logistics', label: 'Logística' },
    { value: 'industry', label: 'Industria' },
    { value: 'services', label: 'Servicios' },
] as const;

export default function ShowcaseClientFormFields({
    mode,
    item,
    errors,
    nextSortOrder,
}: Props) {
    const [published, setPublished] = React.useState(item?.is_published ?? false);
    const [filePreview, setFilePreview] = React.useState<string | null>(null);
    /** En edición: el usuario quitó el logo existente (sin subir otro). */
    const [logoRemoved, setLogoRemoved] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        setPublished(item?.is_published ?? false);
    }, [item?.id, item?.is_published]);

    React.useEffect(() => {
        setLogoRemoved(false);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [item?.id]);

    React.useEffect(() => {
        return () => {
            if (filePreview?.startsWith('blob:')) {
                URL.revokeObjectURL(filePreview);
            }
        };
    }, [filePreview]);

    const onPickFile = (f: File | null) => {
        if (filePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(filePreview);
        }
        if (!f) {
            setFilePreview(null);
            return;
        }
        setLogoRemoved(false);
        setFilePreview(URL.createObjectURL(f));
    };

    const existingLogoUrl =
        mode === 'edit' &&
        item?.logo_public_url &&
        !filePreview &&
        !logoRemoved
            ? item.logo_public_url
            : null;

    const showPreview = filePreview || existingLogoUrl;

    const sectorRaw = item?.sector?.trim() ?? '';
    const sectorSelectDefault =
        sectorRaw === '' ? SECTOR_NONE : sectorRaw;
    const sectorOptions = React.useMemo(() => {
        const known = new Set(SHOWCASE_SECTOR_OPTIONS.map((o) => o.value));
        if (sectorRaw !== '' && !known.has(sectorRaw)) {
            return [
                ...SHOWCASE_SECTOR_OPTIONS,
                { value: sectorRaw, label: sectorRaw },
            ];
        }
        return [...SHOWCASE_SECTOR_OPTIONS];
    }, [sectorRaw]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="legal_name" required>
                    Razón social
                </AdminUnderlineLabel>
                <AdminUnderlineInput
                    id="legal_name"
                    name="legal_name"
                    defaultValue={item?.legal_name ?? ''}
                    required
                    placeholder="Ej: Empresa Demo SAC"
                    autoComplete="organization"
                />
                <p className="text-[10px] text-muted-foreground">
                    Único campo obligatorio para guardar. Slug, logo, web y sector
                    son opcionales.
                </p>
                <InputError message={errors.legal_name} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="display_name">
                        Nombre comercial (UI)
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="display_name"
                        name="display_name"
                        defaultValue={item?.display_name ?? ''}
                        placeholder="Opcional, más corto que la razón social"
                    />
                    <InputError message={errors.display_name} />
                </div>
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="slug">Slug</AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="slug"
                        name="slug"
                        defaultValue={item?.slug ?? ''}
                        placeholder="ej: acme (único)"
                        className="font-mono text-sm"
                    />
                    <InputError message={errors.slug} />
                </div>
            </div>

            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="logo">Logo</AdminUnderlineLabel>
                <input
                    type="hidden"
                    name="logo_clear"
                    value={logoRemoved ? '1' : '0'}
                />
                {mode === 'edit' && item?.logo_path && !logoRemoved ? (
                    <input
                        type="hidden"
                        name="logo_path"
                        value={item.logo_path}
                    />
                ) : null}
                <input
                    ref={fileInputRef}
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.svg"
                    className="sr-only"
                    onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        onPickFile(f);
                    }}
                />
                <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-3 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/30 sm:h-16 sm:w-28">
                        {showPreview ? (
                            <img
                                src={showPreview}
                                alt=""
                                className="max-h-full max-w-full object-contain p-1"
                            />
                        ) : (
                            <span className="px-2 text-center text-[10px] text-muted-foreground">
                                Sin logo
                            </span>
                        )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                            <NeuButtonRaised
                                type="button"
                                className="cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="size-4 text-[#4A9A72]" />
                                Elegir imagen
                            </NeuButtonRaised>
                            {(filePreview ||
                                (mode === 'edit' && item?.logo_path && !logoRemoved)) && (
                                <NeuButtonRaised
                                    type="button"
                                    className="cursor-pointer border border-border/60 bg-transparent shadow-none hover:bg-muted/50"
                                    onClick={() => {
                                        onPickFile(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                        if (mode === 'edit' && item?.logo_path) {
                                            setLogoRemoved(true);
                                        }
                                    }}
                                >
                                    <X className="size-4 text-muted-foreground" />
                                    Quitar
                                </NeuButtonRaised>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            JPG, PNG, WebP, GIF o SVG. Máx. 5&nbsp;MB. Se guarda en{' '}
                            <span className="font-mono">storage/app/public/showcase-logos</span>
                            .
                        </p>
                    </div>
                </div>
                <InputError message={errors.logo} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="website_url">
                        Sitio web
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="website_url"
                        name="website_url"
                        type="url"
                        defaultValue={item?.website_url ?? ''}
                        placeholder="https://…"
                    />
                    <InputError message={errors.website_url} />
                </div>
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="sector">Sector</AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="sector"
                        name="sector"
                        defaultValue={sectorSelectDefault}
                        options={sectorOptions}
                    />
                    <InputError message={errors.sector} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {mode === 'create' ? (
                    <div className="space-y-2">
                        <AdminUnderlineLabel>Orden</AdminUnderlineLabel>
                        <div className="rounded-xl border border-border/50 bg-muted/15 px-3 py-2.5">
                            <p className="text-sm text-foreground">
                                Se guardará como{' '}
                                <span className="font-mono font-semibold tabular-nums">
                                    {nextSortOrder}
                                </span>
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Automático: último número + 1; si no hay
                                registros, empieza en 1.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <AdminUnderlineLabel htmlFor="sort_order">
                            Orden
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="sort_order"
                            name="sort_order"
                            type="number"
                            min={0}
                            defaultValue={String(item?.sort_order ?? 0)}
                        />
                        <InputError message={errors.sort_order} />
                    </div>
                )}
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="authorized_at">
                        Autorización (referencia)
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="authorized_at"
                        name="authorized_at"
                        type="date"
                        defaultValue={dateOnly(item?.authorized_at)}
                    />
                    <InputError message={errors.authorized_at} />
                </div>
            </div>

            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="admin_notes">
                    Notas internas
                </AdminUnderlineLabel>
                <textarea
                    id="admin_notes"
                    name="admin_notes"
                    rows={3}
                    defaultValue={item?.admin_notes ?? ''}
                    className="flex min-h-[80px] w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                    placeholder="Solo panel admin; no se muestra en la web pública."
                />
                <InputError message={errors.admin_notes} />
            </div>

            <div className="flex items-center gap-3 pt-2">
                <Checkbox
                    id="is_published"
                    checked={published}
                    onCheckedChange={(v) => setPublished(Boolean(v))}
                    className="cursor-pointer"
                />
                <span className="font-mono text-[9px] font-normal uppercase tracking-[0.14em] text-(--o-warm)">
                    Publicado en vitrina
                </span>
                <input
                    type="hidden"
                    name="is_published"
                    value={published ? '1' : '0'}
                />
            </div>
            {errors.is_published ? (
                <InputError message={errors.is_published} />
            ) : null}
        </div>
    );
}
