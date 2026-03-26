import { Link } from '@inertiajs/react';
import { Command, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { clientPortalNavItems } from '@/components/client-portal/client-portal-nav';
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

const quickItems: SearchItem[] = [
    { label: 'Panel principal', href: '/cliente', section: 'Atajos', keywords: ['dashboard', 'inicio'] },
    { label: 'Perfil', href: '/cliente/perfil', section: 'Cuenta', keywords: ['usuario', 'datos'] },
    { label: 'Seguridad', href: '/cliente/seguridad', section: 'Cuenta', keywords: ['password', '2fa'] },
    { label: 'Catálogo software', href: '/software', section: 'Atajos', keywords: ['planes', 'productos'] },
];

function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function buildIndex(): SearchItem[] {
    const fromNav: SearchItem[] = clientPortalNavItems.flatMap((item) => {
        const root: SearchItem = {
            label: item.label,
            href: item.href,
            section: 'Portal',
            keywords: [item.label],
        };

        const children = (item.flyout ?? []).map((sub) => ({
            label: sub.label,
            href: sub.href,
            section: item.label,
            keywords: [item.label, sub.label],
        }));

        return [root, ...children];
    });

    const byKey = new Map<string, SearchItem>();
    [...quickItems, ...fromNav].forEach((item) => {
        const key = `${item.href}::${item.label}`;
        if (!byKey.has(key)) byKey.set(key, item);
    });

    return Array.from(byKey.values());
}

export function ClientGlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const index = useMemo(buildIndex, []);

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

    const filtered = useMemo(() => {
        const q = normalizeText(query);
        if (!q) return index.slice(0, 8);

        return index
            .filter((item) => {
                const haystack = normalizeText(
                    `${item.label} ${item.section} ${(item.keywords ?? []).join(' ')}`,
                );
                return haystack.includes(q);
            })
            .slice(0, 8);
    }, [index, query]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-9 cursor-pointer gap-2 border-[color-mix(in_oklab,var(--state-info)_30%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_8%,transparent)] px-3 text-foreground shadow-[0_8px_22px_-18px_color-mix(in_oklab,var(--state-info)_38%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-info)_14%,transparent)]"
                >
                    <Search className="size-4 text-(--state-info)" />
                    <span className="hidden text-sm sm:inline">Buscar</span>
                    <span className="hidden items-center gap-1 rounded-md border border-[color-mix(in_oklab,var(--foreground)_16%,var(--border))] px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
                        <Command className="size-3" />K
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-[color-mix(in_oklab,var(--state-info)_26%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] p-0 shadow-[0_34px_80px_-32px_color-mix(in_oklab,var(--state-info)_45%,transparent)]">
                <DialogHeader className="border-b border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] p-4 pb-3">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="size-4 text-(--state-info)" />
                        Buscador global
                    </DialogTitle>
                    <DialogDescription>
                        Encuentra secciones del portal, accesos directos y vistas clave.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar pagos, facturas, perfil..."
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
                                    <span className="text-sm font-medium text-foreground">
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {item.section}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
