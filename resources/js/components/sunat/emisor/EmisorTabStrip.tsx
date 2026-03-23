import { cn } from '@/lib/utils';

import type { EmisorTabId } from '@/components/sunat/emisor/types';

const TABS: { id: EmisorTabId; label: string }[] = [
    { id: 'perfil', label: 'Perfil legal' },
    { id: 'certificados', label: 'Certificados' },
    { id: 'setup', label: 'SUNAT / OSE' },
    { id: 'secuencias', label: 'Secuencias' },
];

type Props = {
    active: EmisorTabId;
    onChange: (id: EmisorTabId) => void;
};

export default function EmisorTabStrip({ active, onChange }: Props) {
    return (
        <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Secciones de emisor"
        >
            {TABS.map((t) => {
                const isActive = active === t.id;

                return (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(t.id)}
                        className={cn(
                            'cursor-pointer inline-flex items-center justify-center rounded-lg border-0 px-3 py-2 text-[11px] font-semibold tracking-tight transition-[box-shadow,transform] duration-200',
                            isActive
                                ? // Seleccionado: hundido (misma lógica que neumorph-inset del panel)
                                  'neumorph-inset text-[#4A80B8] hover:translate-y-0'
                                : // Resto: elevados + hover hacia arriba
                                  'neumorph-sm text-muted-foreground hover:text-foreground hover:[box-shadow:var(--neu-raised-hover)] hover:-translate-y-px active:translate-y-0 active:scale-[0.99]',
                        )}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}
