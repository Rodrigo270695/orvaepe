import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import AdminUnderlineTextarea from '@/components/admin/form/admin-underline-textarea';
import { Checkbox } from '@/components/ui/checkbox';
import * as React from 'react';

type RevenueLine = 'software_system' | 'oem_license' | 'service';

export type CatalogProductCategoryOption = {
    id: string;
    name: string;
    revenue_line: RevenueLine;
    is_active: boolean;
};

export type CatalogProduct = {
    id: string;
    category_id: string | null;
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    is_active: boolean;
    category?: {
        id: string;
        name: string;
        revenue_line: RevenueLine;
    } | null;
};

type Props = {
    mode: 'create' | 'edit';
    item: CatalogProduct | null;
    errors: Record<string, string | undefined>;
    categoriesForSelect: CatalogProductCategoryOption[];
};

export default function CatalogProductFormFields({
    mode,
    item,
    errors,
    categoriesForSelect,
}: Props) {
    const revenueLineLabel = (value: string) => {
        if (value === 'software_system') return 'Sistemas';
        if (value === 'oem_license') return 'Licencias OEM';
        if (value === 'service') return 'Servicios';
        return value;
    };

    const [isActive, setIsActive] = React.useState(item?.is_active ?? true);
    const [slugValue, setSlugValue] = React.useState(item?.slug ?? '');
    const [nameValue, setNameValue] = React.useState(item?.name ?? '');

    React.useEffect(() => {
        setIsActive(item?.is_active ?? true);
        setSlugValue(item?.slug ?? '');
        setNameValue(item?.name ?? '');
    }, [item?.id, item?.is_active, item?.slug, item?.name, mode]);

    const toTitleCaseWords = (value: string) =>
        value
            .toLocaleLowerCase('es')
            .replace(/(^|\s)(\p{L})/gu, (match, sep: string, letter: string) =>
                `${sep}${letter.toLocaleUpperCase('es')}`,
            );

    const normalizeSlug = (value: string) =>
        value
            .toLocaleUpperCase('es')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/_/g, '-')
            .replace(/[^A-Z0-9-]/g, '')
            .replace(/-+/g, '-');

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="category_id">
                    Categoría
                </AdminUnderlineLabel>
                <AdminUnderlineSelect
                    id="category_id"
                    name="category_id"
                    defaultValue={item?.category_id ?? '_none_'}
                    required={false}
                    options={[
                        { value: '_none_', label: 'Sin categoría' },
                        ...categoriesForSelect.map((c) => ({
                            value: c.id,
                            label: `${c.name} (${revenueLineLabel(c.revenue_line)})`,
                        })),
                    ]}
                />
                <InputError message={errors.category_id} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="slug" required>
                        Slug
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="slug"
                        name="slug"
                        value={slugValue}
                        onChange={(event) => {
                            const normalized = normalizeSlug(event.target.value);
                            event.currentTarget.value = normalized;
                            setSlugValue(normalized);
                        }}
                        style={{ textTransform: 'uppercase' }}
                        required
                        placeholder="Ej: OEM-MAS-VENDIDOS"
                    />
                    <InputError message={errors.slug} />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="name" required>
                        Nombre
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="name"
                        name="name"
                        value={nameValue}
                        onChange={(event) =>
                            setNameValue(toTitleCaseWords(event.target.value))
                        }
                        required
                        placeholder="Ej: ERP Contabilidad"
                    />
                    <InputError message={errors.name} />
                </div>
            </div>

            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="tagline">
                    Tagline
                </AdminUnderlineLabel>
                <AdminUnderlineInput
                    id="tagline"
                    name="tagline"
                    defaultValue={item?.tagline ?? ''}
                    placeholder="Ej: Control total de tu operación"
                />
                <InputError message={errors.tagline} />
            </div>

            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="description">
                    Descripción
                </AdminUnderlineLabel>
                <AdminUnderlineTextarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={item?.description ?? ''}
                    placeholder="Opcional: describe para qué sirve el producto…"
                />
                <InputError message={errors.description} />
            </div>

            <div className="flex items-center gap-3 pt-2">
                <Checkbox
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(v) => setIsActive(Boolean(v))}
                    className="cursor-pointer"
                />
                <span className="font-mono text-[9px] font-normal uppercase tracking-[0.14em] text-(--o-warm)">
                    Activo
                </span>
                <input type="hidden" name="is_active" value={isActive ? '1' : '0'} />
            </div>
            <InputError message={errors.is_active} />
        </div>
    );
}

