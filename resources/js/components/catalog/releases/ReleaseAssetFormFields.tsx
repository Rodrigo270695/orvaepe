import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import * as React from 'react';

export type ReleaseAssetRow = {
    id: string;
    label: string;
    path: string;
    sha256: string | null;
    created_at?: string | null;
};

type Props = {
    mode: 'create' | 'edit';
    item: ReleaseAssetRow | null;
    errors: Record<string, string | undefined>;
};

export default function ReleaseAssetFormFields({
    mode,
    item,
    errors,
}: Props) {
    const [labelValue, setLabelValue] = React.useState(item?.label ?? '');

    React.useEffect(() => {
        setLabelValue(item?.label ?? '');
    }, [item?.id, item?.label]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="label" required>
                    Etiqueta
                </AdminUnderlineLabel>
                <AdminUnderlineInput
                    id="label"
                    name="label"
                    value={labelValue}
                    onChange={(e) => setLabelValue(e.target.value)}
                    required
                    placeholder="Ej: ZIP completo, Parche SQL, Documentación"
                />
                <InputError message={errors.label} />
            </div>

            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Sube un archivo para guardarlo en el servidor (misma carpeta
                    que los releases) o indica una ruta/URL externa si el
                    fichero está fuera.
                </p>
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="asset_file">
                        Subir archivo
                    </AdminUnderlineLabel>
                    <input
                        id="asset_file"
                        name="asset_file"
                        type="file"
                        className="block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#4A80B8]/15 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#4A80B8]"
                    />
                    <InputError message={errors.asset_file} />
                </div>
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="path">
                        Ruta o URL (si no subes archivo)
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="path"
                        name="path"
                        defaultValue={item?.path ?? ''}
                        placeholder="s3://… https://… o vacío si subes archivo"
                    />
                    <InputError message={errors.path} />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="sha256">
                        SHA-256 manual (opcional)
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="sha256"
                        name="sha256"
                        defaultValue={item?.sha256 ?? ''}
                        placeholder="Se calcula solo al subir archivo"
                        className="font-mono text-xs"
                    />
                    <InputError message={errors.sha256} />
                </div>
            </div>
        </div>
    );
}
