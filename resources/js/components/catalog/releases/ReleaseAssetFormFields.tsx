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

            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="path" required>
                    Ruta o URL
                </AdminUnderlineLabel>
                <AdminUnderlineInput
                    id="path"
                    name="path"
                    defaultValue={item?.path ?? ''}
                    required
                    placeholder="s3://… https://… o ruta relativa"
                />
                <InputError message={errors.path} />
            </div>

            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="sha256">
                    SHA-256 (opcional)
                </AdminUnderlineLabel>
                <AdminUnderlineInput
                    id="sha256"
                    name="sha256"
                    defaultValue={item?.sha256 ?? ''}
                    placeholder="64 caracteres hex"
                    className="font-mono text-xs"
                />
                <InputError message={errors.sha256} />
            </div>
        </div>
    );
}
