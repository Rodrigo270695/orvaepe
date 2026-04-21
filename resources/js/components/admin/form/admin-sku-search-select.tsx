import * as React from 'react';

import InputError from '@/components/input-error';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import {
    SearchableSelect,
    type SearchableSelectOption,
} from '@/components/admin/form/searchable-select';

export type SkuPickOption = {
    id: string;
    code: string;
    name: string;
    product_name: string;
    currency: string;
    list_price: string;
};

type Props = {
    id?: string;
    value: string;
    onChange: (skuId: string) => void;
    skus: SkuPickOption[];
    placeholder?: string;
    noOptionsMessage?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
};

function formatMoneyLine(s: SkuPickOption): string {
    const c = (s.currency ?? 'PEN').toUpperCase();
    return `${c} ${s.list_price}`;
}

/**
 * Buscador de SKU (react-select), mismo patrón que {@link AdminClienteSelect}.
 */
export default function AdminSkuSearchSelect({
    id = 'catalog_sku_id',
    value,
    onChange,
    skus,
    placeholder = 'Buscar por código, producto o precio…',
    noOptionsMessage = 'No hay coincidencias',
    error,
    required = false,
    disabled = false,
}: Props) {
    const byId = React.useMemo(() => {
        const m = new Map<string, SkuPickOption>();
        for (const s of skus) {
            m.set(s.id, s);
        }
        return m;
    }, [skus]);

    const options = React.useMemo<SearchableSelectOption[]>(
        () =>
            skus.map((s) => ({
                value: s.id,
                label: `${s.code} · ${s.product_name}`,
                searchTerms: [
                    s.code,
                    s.name,
                    s.product_name,
                    s.currency,
                    s.list_price,
                    formatMoneyLine(s),
                ],
            })),
        [skus],
    );

    const formatOptionLabel = React.useCallback(
        (opt: SearchableSelectOption, meta: { context: 'menu' | 'value' }) => {
            const s = byId.get(opt.value);
            if (!s) {
                return opt.label;
            }
            if (meta.context === 'value') {
                return (
                    <span className="block truncate font-mono text-[12px] text-foreground">
                        <span className="font-semibold text-[#4A80B8]">
                            {s.code}
                        </span>
                        <span className="text-muted-foreground"> · </span>
                        <span>{s.product_name}</span>
                    </span>
                );
            }
            return (
                <div className="py-1">
                    <p className="font-mono text-[12px] font-semibold text-[#4A80B8]">
                        {s.code}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-foreground">
                        {s.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {s.product_name}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#4A80B8]">
                        {formatMoneyLine(s)}
                    </p>
                </div>
            );
        },
        [byId],
    );

    return (
        <div className="space-y-1.5">
            <AdminUnderlineLabel htmlFor={id} required={required}>
                SKU
            </AdminUnderlineLabel>
            <div className="cursor-pointer">
                <SearchableSelect
                    id={id}
                    value={value}
                    onChange={onChange}
                    options={options}
                    placeholder={placeholder}
                    noOptionsMessage={noOptionsMessage}
                    isClearable
                    disabled={disabled}
                    formatOptionLabel={formatOptionLabel}
                />
            </div>
            <InputError message={error} />
        </div>
    );
}
