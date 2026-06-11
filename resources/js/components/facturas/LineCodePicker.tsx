/**
 * LineCodePicker — selector elegante para códigos de SUNAT en líneas de comprobante.
 *
 * Muestra un trigger compacto con badge de color y en el dropdown
 * presenta las opciones agrupadas con código resaltado + descripción.
 */
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type CodeOption = {
    value: string;
    label: string;         // Descripción larga
    shortLabel?: string;   // Etiqueta compacta (si difiere de value)
    /** Color del badge. Por defecto 'default'. */
    color?: 'blue' | 'green' | 'yellow' | 'gray' | 'purple' | 'orange' | 'default';
};

export type CodeGroup = {
    label: string;
    options: CodeOption[];
};

type Props = {
    value: string;
    onChange: (v: string) => void;
    groups: CodeGroup[];
    disabled?: boolean;
    placeholder?: string;
    /** Ancho del dropdown. Por defecto '260px'. */
    dropdownWidth?: string;
};

// ── Colores ───────────────────────────────────────────────────────────────────

const BADGE_COLORS: Record<NonNullable<CodeOption['color']>, string> = {
    blue:    'bg-[#4A80B8]/12 text-[#4A80B8] border-[#4A80B8]/25',
    green:   'bg-[#4A9A72]/12 text-[#4A9A72] border-[#4A9A72]/25',
    yellow:  'bg-amber-500/12  text-amber-600  border-amber-400/25',
    gray:    'bg-slate-400/12  text-slate-500  border-slate-400/25',
    purple:  'bg-violet-500/12 text-violet-500 border-violet-400/25',
    orange:  'bg-orange-500/12 text-orange-500 border-orange-400/25',
    default: 'bg-muted text-muted-foreground border-border/50',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function flatOptions(groups: CodeGroup[]): CodeOption[] {
    return groups.flatMap((g) => g.options);
}

// ── Componente ────────────────────────────────────────────────────────────────

export function LineCodePicker({
    value,
    onChange,
    groups,
    disabled,
    placeholder = 'Selecciona…',
    dropdownWidth = '280px',
}: Props) {
    const selected = flatOptions(groups).find((o) => o.value === value);
    const color = selected?.color ?? 'default';
    const badgeCls = BADGE_COLORS[color];

    return (
        <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
            <SelectPrimitive.Trigger
                className={cn(
                    'inline-flex h-8 min-w-0 max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px] font-medium shadow-none outline-none transition',
                    'data-[state=open]:ring-1 data-[state=open]:ring-[#4A80B8]/40',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    badgeCls,
                )}
            >
                <span className="font-mono text-[11px] font-bold">{selected?.value ?? '—'}</span>
                <span className="hidden truncate text-[11px] sm:inline">
                    {selected?.shortLabel ?? selected?.label?.split('(')[0]?.trim() ?? placeholder}
                </span>
                <SelectPrimitive.Icon asChild>
                    <ChevronDownIcon className="ml-auto size-3 shrink-0 opacity-60" />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    position="popper"
                    sideOffset={6}
                    align="start"
                    style={{ width: dropdownWidth, zIndex: 9999 }}
                    className={cn(
                        'border-border/60 bg-popover text-popover-foreground',
                        'z-50 rounded-xl border shadow-xl',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'data-[side=bottom]:slide-in-from-top-2',
                    )}
                >
                    <SelectPrimitive.Viewport className="p-1.5">
                        {groups.map((group, gi) => (
                            <SelectPrimitive.Group key={gi}>
                                {/* Separador de grupo */}
                                {gi > 0 && (
                                    <div className="mx-2 my-1 border-t border-border/40" />
                                )}
                                <SelectPrimitive.Label className="mb-1 mt-0.5 px-2 font-mono text-[9px] uppercase tracking-widest text-(--o-warm)">
                                    {group.label}
                                </SelectPrimitive.Label>

                                {group.options.map((opt) => {
                                    const optBadge = BADGE_COLORS[opt.color ?? 'default'];
                                    return (
                                        <SelectPrimitive.Item
                                            key={opt.value}
                                            value={opt.value}
                                            className={cn(
                                                'relative flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] outline-none',
                                                'transition-colors',
                                                'focus:bg-(--o-amber)/5 data-[state=checked]:bg-(--o-amber)/8',
                                                'data-disabled:pointer-events-none data-disabled:opacity-40',
                                            )}
                                        >
                                            {/* Badge del código */}
                                            <span
                                                className={cn(
                                                    'inline-flex w-10 shrink-0 items-center justify-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold',
                                                    optBadge,
                                                )}
                                            >
                                                {opt.value}
                                            </span>

                                            {/* Descripción */}
                                            <span className="flex-1 text-[12px] leading-tight text-foreground">
                                                {opt.label}
                                            </span>

                                            {/* Check activo */}
                                            <SelectPrimitive.ItemIndicator>
                                                <CheckIcon className="size-3.5 text-[#4A9A72]" />
                                            </SelectPrimitive.ItemIndicator>
                                        </SelectPrimitive.Item>
                                    );
                                })}
                            </SelectPrimitive.Group>
                        ))}
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}
