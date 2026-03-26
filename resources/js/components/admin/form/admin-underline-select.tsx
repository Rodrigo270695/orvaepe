import * as React from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Option = {
    value: string;
    label: string;
};

type Props = {
    id: string;
    name: string;
    /**
     * Si `value` viene, se comporta como controlado.
     * Si no, usa `defaultValue` como inicial.
     */
    value?: string;
    defaultValue?: string;
    options: Option[];
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    onValueChange?: (next: string) => void;
};

export default function AdminUnderlineSelect({
    id,
    name,
    value,
    defaultValue,
    options,
    disabled,
    placeholder,
    onValueChange,
}: Props) {
    const [uncontrolledValue, setUncontrolledValue] =
        React.useState(defaultValue ?? '');

    // Sincroniza si cambia el defaultValue desde el padre (modo edición).
    React.useEffect(() => {
        setUncontrolledValue(defaultValue ?? '');
    }, [defaultValue]);

    const currentValue = value ?? uncontrolledValue;

    return (
        <div className="relative">
            <input type="hidden" name={name} value={currentValue} />

            <Select
                value={currentValue}
                onValueChange={(next) => {
                    if (value === undefined) {
                        setUncontrolledValue(next);
                    }
                    onValueChange?.(next);
                }}
                disabled={disabled}
            >
                <div
                    className="neumorph-inset w-full rounded-xl border border-border/60"
                    style={
                        {
                            // En modo claro el neumorph debe usar el fondo normal; en oscuro
                            // también mantiene el estilo del tema con `--background`.
                            '--neu-bg': 'var(--background)',
                        } as React.CSSProperties
                    }
                >
                    <SelectTrigger
                        id={id}
                        className={cn(
                            'min-h-10 w-full max-w-full cursor-pointer border-0 bg-transparent shadow-none',
                            'rounded-xl px-3 py-2.5 text-left text-[13px] text-foreground',
                            'flex items-center justify-between gap-2',
                            'transition-colors hover:text-foreground',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/35 focus-visible:ring-offset-0',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            '[&_svg]:shrink-0 [&_svg]:text-muted-foreground',
                        )}
                    >
                        <SelectValue placeholder={placeholder ?? 'Selecciona una opción'} />
                    </SelectTrigger>
                </div>

                <SelectContent
                    className="neumorph z-50 rounded-xl border border-border/60 bg-background text-foreground"
                    position="popper"
                >
                    {options.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="cursor-pointer data-[state=checked]:bg-[var(--o-amber)]/15 data-[state=checked]:text-[var(--o-amber)]"
                        >
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

