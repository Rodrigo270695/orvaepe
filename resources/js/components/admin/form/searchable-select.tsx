import * as React from 'react';
import ReactSelect, {
    type FilterOptionOption,
    type GroupBase,
    type OptionsOrGroups,
} from 'react-select';

export type SearchableSelectOption = {
    value: string;
    label: string;
    /** Campos extra para búsqueda (ej. email). Se unen al texto buscable. */
    searchTerms?: string[];
};

type SearchableSelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    noOptionsMessage?: string;
    isClearable?: boolean;
    disabled?: boolean;
    id?: string;
    filterOption?: (
        option: FilterOptionOption<SearchableSelectOption>,
        input: string,
    ) => boolean;
    formatOptionLabel?: (
        option: SearchableSelectOption,
        meta: { context: 'menu' | 'value' },
    ) => React.ReactNode;
    className?: string;
};

const defaultFilter = (
    option: FilterOptionOption<SearchableSelectOption>,
    input: string,
): boolean => {
    const o = option.data;
    const q = String(input ?? '')
        .trim()
        .toLowerCase();
    if (!q) {
        return true;
    }
    const searchText = [o.label, ...(o.searchTerms ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    return q.split(/\s+/).every((word) => searchText.includes(word));
};

/**
 * Select con búsqueda (react-select). Estilo alineado al panel admin (neumorph-inset).
 * El menú se portalea a `document.body` para evitar recortes por `overflow` y fallos de
 * posicionamiento en la primera apertura (Inertia, hidratación, Strict Mode).
 */
export function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = 'Buscar…',
    noOptionsMessage = 'No hay coincidencias',
    isClearable = true,
    disabled = false,
    id,
    filterOption,
    formatOptionLabel,
    className,
}: SearchableSelectProps) {
    const instanceId = React.useId().replace(/:/g, '');
    const [menuPortalTarget, setMenuPortalTarget] =
        React.useState<HTMLElement | null>(() =>
            typeof document !== 'undefined' ? document.body : null,
        );

    React.useLayoutEffect(() => {
        setMenuPortalTarget((prev) => prev ?? document.body);
    }, []);

    const selected = options.find((o) => o.value === value) ?? null;

    return (
        <div
            className={[
                'neumorph-inset w-full rounded-xl border border-border/60',
                className ?? '',
            ].join(' ')}
            style={
                {
                    '--neu-bg':
                        'color-mix(in oklab, var(--o-dark2) 70%, black 30%)',
                } as React.CSSProperties
            }
        >
            <ReactSelect<
                SearchableSelectOption,
                false,
                GroupBase<SearchableSelectOption>
            >
                instanceId={instanceId}
                inputId={id}
                value={selected}
                onChange={(opt) => onChange(opt?.value ?? '')}
                options={
                    options as OptionsOrGroups<
                        SearchableSelectOption,
                        GroupBase<SearchableSelectOption>
                    >
                }
                placeholder={placeholder}
                noOptionsMessage={() => noOptionsMessage}
                isClearable={isClearable}
                isDisabled={disabled}
                filterOption={filterOption ?? defaultFilter}
                formatOptionLabel={formatOptionLabel}
                classNames={{
                    control: () =>
                        '!min-h-10 !cursor-pointer !rounded-xl !border-0 !bg-transparent !shadow-none !text-[13px] w-full',
                    valueContainer: () => '!py-0 !pl-3 !pr-2',
                    indicatorsContainer: () => '!cursor-pointer !pr-2',
                    singleValue: () => '!text-foreground !text-[13px]',
                    placeholder: () => '!text-muted-foreground !text-[13px]',
                    menuPortal: () => 'z-[10050] pointer-events-auto',
                    menu: () =>
                        '!rounded-xl !border !border-border/60 !bg-background !text-foreground !shadow-lg',
                    menuList: () => '!bg-background !p-1 !text-foreground',
                    option: (state) =>
                        [
                            '!cursor-pointer !text-[13px]',
                            state.isFocused
                                ? '!bg-[#4A80B8]/20 !text-foreground'
                                : '!bg-background !text-foreground',
                            state.isSelected ? '!font-medium' : '',
                        ].join(' '),
                    input: () => '!text-[13px] !text-foreground',
                    noOptionsMessage: () =>
                        '!text-muted-foreground !bg-background !px-3 !py-2 !text-[13px]',
                }}
                menuPortalTarget={menuPortalTarget ?? undefined}
                menuPosition="fixed"
                menuShouldScrollIntoView
                styles={{
                    control: (base) => ({
                        ...base,
                        minHeight: 40,
                        boxShadow: 'none',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                    }),
                    menu: (base) => ({
                        ...base,
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                        border: '1px solid color-mix(in oklab, var(--foreground) 12%, transparent)',
                        zIndex: 10050,
                    }),
                    menuList: (base) => ({
                        ...base,
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                    }),
                    menuPortal: (base) => ({
                        ...base,
                        zIndex: 10050,
                        pointerEvents: 'auto',
                    }),
                    option: (base, state) => ({
                        ...base,
                        cursor: 'pointer',
                        backgroundColor: state.isFocused
                            ? 'color-mix(in oklab, #4A80B8 22%, transparent)'
                            : 'var(--background)',
                        color: 'var(--foreground)',
                    }),
                    singleValue: (base) => ({
                        ...base,
                        color: 'var(--foreground)',
                    }),
                    placeholder: (base) => ({
                        ...base,
                        color: 'var(--muted-foreground)',
                    }),
                    input: (base) => ({
                        ...base,
                        margin: 0,
                        padding: 0,
                        color: 'var(--foreground)',
                    }),
                    dropdownIndicator: (base) => ({
                        ...base,
                        cursor: 'pointer',
                        color: 'var(--muted-foreground)',
                    }),
                    clearIndicator: (base) => ({
                        ...base,
                        cursor: 'pointer',
                        color: 'var(--muted-foreground)',
                    }),
                    noOptionsMessage: (base) => ({
                        ...base,
                        color: 'var(--muted-foreground)',
                        backgroundColor: 'var(--background)',
                    }),
                }}
            />
        </div>
    );
}
