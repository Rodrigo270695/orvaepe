import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import AdminUnderlineTextarea from '@/components/admin/form/admin-underline-textarea';
import { Checkbox } from '@/components/ui/checkbox';
import * as React from 'react';

export type ProductOption = {
    id: string;
    name: string;
    slug: string;
};

export type ReleaseRow = {
    id: string;
    catalog_product_id: string;
    version: string;
    changelog: string | null;
    artifact_path: string | null;
    artifact_sha256: string | null;
    min_php_version: string | null;
    is_latest: boolean;
    released_at: string | null;
    product?: { name?: string; slug?: string } | null;
};

function formatDateTimeInput(d: string | null | undefined): string {
    if (!d) {
        return '';
    }
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) {
        return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

type Props = {
    mode: 'create' | 'edit';
    item: ReleaseRow | null;
    errors: Record<string, string | undefined>;
    productsForSelect: ProductOption[];
    defaultCatalogProductId?: string;
};

export default function SoftwareReleaseFormFields({
    mode,
    item,
    errors,
    productsForSelect,
    defaultCatalogProductId = '',
}: Props) {
    const [isLatest, setIsLatest] = React.useState(item?.is_latest ?? false);
    const [versionValue, setVersionValue] = React.useState(item?.version ?? '');

    React.useEffect(() => {
        setIsLatest(item?.is_latest ?? false);
    }, [item?.id, item?.is_latest]);

    React.useEffect(() => {
        setVersionValue(item?.version ?? '');
    }, [item?.id, item?.version]);

    const productDefault =
        mode === 'create'
            ? (defaultCatalogProductId ||
                  productsForSelect[0]?.id ||
                  '')
            : (item?.catalog_product_id ?? '');

    if (productsForSelect.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No hay productos con categoría &quot;Sistemas&quot;. Crea un
                producto en esa línea antes de registrar versiones.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="catalog_product_id" required>
                    Producto (sistema)
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="catalog_product_id"
                    name="catalog_product_id"
                    defaultValue={productDefault}
                    disabled={mode === 'edit'}
                    options={productsForSelect.map((p) => ({
                        value: p.id,
                        label: `${p.name} (${p.slug})`,
                    }))}
                />
                {mode === 'edit' ? (
                    <p className="text-[10px] text-muted-foreground">
                        El producto no se puede cambiar al editar una versión.
                    </p>
                ) : null}
                <InputError message={errors.catalog_product_id} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="version" required>
                        Versión (semver)
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="version"
                        name="version"
                        value={versionValue}
                        onChange={(e) => setVersionValue(e.target.value)}
                        required
                        placeholder="1.0.0"
                        autoComplete="off"
                    />
                    <InputError message={errors.version} />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="released_at" required>
                        Fecha de publicación
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="released_at"
                        name="released_at"
                        type="datetime-local"
                        defaultValue={formatDateTimeInput(item?.released_at)}
                        required
                    />
                    <InputError message={errors.released_at} />
                </div>
            </div>

            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="changelog">
                    Changelog
                </AdminUnderlineLabel>
                <AdminUnderlineTextarea
                    id="changelog"
                    name="changelog"
                    rows={5}
                    defaultValue={item?.changelog ?? ''}
                    placeholder="Notas de la versión, issues resueltos…"
                />
                <InputError message={errors.changelog} />
            </div>

            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                    <strong className="text-foreground/90">Artefacto principal:</strong>{' '}
                    sube un ZIP (u otro archivo) y se guardará en{' '}
                    <span className="font-mono text-[10px]">storage/app/software-artifacts</span>
                    ; el SHA-256 se calcula solo. Si prefieres un bucket S3 o URL
                    pública, deja el archivo vacío y rellena ruta y hash abajo.
                </p>
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="artifact_file">
                        Subir archivo
                    </AdminUnderlineLabel>
                    <input
                        id="artifact_file"
                        name="artifact_file"
                        type="file"
                        className="block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#4A80B8]/15 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#4A80B8]"
                    />
                    <InputError message={errors.artifact_file} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <AdminUnderlineLabel htmlFor="artifact_path">
                            Ruta o URL externa (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="artifact_path"
                            name="artifact_path"
                            defaultValue={item?.artifact_path ?? ''}
                            placeholder="Vacío si subes archivo; s3://… https://…"
                        />
                        <InputError message={errors.artifact_path} />
                    </div>

                    <div className="space-y-2">
                        <AdminUnderlineLabel htmlFor="artifact_sha256">
                            SHA-256 manual (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="artifact_sha256"
                            name="artifact_sha256"
                            defaultValue={item?.artifact_sha256 ?? ''}
                            placeholder="Solo si usas ruta externa"
                            className="font-mono text-xs"
                        />
                        <InputError message={errors.artifact_sha256} />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="min_php_version">
                    PHP mínimo
                </AdminUnderlineLabel>
                <AdminUnderlineInput
                    id="min_php_version"
                    name="min_php_version"
                    defaultValue={item?.min_php_version ?? ''}
                    placeholder="8.2"
                />
                <InputError message={errors.min_php_version} />
            </div>

            <div className="flex items-center gap-3 pt-2">
                <Checkbox
                    id="is_latest"
                    checked={isLatest}
                    onCheckedChange={(v) => setIsLatest(Boolean(v))}
                    className="cursor-pointer"
                />
                <span className="font-mono text-[9px] font-normal uppercase tracking-[0.14em] text-(--o-warm)">
                    Marcar como última versión (desmarca otras del mismo
                    producto)
                </span>
                <input
                    type="hidden"
                    name="is_latest"
                    value={isLatest ? '1' : '0'}
                />
            </div>
            {errors.is_latest ? <InputError message={errors.is_latest} /> : null}
        </div>
    );
}
