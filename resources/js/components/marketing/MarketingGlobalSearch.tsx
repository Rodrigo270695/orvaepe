import { Link } from '@inertiajs/react';
import { Command, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { marketingPreciosLinks, marketingServiciosSectionLinks } from '@/constants/marketingNavLinks';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type SearchItem = {
    label: string;
    href: string;
    section: string;
    keywords?: string[];
};

type Props = {
    softwareLinks: { label: string; href: string }[];
    isLoggedIn: boolean;
    canRegister: boolean;
};

function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export default function MarketingGlobalSearch({ softwareLinks, isLoggedIn, canRegister }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
            if (!isShortcut) return;
            event.preventDefault();
            setOpen((v) => !v);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const items = useMemo<SearchItem[]>(() => {
        const base: SearchItem[] = [
            { label: 'Inicio', href: '/', section: 'General' },
            { label: 'Software', href: '/software', section: 'General' },
            { label: 'Licencias', href: '/licencias', section: 'General' },
            { label: 'Servicios', href: '/servicios', section: 'General' },
            { label: 'Contacto', href: '/contacto', section: 'General' },
            { label: 'Carrito', href: '/carrito', section: 'General' },
            ...softwareLinks.map((l) => ({ ...l, section: 'Software', keywords: ['software'] })),
            ...marketingPreciosLinks.map((l) => ({ ...l, section: 'Licencias', keywords: ['licencias', 'precios'] })),
            ...marketingServiciosSectionLinks.map((l) => ({ ...l, section: 'Servicios', keywords: ['servicios'] })),
        ];

        if (isLoggedIn) {
            base.push({ label: 'Panel', href: '/dashboard', section: 'Cuenta' });
        } else {
            base.push({ label: 'Iniciar sesión', href: '/login', section: 'Cuenta' });
            if (canRegister) base.push({ label: 'Registrarse', href: '/register', section: 'Cuenta' });
        }

        const map = new Map<string, SearchItem>();
        base.forEach((item) => {
            const key = `${item.href}::${item.label}`;
            if (!map.has(key)) map.set(key, item);
        });
        return Array.from(map.values());
    }, [softwareLinks, isLoggedIn, canRegister]);

    const filtered = useMemo(() => {
        const q = normalizeText(query);
        if (!q) return items.slice(0, 10);

        return items
            .filter((item) => {
                const text = normalizeText(`${item.label} ${item.section} ${(item.keywords ?? []).join(' ')}`);
                return text.includes(q);
            })
            .slice(0, 10);
    }, [query, items]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    className="h-9 cursor-pointer gap-2 rounded-md border border-transparent px-2.5 text-[var(--foreground)] transition-colors hover:border-[color-mix(in_oklab,var(--state-info)_48%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)]"
                >
                    <Search className="size-4 text-[var(--state-info)]" />
                    <span className="hidden text-sm font-semibold lg:inline">Buscar</span>
                    <span className="hidden items-center gap-1 rounded-md border border-[color-mix(in_oklab,var(--foreground)_16%,var(--border))] px-1.5 py-0.5 font-mono text-[10px] lg:inline-flex">
                        <Command className="size-3" />K
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-[color-mix(in_oklab,var(--state-info)_26%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] p-0 shadow-[0_34px_80px_-32px_color-mix(in_oklab,var(--state-info)_45%,transparent)]">
                <DialogHeader className="border-b border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] p-4 pb-3">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="size-4 text-[var(--state-info)]" />
                        Buscador global
                    </DialogTitle>
                    <DialogDescription>
                        Encuentra secciones del sitio y accesos del navbar.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar software, licencias, servicios..."
                            className="w-full rounded-xl border border-[color-mix(in_oklab,var(--state-info)_25%,var(--border))] bg-[color-mix(in_oklab,var(--background)_88%,transparent)] py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-[color-mix(in_oklab,var(--state-info)_55%,var(--border))]"
                        />
                    </div>

                    <div className="mt-3 max-h-80 space-y-1 overflow-y-auto pr-1">
                        {filtered.length === 0 ? (
                            <p className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_7%,transparent)] px-3 py-4 text-sm text-muted-foreground">
                                No hay resultados para "{query}".
                            </p>
                        ) : (
                            filtered.map((item) => (
                                <Link
                                    key={`${item.href}-${item.label}`}
                                    href={item.href}
                                    className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-[color-mix(in_oklab,var(--state-info)_26%,var(--border))] hover:bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)]"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                                    <span className="text-xs text-muted-foreground">{item.section}</span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
