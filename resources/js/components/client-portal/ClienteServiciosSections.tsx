import { KeyRound, LayoutDashboard, Receipt, Repeat, Shield } from 'lucide-react';

import { cn } from '@/lib/utils';

export type ClienteServiciosTabId =
    | 'resumen'
    | 'suscripciones'
    | 'derechos'
    | 'credenciales'
    | 'pedidos';

const TABS: {
    id: ClienteServiciosTabId;
    label: string;
    short: string;
    icon: typeof LayoutDashboard;
}[] = [
    { id: 'resumen', label: 'Resumen', short: 'Inicio', icon: LayoutDashboard },
    { id: 'suscripciones', label: 'Suscripciones', short: 'Subs', icon: Repeat },
    { id: 'derechos', label: 'Derechos de uso', short: 'Derechos', icon: Shield },
    { id: 'credenciales', label: 'Credenciales', short: 'API', icon: KeyRound },
    { id: 'pedidos', label: 'Pedidos', short: 'Ped.', icon: Receipt },
];

type TabNavProps = {
    active: ClienteServiciosTabId;
    onChange: (id: ClienteServiciosTabId) => void;
    badgeCredenciales?: number;
};

export function ClienteServiciosTabNav({
    active,
    onChange,
    badgeCredenciales = 0,
}: TabNavProps) {
    return (
        <nav
            aria-label="Secciones de servicios"
            className="mb-5 rounded-xl border border-border/60 bg-muted/20 p-1.5 shadow-sm"
        >
            <div className="flex gap-1 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    const isActive = active === t.id;
                    const badge =
                        t.id === 'credenciales' && badgeCredenciales > 0
                            ? badgeCredenciales
                            : null;

                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => onChange(t.id)}
                            className={cn(
                                'flex shrink-0 snap-start items-center gap-1.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors sm:px-3',
                                isActive
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/80'
                                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
                            )}
                        >
                            <Icon
                                className={cn(
                                    'size-3.5 shrink-0',
                                    isActive ? 'text-[#4A80B8]' : 'opacity-70',
                                )}
                            />
                            <span className="sm:hidden">{t.short}</span>
                            <span className="hidden sm:inline">{t.label}</span>
                            {badge !== null ? (
                                <span className="ml-0.5 inline-flex min-w-[1.1rem] justify-center rounded-full bg-[#4A80B8]/20 px-1 text-[10px] font-semibold text-[#4A80B8]">
                                    {badge > 9 ? '9+' : badge}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
