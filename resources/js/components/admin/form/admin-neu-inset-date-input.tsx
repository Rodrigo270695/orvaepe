import * as React from 'react';
import { Calendar } from 'lucide-react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import { Input } from '@/components/ui/input';

type Props = {
    id: string;
    label: string;
    /** Valor `YYYY-MM-DD` o cadena vacía */
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    /** Mismo efecto inset que búsqueda / select del panel */
    className?: string;
};

/**
 * Campo de fecha con contenedor `neumorph-inset` + borde, alineado al filtro de estado.
 */
export default function AdminNeuInsetDateInput({
    id,
    label,
    value,
    onChange,
    disabled = false,
    className,
}: Props) {
    return (
        <div className={['w-full space-y-1.5', className ?? ''].join(' ')}>
            <AdminUnderlineLabel htmlFor={id}>{label}</AdminUnderlineLabel>
            <div
                className="relative w-full rounded-xl border border-border/60 px-1 neumorph-inset"
                style={
                    {
                        // Alineado al select: en claro usa fondo base del panel,
                        // en oscuro se adapta por variables del tema.
                        '--neu-bg': 'var(--background)',
                    } as React.CSSProperties
                }
            >
                <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id={id}
                    type="date"
                    name={id}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 cursor-pointer border-0 bg-transparent pl-9 pr-2 text-foreground shadow-none [color-scheme:light] dark:[color-scheme:dark] focus-visible:ring-0"
                />
            </div>
        </div>
    );
}
