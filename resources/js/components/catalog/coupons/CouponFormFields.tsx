import InputError from '@/components/input-error';
import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import { Checkbox } from '@/components/ui/checkbox';
import * as React from 'react';

export type CouponRow = {
    id: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: string;
    max_uses: number | null;
    used_count: number;
    applicable_sku_ids: string[] | null;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
};

export type SkuOption = {
    id: string;
    code: string;
    name: string;
    product_name: string;
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
    item: CouponRow | null;
    errors: Record<string, string | undefined>;
    skusForSelect: SkuOption[];
};

export default function CouponFormFields({
    mode,
    item,
    errors,
    skusForSelect,
}: Props) {
    const [isActive, setIsActive] = React.useState(item?.is_active ?? true);
    const [restrictSkus, setRestrictSkus] = React.useState(
        item !== null && item.applicable_sku_ids !== null,
    );
    const [codeValue, setCodeValue] = React.useState(item?.code ?? '');

    React.useEffect(() => {
        setIsActive(item?.is_active ?? true);
    }, [item?.id, item?.is_active]);

    React.useEffect(() => {
        setRestrictSkus(item !== null && item.applicable_sku_ids !== null);
    }, [item?.id, item?.applicable_sku_ids]);

    React.useEffect(() => {
        setCodeValue(item?.code ?? '');
    }, [item?.id, item?.code]);

    const selectedSkuSet = React.useMemo(() => {
        const ids = item?.applicable_sku_ids;
        if (!ids || !Array.isArray(ids)) {
            return new Set<string>();
        }
        return new Set(ids);
    }, [item?.applicable_sku_ids]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <AdminUnderlineLabel htmlFor="code" required>
                    Código
                </AdminUnderlineLabel>
                <AdminUnderlineInput
                    id="code"
                    name="code"
                    value={codeValue}
                    onChange={(e) =>
                        setCodeValue(e.target.value.toLocaleUpperCase('es'))
                    }
                    required
                    placeholder="Ej: VERANO2026"
                    autoComplete="off"
                />
                <InputError message={errors.code} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="discount_type" required>
                        Tipo de descuento
                    </AdminUnderlineLabel>
                    <AdminUnderlineSelect
                        id="discount_type"
                        name="discount_type"
                        defaultValue={item?.discount_type ?? 'percent'}
                        options={[
                            { value: 'percent', label: 'Porcentaje (%)' },
                            { value: 'fixed', label: 'Monto fijo' },
                        ]}
                    />
                    <InputError message={errors.discount_type} />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="discount_value" required>
                        Valor
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="discount_value"
                        name="discount_value"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={item?.discount_value ?? ''}
                        required
                        placeholder={item?.discount_type === 'fixed' ? '0.00' : '10'}
                    />
                    <InputError message={errors.discount_value} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="max_uses">
                        Usos máximos
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="max_uses"
                        name="max_uses"
                        type="number"
                        min="1"
                        defaultValue={
                            item?.max_uses != null ? String(item.max_uses) : ''
                        }
                        placeholder="Vacío = ilimitado"
                    />
                    <InputError message={errors.max_uses} />
                </div>

                {mode === 'edit' && item ? (
                    <div className="space-y-2">
                        <p className="text-[10px] font-medium text-muted-foreground">
                            Uso actual
                        </p>
                        <p className="border-b border-(--o-border2) pb-2 text-[13px] text-foreground">
                            {item.used_count}
                            {item.max_uses != null
                                ? ` / ${item.max_uses}`
                                : ' / ∞'}
                        </p>
                    </div>
                ) : null}
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Checkbox
                        id="restrict_skus"
                        checked={restrictSkus}
                        onCheckedChange={(v) => setRestrictSkus(Boolean(v))}
                        className="cursor-pointer"
                    />
                    <label
                        htmlFor="restrict_skus"
                        className="cursor-pointer text-[11px] font-medium text-muted-foreground"
                    >
                        Limitar a SKUs concretos (si no, aplica a todo el
                        catálogo)
                    </label>
                </div>
                <input
                    type="hidden"
                    name="restrict_skus"
                    value={restrictSkus ? '1' : '0'}
                />

                {restrictSkus ? (
                    <div className="neumorph-inset max-h-40 overflow-y-auto rounded-xl border border-border/50 p-2">
                        {skusForSelect.length === 0 ? (
                            <p className="px-2 py-2 text-xs text-muted-foreground">
                                No hay SKUs activos. Crea SKUs en el catálogo
                                primero.
                            </p>
                        ) : (
                            <ul className="space-y-1.5">
                                {skusForSelect.map((s) => (
                                    <li
                                        key={s.id}
                                        className="flex items-start gap-2 px-1"
                                    >
                                        <input
                                            id={`sku-${s.id}`}
                                            type="checkbox"
                                            name="applicable_sku_ids[]"
                                            value={s.id}
                                            defaultChecked={selectedSkuSet.has(
                                                s.id,
                                            )}
                                            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border border-border accent-[#4A80B8]"
                                        />
                                        <label
                                            htmlFor={`sku-${s.id}`}
                                            className="min-w-0 cursor-pointer text-xs leading-snug"
                                        >
                                            <span className="font-mono text-[#4A80B8]">
                                                {s.code}
                                            </span>{' '}
                                            <span className="text-foreground">
                                                {s.name}
                                            </span>
                                            <span className="block text-[10px] text-muted-foreground">
                                                {s.product_name}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : null}
                <InputError message={errors.applicable_sku_ids} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="starts_at">
                        Válido desde
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="starts_at"
                        name="starts_at"
                        type="datetime-local"
                        defaultValue={formatDateTimeInput(item?.starts_at)}
                    />
                    <InputError message={errors.starts_at} />
                </div>

                <div className="space-y-2">
                    <AdminUnderlineLabel htmlFor="expires_at">
                        Válido hasta
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="expires_at"
                        name="expires_at"
                        type="datetime-local"
                        defaultValue={formatDateTimeInput(item?.expires_at)}
                    />
                    <InputError message={errors.expires_at} />
                </div>
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
                <input
                    type="hidden"
                    name="is_active"
                    value={isActive ? '1' : '0'}
                />
            </div>
            {errors.is_active ? <InputError message={errors.is_active} /> : null}
        </div>
    );
}
