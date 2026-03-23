import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import AdminUnderlineTextarea from '@/components/admin/form/admin-underline-textarea';
import { Checkbox } from '@/components/ui/checkbox';
import * as React from 'react';

type RevenueLine = 'software_system' | 'oem_license' | 'service';

export type CatalogCategory = {
    id: string;
    parent_id: string | null;
    slug: string;
    name: string;
    description: string | null;
    revenue_line: RevenueLine;
    sort_order: number | null;
    is_active: boolean;
};

type Props = {
    mode: 'create' | 'edit';
    item: CatalogCategory | null;
    errors: Record<string, string | undefined>;
    categoriesForSelect: CatalogCategory[];
    nextSortOrder: number;
};

export default function CatalogCategoryFormFields({
    mode,
    item,
    errors,
    categoriesForSelect,
    nextSortOrder,
}: Props) {
    const revenueLineLabel = (value: string) => {
        if (value === 'software_system') return 'Sistemas';
        if (value === 'oem_license') return 'Licencias OEM';
        if (value === 'service') return 'Servicios';
        return value;
    };

    const [isActive, setIsActive] = React.useState(
        item?.is_active ?? true,
    );
    const [slugValue, setSlugValue] = React.useState(item?.slug ?? '');
    const [nameValue, setNameValue] = React.useState(item?.name ?? '');
    const [sortOrderValue, setSortOrderValue] = React.useState(
        mode === 'create'
            ? String(nextSortOrder)
            : String(item?.sort_order ?? ''),
    );

    React.useEffect(() => {
        setIsActive(item?.is_active ?? true);
    }, [item?.id, item?.is_active]);

    React.useEffect(() => {
        setSlugValue(item?.slug ?? '');
        setNameValue(item?.name ?? '');
        setSortOrderValue(
            mode === 'create'
                ? String(nextSortOrder)
                : String(item?.sort_order ?? ''),
        );
    }, [item?.id, item?.slug, item?.name, item?.sort_order, mode, nextSortOrder]);

    const toTitleCaseWords = (value: string) =>
        value
            .toLocaleLowerCase('es')
            .replace(
                /(^|\s)(\p{L})/gu,
                (match, sep: string, letter: string) =>
                    `${sep}${letter.toLocaleUpperCase('es')}`,
            );

    const revenueOptions = [
        { value: 'software_system', label: 'Sistemas' },
        { value: 'oem_license', label: 'Licencias OEM' },
        { value: 'service', label: 'Servicios' },
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="parent_id">
                        Categoría padre
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="parent_id"
                        name="parent_id"
                        defaultValue={item?.parent_id ?? '_none_'}
                        required={false}
                        options={[
                            { value: '_none_', label: 'Sin padre' },
                            ...categoriesForSelect
                                .filter((c) => c.id !== item?.id)
                                .map((c) => ({
                                    value: c.id,
                                    label: `${c.name} (${revenueLineLabel(c.revenue_line)})`,
                                })),
                        ]}
                    />
                    {errors.parent_id ? (
                        <InputError message={errors.parent_id} />
                    ) : null}
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
                        onChange={(event) =>
                            setSlugValue(
                                event.target.value.toLocaleUpperCase('es'),
                            )
                        }
                        required
                        placeholder="Ej: contabilidad-general"
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
                            setNameValue(
                                toTitleCaseWords(event.target.value),
                            )
                        }
                        required
                        placeholder="Ej: Contabilidad"
                    />
                    <InputError message={errors.name} />
                </div>
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
                    placeholder="Opcional: describe para qué sirve la categoría…"
                />
                <InputError message={errors.description} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="revenue_line" required>
                        Línea de ingreso
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="revenue_line"
                        name="revenue_line"
                        defaultValue={item?.revenue_line ?? 'software_system'}
                        options={revenueOptions}
                    />
                    <InputError message={errors.revenue_line} />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="sort_order">
                        Orden
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        value={sortOrderValue}
                        onChange={(event) =>
                            setSortOrderValue(event.target.value)
                        }
                        placeholder="0"
                    />
                    <InputError message={errors.sort_order} />
                </div>
            </div>

            {/* Al final: activo/inactivo solo con check */}
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
                <input
                    type="hidden"
                    name="is_active"
                    value={isActive ? '1' : '0'}
                />
            </div>
            {errors.is_active ? (
                <InputError message={errors.is_active} />
            ) : null}
        </div>
    );
}

