import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { dashboard, logout } from '@/routes';
import { usePage } from '@inertiajs/react';

type Props = {
    canRegister?: boolean;
};

export default function WelcomeNavbar({ canRegister = true }: Props) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState<string>('productos');
    const [scrolled, setScrolled] = useState(false);
    const ratiosRef = useRef<Record<string, number>>({});

    const sectionIds = useMemo(
        () => ['productos', 'precios', 'mercados', 'contacto'],
        [],
    );

    const items = useMemo(
        () => [
            { id: 'productos', label: 'Productos' },
            { id: 'precios', label: 'Precios' },
            { id: 'mercados', label: 'Mercados' },
            { id: 'contacto', label: 'Contacto' },
        ],
        [],
    );

    const hrefForNavId = (id: string) => {
        if (id === 'productos') return '/software';
        if (id === 'precios') return '/licencias';
        if (id === 'mercados') return '/servicios';
        return `#${id}`;
    };

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 8);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const elements = sectionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean) as HTMLElement[];

        if (elements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const id = (entry.target as HTMLElement).id;
                    ratiosRef.current[id] = entry.intersectionRatio;
                }

                let bestId = sectionIds[0];
                let best = -1;
                for (const id of sectionIds) {
                    const ratio = ratiosRef.current[id] ?? 0;
                    if (ratio > best) {
                        best = ratio;
                        bestId = id;
                    }
                }

                if (bestId) {
                    setActiveId(bestId);
                }
            },
            { root: null, threshold: [0.2, 0.35, 0.5, 0.65] },
        );

        for (const el of elements) {
            observer.observe(el);
        }

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionIds]);

    const authActions = (
        <>
            <Link
                href="/login"
                className="rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[color-mix(in_oklab,var(--o-amber)_55%,transparent)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)]"
                onClick={() => setOpen(false)}
            >
                Iniciar sesión
            </Link>
            {canRegister && (
                <Link
                    href="/register"
                    className="rounded-md bg-[linear-gradient(135deg,color-mix(in_oklab,var(--o-amber)_55%,transparent),var(--primary))] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-none hover:opacity-95"
                    onClick={() => setOpen(false)}
                >
                    Registrarse
                </Link>
            )}
        </>
    );

    const loggedActions = (
        <>
            <Link
                href={dashboard()}
                className="rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[color-mix(in_oklab,var(--o-amber)_55%,transparent)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)]"
                onClick={() => setOpen(false)}
            >
                Panel
            </Link>
            <Link
                href={logout()}
                as="button"
                className="rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[color-mix(in_oklab,var(--o-amber)_55%,transparent)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)]"
                onClick={() => setOpen(false)}
            >
                Salir
            </Link>
        </>
    );

    return (
        <header
            className={[
                'sticky top-0 z-40 w-full border-b border-[var(--border)] backdrop-blur overflow-hidden',
                'bg-background/55 backdrop-blur-xl transition-[background,box-shadow,transform] duration-300',
                scrolled
                    ? 'bg-background/80 shadow-[0_18px_54px_-34px_rgba(0,0,0,0.45)]'
                    : 'shadow-[0_10px_30px_-20px_rgba(0,0,0,0.18)]',
            ].join(' ')}
        >
            <div
                className={[
                    'relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 transition-[padding] duration-300',
                    scrolled ? 'py-3' : 'py-4',
                ].join(' ')}
            >
                <Link
                    href="/"
                    className="flex items-center gap-3"
                    onClick={() => setOpen(false)}
                >
                    <img
                        src="/logo/orvae-logo-h-transparent-light.png"
                        alt="ORVAE"
                        className="h-6 w-auto dark:hidden"
                    />
                    <img
                        src="/logo/orvae-logo-h-transparent-dark.png"
                        alt="ORVAE"
                        className="hidden h-6 w-auto dark:block"
                    />
                </Link>

                <nav className="relative hidden items-center gap-1 md:flex rounded-full border border-[color-mix(in_oklab,var(--o-amber)_18%,var(--border))] bg-background/35 px-2 py-1 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)]">
                    {items.map((it) => (
                        (() => {
                            const href = hrefForNavId(it.id);
                            const className = [
                                'group relative rounded-full px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--o-amber)_55%,transparent)]/60',
                                it.id === activeId
                                    ? 'text-[var(--foreground)]'
                                    : 'text-[var(--muted-foreground)] hover:-translate-y-px hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] hover:text-[var(--foreground)]',
                            ].join(' ');

                            const inner = (
                                <>
                                    <span className="relative z-10">{it.label}</span>
                                    <span
                                        className={[
                                            'absolute inset-x-2 bottom-1 h-[2px] rounded-full bg-[var(--o-amber)] origin-left scale-x-0 transition-transform duration-300',
                                            it.id === activeId
                                                ? 'scale-x-100'
                                                : 'group-hover:scale-x-100',
                                        ].join(' ')}
                                    />
                                </>
                            );

                            if (href.startsWith('#')) {
                                return (
                                    <a
                                        key={it.id}
                                        href={href}
                                        className={className}
                                    >
                                        {inner}
                                    </a>
                                );
                            }

                            return (
                                <Link
                                    key={it.id}
                                    href={href}
                                    className={className}
                                >
                                    {inner}
                                </Link>
                            );
                        })()
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    {auth.user ? loggedActions : authActions}
                </div>

                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md p-2 text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] md:hidden"
                    aria-label="Abrir menú"
                    onClick={() => setOpen((v) => !v)}
                >
                    {open ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </div>

            {open && (
                <div className="border-t border-[var(--border)] bg-background/70 backdrop-blur-xl md:hidden">
                    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-4">
                        <nav className="grid gap-1">
                            {items.map((it) => (
                                (() => {
                                    const href = hrefForNavId(it.id);
                                    const className = [
                                        'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                                        it.id === activeId
                                            ? 'text-[var(--foreground)] bg-[color-mix(in_oklab,var(--o-amber)_12%,transparent)]'
                                            : 'text-[var(--muted-foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] hover:text-[var(--foreground)]',
                                    ].join(' ');

                                    if (href.startsWith('#')) {
                                        return (
                                            <a
                                                key={it.id}
                                                href={href}
                                                className={className}
                                                onClick={() => setOpen(false)}
                                            >
                                                {it.label}
                                            </a>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={it.id}
                                            href={href}
                                            className={className}
                                            onClick={() => setOpen(false)}
                                        >
                                            {it.label}
                                        </Link>
                                    );
                                })()
                            ))}
                        </nav>

                        <div className="mt-4 grid gap-2">
                            {auth.user ? loggedActions : authActions}
                        </div>
                    </div>
                </div>
            )}

        </header>
    );
}

