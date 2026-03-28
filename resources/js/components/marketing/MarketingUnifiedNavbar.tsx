/* eslint-disable */

import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu, ShoppingCart, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
    marketingPreciosLinks,
    marketingServiciosSectionLinks,
} from '@/constants/marketingNavLinks';
import MarketingGlobalSearch from '@/components/marketing/MarketingGlobalSearch';
import {
    clearSoftwareCart,
    getSoftwareCartTotalQty,
    readSoftwareCart,
    type SoftwareCartItem,
} from '@/lib/softwareCartStorage';

type Props = {
    canRegister?: boolean;
};

type DropdownKey = 'software' | 'precios' | 'servicios' | null;

function cx(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

function getUserDisplayName(name?: string | null) {
    if (!name) return { short: 'Cuenta', full: 'Cuenta' };

    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean) return { short: 'Cuenta', full: 'Cuenta' };

    const parts = clean.split(' ');
    const short = parts.slice(0, 2).join(' ');

    return { short, full: clean };
}

export default function MarketingUnifiedNavbar({ canRegister }: Props) {
    const { auth, canRegister: canRegisterFromPage, softwareNavLinks, licenseNavGroups: licenseNavGroupsFromPage } =
        usePage().props as {
            auth: { user?: { name: string } | null };
            canRegister?: boolean;
            softwareNavLinks?: { label: string; href: string }[];
            licenseNavGroups?: { categoryLabel: string; items: { label: string; href: string }[] }[];
        };

    const finalCanRegister = canRegister ?? canRegisterFromPage ?? true;

    const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
    const [openMobile, setOpenMobile] = useState(false);
    const [openMobileSection, setOpenMobileSection] = useState<'software' | 'precios' | 'servicios' | null>(null);
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const pathname =
        typeof window === 'undefined' ? '' : window.location.pathname;
    const [hash, setHash] = useState<string>(() =>
        typeof window === 'undefined' ? '' : window.location.hash,
    );

    const [cartCount, setCartCount] = useState(0);
    const [cartLines, setCartLines] = useState<SoftwareCartItem[]>([]);
    const [cartBump, setCartBump] = useState(false);

    useEffect(() => {
        const update = () => {
            setCartCount(getSoftwareCartTotalQty());
            setCartLines(readSoftwareCart());
        };

        update();
        window.addEventListener('orvae-cart-updated', update as EventListener);
        window.addEventListener('storage', update as EventListener);

        return () => {
            window.removeEventListener('orvae-cart-updated', update as EventListener);
            window.removeEventListener('storage', update as EventListener);
        };
    }, []);

    useEffect(() => {
        const onBump = () => {
            setCartBump(true);
            window.setTimeout(() => setCartBump(false), 900);
        };

        window.addEventListener('orvae-cart-updated', onBump);
        return () => window.removeEventListener('orvae-cart-updated', onBump);
    }, []);

    const [activeTop, setActiveTop] = useState<DropdownKey>('servicios');
    const [activeLandingSection, setActiveLandingSection] = useState<'inicio' | 'productos' | 'precios' | 'mercados' | 'contacto'>('inicio');
    const isContactoActive =
        pathname === '/contacto' ||
        (pathname === '/' && (hash === '#contacto' || activeLandingSection === 'contacto'));
    const isInicioActive = pathname === '/' && activeLandingSection === 'inicio';

    const getTopFromPath = (): DropdownKey => {
        if (pathname.startsWith('/contacto')) {
            return null;
        }
        if (pathname.startsWith('/software')) {
            return 'software';
        }
        if (pathname.startsWith('/licencias')) {
            return 'precios';
        }
        return 'servicios';
    };

    const getTopFromLanding = (
        section: 'inicio' | 'productos' | 'precios' | 'mercados' | 'contacto',
    ): DropdownKey => {
        if (section === 'inicio') return null;
        if (section === 'contacto') return null;
        if (section === 'precios') return 'precios';
        if (section === 'mercados') return 'servicios';
        return 'software';
    };

    useEffect(() => {
        if (!pathname) return;

        // Evita setState "síncrono" en el cuerpo del effect.
        const t = window.setTimeout(() => {
            if (pathname === '/') {
                setActiveLandingSection('inicio');
                setActiveTop(null);
                return;
            }

            setActiveTop(getTopFromPath());
        }, 0);

        return () => window.clearTimeout(t);
    }, [pathname]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const update = () => setHash(window.location.hash);
        update();
        window.addEventListener('hashchange', update);

        return () => window.removeEventListener('hashchange', update);
    }, []);

    useEffect(() => {
        if (pathname !== '/') return;
        if (!hash) return;

        if (hash === '#contacto') {
            setActiveLandingSection('contacto');
            setActiveTop(null);
        }
    }, [pathname, hash]);

    // Estado visual del navbar (shadow/opacity). No debe afectar el dropdown.
    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 8);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const closeAll = () => {
        setOpenDropdown(null);
        setOpenMobile(false);
        setOpenMobileSection(null);
        setOpenUserMenu(false);
    };

    // Si el dropdown está abierto y el usuario SÍ hace scroll, lo cerramos
    // para evitar desalineación.
    useEffect(() => {
        if (!openDropdown && !openMobile && !openUserMenu) {
            return;
        }

        const onScroll = () => {
            closeAll();
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [openDropdown, openMobile, openUserMenu]);

    useEffect(() => {
        if (pathname !== '/') {
            return;
        }

        const ids = ['inicio', 'productos', 'precios', 'mercados', 'contacto'] as const;
        const els = ids
            .map((id) => document.getElementById(id))
            .filter(Boolean) as HTMLElement[];

        if (els.length === 0) {
            return;
        }

        const ratiosRef: Record<string, number> = {};
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    ratiosRef[(entry.target as HTMLElement).id] = entry.intersectionRatio;
                }

                let bestId: (typeof ids)[number] = ids[0];
                let best = -1;
                for (const id of ids) {
                    const ratio = ratiosRef[id] ?? 0;
                    if (ratio > best) {
                        best = ratio;
                        bestId = id;
                    }
                }

                setActiveLandingSection(bestId);
                setActiveTop(getTopFromLanding(bestId));
            },
            { root: null, threshold: [0.2, 0.35, 0.5, 0.65] },
        );

        for (const el of els) {
            observer.observe(el);
        }

        return () => observer.disconnect();
    }, [pathname]);

    useEffect(() => {
        if (!openDropdown && !openMobile && !openUserMenu) {
            return;
        }

        const onDocumentClick = (event: MouseEvent | TouchEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) {
                return;
            }

            if (rootRef.current && !rootRef.current.contains(target)) {
                closeAll();
            }
        };

        // Importante: usar `click` en vez de `mousedown/touchstart` para que
        // Inertia procese la navegación antes de cerrar el dropdown.
        document.addEventListener('click', onDocumentClick);
        return () => {
            document.removeEventListener('click', onDocumentClick);
        };
    }, [openDropdown, openMobile, openUserMenu]);

    const topLinkClass =
        'relative inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] hover:text-[color-mix(in_oklab,var(--state-info)_86%,var(--foreground))] hover:shadow-[0_6px_18px_-10px_color-mix(in_oklab,var(--state-info)_55%,transparent)]';
    const activeUnderline =
        'absolute left-2 right-2 -bottom-0.5 z-10 h-[3px] rounded-full bg-[linear-gradient(90deg,var(--state-info),var(--state-success),var(--state-alert))] origin-left scale-x-0 transition-transform duration-300 pointer-events-none';

    const authActionsDesktop = auth.user ? (
        (() => {
            const userDisplay = getUserDisplayName(auth.user.name);

            return (
                <div className="relative">
                    <button
                        type="button"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[color-mix(in_oklab,var(--state-info)_48%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)]"
                        aria-label={`Cuenta de ${userDisplay.full}`}
                        aria-haspopup="menu"
                        aria-expanded={openUserMenu}
                        onClick={() => {
                            setOpenDropdown(null);
                            setOpenMobile(false);
                            setOpenMobileSection(null);
                            setOpenUserMenu((v) => !v);
                        }}
                    >
                        <span className="inline-flex size-7 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--state-info)_18%,transparent)] text-xs font-bold text-[var(--state-info)]">
                            {userDisplay.short
                                .split(' ')
                                .map((p) => p.charAt(0).toUpperCase())
                                .join('')
                                .slice(0, 2)}
                        </span>
                        <span className="max-w-[10rem] truncate">{userDisplay.short}</span>
                        <ChevronDown className="size-4 text-[var(--state-info)]" />
                    </button>

                    {openUserMenu && (
                        <div
                            className="absolute right-0 top-full z-[70] w-64 pt-2"
                            role="menu"
                            aria-label="Menú de usuario"
                        >
                            <div className="rounded-2xl border border-[var(--border)] bg-card/95 p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md">
                                <div
                                    className="rounded-2xl border p-2 shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--state-info)_35%,transparent)] backdrop-blur-md"
                                    style={{
                                        borderColor: 'color-mix(in oklab, var(--state-info) 28%, var(--border))',
                                        background:
                                            'linear-gradient(165deg, color-mix(in oklab, var(--card) 96%, transparent), color-mix(in oklab, var(--state-info) 8%, var(--card)), color-mix(in oklab, var(--state-success) 6%, var(--card)))',
                                    }}
                                >
                                <div
                                    className="rounded-xl border px-3 py-2.5"
                                    style={{
                                        borderColor: 'color-mix(in oklab, var(--state-info) 22%, var(--border))',
                                        background:
                                            'linear-gradient(135deg, color-mix(in oklab, var(--state-info) 14%, transparent), color-mix(in oklab, var(--state-success) 8%, transparent))',
                                    }}
                                >
                                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">{userDisplay.short}</p>
                                    <p className="truncate text-xs text-[var(--muted-foreground)]">Sesión activa</p>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <Link
                                        href="/dashboard"
                                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--state-info)_14%,transparent)] hover:text-[color-mix(in_oklab,var(--state-info)_75%,var(--foreground))]"
                                        onClick={closeAll}
                                    >
                                        Ir al panel
                                    </Link>
                                    <Link
                                        href="/logout"
                                        as="button"
                                        method="post"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--state-danger)_12%,transparent)] hover:text-[color-mix(in_oklab,var(--state-danger)_78%,var(--foreground))]"
                                        onClick={closeAll}
                                    >
                                        Cerrar sesión
                                    </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        })()
    ) : (
        <>
            <Link
                href="/login"
                className="rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[color-mix(in_oklab,var(--state-info)_50%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)]"
            >
                Iniciar sesión
            </Link>
            {finalCanRegister && (
                <Link
                    href="/register"
                    className="rounded-md px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_8px_24px_-10px_color-mix(in_oklab,var(--state-success)_68%,transparent)] transition-[filter,transform] duration-200 hover:brightness-105 hover:-translate-y-[1px]"
                    style={{
                        background:
                            'linear-gradient(135deg, color-mix(in oklab, var(--state-info) 88%, var(--state-success)), color-mix(in oklab, var(--state-success) 72%, var(--state-info)))',
                    }}
                >
                    Registrarse
                </Link>
            )}
        </>
    );

    const authActionsMobile = auth.user ? (
        <>
            <div className="rounded-xl border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--muted)_30%,transparent)] px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {getUserDisplayName(auth.user.name).short}
                </p>
                <p className="truncate text-xs text-[var(--muted-foreground)]">Sesión activa</p>
            </div>
            <Link
                href="/dashboard"
                className="rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[color-mix(in_oklab,var(--state-info)_48%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)]"
                onClick={closeAll}
            >
                Ir al panel
            </Link>
            <Link
                href="/logout"
                as="button"
                method="post"
                className="rounded-md border border-transparent px-4 py-2 text-left text-sm font-semibold text-[var(--foreground)] hover:border-[color-mix(in_oklab,var(--state-danger)_48%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-danger)_10%,transparent)]"
                onClick={closeAll}
            >
                Cerrar sesión
            </Link>
        </>
    ) : (
        authActionsDesktop
    );

    const softwareLinks =
        softwareNavLinks && softwareNavLinks.length > 0
            ? softwareNavLinks
            : [
                  { label: 'Software desarrollado', href: '/software' },
                  { label: 'Contabilidad', href: '/software#contabilidad' },
                  { label: 'Ventas', href: '/software#ventas' },
                  { label: 'Matrículas', href: '/software#matriculas' },
                  { label: 'Contratos', href: '/software#contratos' },
                  { label: 'Inventario', href: '/software#inventario' },
                  { label: 'Reportes', href: '/software#reportes' },
                  { label: 'Veterinaria', href: '/software#veterinaria' },
                  { label: 'Transporte', href: '/software#transporte' },
                  { label: 'Mensajería', href: '/software#mensajeria' },
              ];

    const fallbackLicenseGroups = [
        {
            categoryLabel: 'Licencias',
            items: [...marketingPreciosLinks],
        },
    ];
    const licenseNavGroups =
        licenseNavGroupsFromPage && licenseNavGroupsFromPage.length > 0
            ? licenseNavGroupsFromPage
            : fallbackLicenseGroups;

    const serviciosLinks = [
        { label: 'Servicios', href: '/servicios' },
        ...marketingServiciosSectionLinks,
    ];

    const renderLink = (l: { label: string; href: string }, style: 'primary' | 'secondary') => {
        const base = 'block cursor-pointer rounded-xl px-4 py-2 transition-colors';
        const primaryClass =
            'text-sm font-semibold text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_12%,transparent)]';
        const secondaryClass =
            'text-xs font-medium text-[var(--foreground)]/75 hover:text-[var(--o-amber)] hover:bg-[color-mix(in_oklab,var(--o-amber)_8%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))] py-1.5';
        const className = `${base} ${style === 'primary' ? primaryClass : secondaryClass}`;
        if (l.href.startsWith('#')) {
            return (
                <a key={l.href} href={l.href} className={className} onClick={closeAll}>
                    {l.label}
                </a>
            );
        }
        return (
            <Link key={l.href} href={l.href} className={className}>
                {l.label}
            </Link>
        );
    };

    const renderDesktopDropdown = (_key: Exclude<DropdownKey, null>, links: { label: string; href: string }[]) => {
        const [first, ...rest] = links;
        return (
            <div
                className="absolute left-0 top-full z-20 mt-3 w-72 rounded-2xl border p-2 backdrop-blur-xl"
                style={{
                    borderColor: 'color-mix(in oklab, var(--state-info) 20%, var(--border))',
                    background:
                        'linear-gradient(165deg, color-mix(in oklab, var(--card) 92%, transparent), color-mix(in oklab, var(--state-info) 5%, var(--card)))',
                    boxShadow:
                        '0 18px 50px -20px color-mix(in oklab, var(--foreground) 30%, transparent), 0 0 0 1px color-mix(in oklab, var(--state-info) 10%, transparent) inset',
                }}
                role="menu"
                aria-label="Menú desplegable"
            >
                {first && renderLink(first, 'primary')}
                {rest.length > 0 && (
                    <>
                        <div
                            className="my-1.5 border-t border-[color-mix(in_oklab,var(--o-amber)_25%,var(--border))]"
                            aria-hidden
                        />
                        {rest.map((l) => renderLink(l, 'secondary'))}
                    </>
                )}
            </div>
        );
    };

    const renderLicensesDesktopDropdown = (
        groups: { categoryLabel: string; items: { label: string; href: string }[] }[],
    ) => {
        return (
            <div
                className="absolute left-0 top-full z-20 mt-3 w-80 rounded-2xl border p-2 backdrop-blur-xl"
                style={{
                    borderColor: 'color-mix(in oklab, var(--state-info) 20%, var(--border))',
                    background:
                        'linear-gradient(165deg, color-mix(in oklab, var(--card) 92%, transparent), color-mix(in oklab, var(--state-info) 5%, var(--card)))',
                    boxShadow:
                        '0 18px 50px -20px color-mix(in oklab, var(--foreground) 30%, transparent), 0 0 0 1px color-mix(in oklab, var(--state-info) 10%, transparent) inset',
                }}
                role="menu"
                aria-label="Menú desplegable de licencias"
            >
                {groups.map((group, groupIndex) => (
                    <div key={`${group.categoryLabel}-${groupIndex}`}>
                        {groupIndex > 0 && (
                            <div
                                className="my-2 border-t border-[color-mix(in_oklab,var(--o-amber)_25%,var(--border))]"
                                aria-hidden
                            />
                        )}
                        <Link
                            href="/licencias"
                            className="block cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--o-amber)_12%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]"
                            onClick={closeAll}
                        >
                            {group.categoryLabel}
                        </Link>
                        <div
                            className="mb-1 border-t border-[color-mix(in_oklab,var(--state-info)_24%,var(--border))]"
                            aria-hidden
                        />
                        <div className="grid gap-0.5 pb-1">
                            {group.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/75 transition-colors hover:bg-[color-mix(in_oklab,var(--o-amber)_8%,transparent)] hover:text-[var(--o-amber)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div ref={rootRef}>
            <header
                className={[
                    'fixed inset-x-0 top-0 z-40 w-full transition-[box-shadow,background-color,border-color] duration-300 ease-out',
                    'border-b',
                    scrolled
                        ? 'border-[color-mix(in_oklab,var(--state-info)_22%,var(--border))] bg-background/95 shadow-[0_8px_30px_-12px_color-mix(in_oklab,var(--foreground)_24%,transparent),0_1px_0_0_color-mix(in_oklab,var(--state-info)_18%,transparent)] backdrop-blur-md'
                        : 'border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] bg-background/88 shadow-[0_1px_0_0_color-mix(in_oklab,var(--state-info)_10%,transparent)]',
                ].join(' ')}
            >
                <div
                    className={[
                        'relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 transition-[padding] duration-300 ease-out',
                        scrolled ? 'py-2.5' : 'py-4',
                    ].join(' ')}
                >
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-px"
                        style={{
                            background:
                                'linear-gradient(90deg, transparent, color-mix(in oklab, var(--state-info) 40%, transparent), color-mix(in oklab, var(--state-success) 35%, transparent), transparent)',
                        }}
                        aria-hidden
                    />

                    <Link href="/" className="flex shrink-0 items-center gap-3" onClick={closeAll}>
                        <img
                            src="/logo/orvae-logo-h-transparent-light.png"
                            alt="ORVAE"
                            className="h-11 w-auto sm:h-12 dark:hidden"
                        />
                        <img
                            src="/logo/orvae-logo-h-transparent-dark.png"
                            alt="ORVAE"
                            className="hidden h-11 w-auto sm:h-12 dark:block"
                        />
                    </Link>

                    <nav className="relative hidden items-center gap-1 md:flex" aria-label="Navegación principal">
                        <Link
                            href="/"
                            className={cx(
                                topLinkClass,
                                isInicioActive
                                    ? 'text-[var(--state-info)]'
                                    : 'text-[var(--foreground)]',
                            )}
                            onClick={closeAll}
                        >
                            Inicio
                            <span
                                className={activeUnderline}
                                style={{
                                    transform:
                                        pathname === '/'
                                            ? activeLandingSection === 'inicio'
                                                ? 'scaleX(1)'
                                                : 'scaleX(0)'
                                            : 'scaleX(0)',
                                }}
                            />
                        </Link>

                        <div className="relative">
                            <button
                                type="button"
                                className={cx(
                                    topLinkClass,
                                    activeTop === 'software'
                                        ? 'text-[var(--state-info)]'
                                        : 'text-[var(--foreground)]',
                                )}
                                onClick={() => {
                                    setOpenUserMenu(false);
                                    setOpenDropdown((v) => (v === 'software' ? null : 'software'));
                                }}
                                aria-expanded={openDropdown === 'software'}
                            >
                                Software
                                <ChevronDown className="size-4 text-[var(--o-amber)]" />
                                <span className={activeUnderline} style={{ transform: activeTop === 'software' ? 'scaleX(1)' : 'scaleX(0)' }} />
                            </button>
                            {openDropdown === 'software' && renderDesktopDropdown('software', softwareLinks)}
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                className={cx(
                                    topLinkClass,
                                    activeTop === 'precios'
                                        ? 'text-[var(--state-info)]'
                                        : 'text-[var(--foreground)]',
                                )}
                                onClick={() => {
                                    setOpenUserMenu(false);
                                    setOpenDropdown((v) => (v === 'precios' ? null : 'precios'));
                                }}
                                aria-expanded={openDropdown === 'precios'}
                            >
                                Licencias
                                <ChevronDown className="size-4 text-[var(--o-amber)]" />
                                <span className={activeUnderline} style={{ transform: activeTop === 'precios' ? 'scaleX(1)' : 'scaleX(0)' }} />
                            </button>
                            {openDropdown === 'precios' && renderLicensesDesktopDropdown(licenseNavGroups)}
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                className={cx(
                                    topLinkClass,
                                    activeTop === 'servicios'
                                        ? 'text-[var(--state-info)]'
                                        : 'text-[var(--foreground)]',
                                )}
                                onClick={() => {
                                    setOpenUserMenu(false);
                                    setOpenDropdown((v) => (v === 'servicios' ? null : 'servicios'));
                                }}
                                aria-expanded={openDropdown === 'servicios'}
                            >
                                Servicios
                                <ChevronDown className="size-4 text-[var(--o-amber)]" />
                                <span className={activeUnderline} style={{ transform: activeTop === 'servicios' ? 'scaleX(1)' : 'scaleX(0)' }} />
                            </button>
                            {openDropdown === 'servicios' && renderDesktopDropdown('servicios', serviciosLinks)}
                        </div>

                        <Link
                            href="/contacto"
                            className={cx(
                                topLinkClass,
                                isContactoActive
                                    ? 'text-[var(--state-info)]'
                                    : 'text-[var(--foreground)]',
                            )}
                            onClick={closeAll}
                        >
                            Contacto
                            <span
                                className={activeUnderline}
                                style={{
                                    transform: isContactoActive ? 'scaleX(1)' : 'scaleX(0)',
                                }}
                            />
                        </Link>
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        <MarketingGlobalSearch
                            softwareLinks={softwareLinks}
                            isLoggedIn={Boolean(auth.user)}
                            canRegister={finalCanRegister}
                        />
                        <div className="group/cart relative">
                            <Link
                                href="/carrito"
                                aria-label="Ir al carrito de compras"
                                title="Ir al carrito. Mayús+clic: vaciar. Pasa el mouse para ver el resumen."
                                className={[
                                    'relative z-[60] inline-flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-[var(--foreground)]',
                                    'transition-colors hover:border-[color-mix(in_oklab,var(--state-info)_48%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)]',
                                    'transform-gpu',
                                    cartBump ? 'animate-pulse scale-105' : '',
                                ].join(' ')}
                                onClick={(e) => {
                                    if (e.shiftKey) {
                                        e.preventDefault();
                                        clearSoftwareCart();
                                        setCartCount(0);
                                        setCartLines([]);
                                    }
                                }}
                            >
                                <ShoppingCart className="size-4 text-[var(--state-info)]" />
                                {cartCount > 0 && (
                                    <span className="min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-bold text-[var(--primary-foreground)]"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, color-mix(in oklab, var(--state-success) 88%, var(--state-info)), color-mix(in oklab, var(--state-info) 72%, var(--state-success)))',
                                        }}
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <div
                                className="pointer-events-none invisible absolute right-0 top-full z-[70] w-[min(20rem,calc(100vw-2rem))] pt-2 opacity-0 transition-all duration-200 group-hover/cart:pointer-events-auto group-hover/cart:visible group-hover/cart:opacity-100"
                                role="region"
                                aria-label="Resumen del carrito"
                            >
                                <div className="max-h-[min(70vh,22rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-card/95 p-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md">
                                    {cartLines.length === 0 ? (
                                        <p className="px-2 py-4 text-center text-sm text-[var(--muted-foreground)]">
                                            Tu carrito está vacío
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {cartLines.map((line) => (
                                                <li
                                                    key={`${line.systemSlug}:${line.planId}`}
                                                    className="rounded-xl border border-[color-mix(in_oklab,var(--border)_90%,transparent)] bg-background/60 px-3 py-2"
                                                >
                                                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                                                        {line.systemName ?? line.systemSlug}
                                                    </p>
                                                    <p className="truncate text-xs text-[var(--muted-foreground)]">
                                                        {line.planLabel ?? line.planId}
                                                    </p>
                                                    <p className="mt-1 text-xs font-medium tabular-nums text-[var(--foreground)]">
                                                        ×{line.qty}
                                                        {line.priceText ? (
                                                            <span className="ml-2 text-[var(--muted-foreground)]">
                                                                · {line.priceText}
                                                            </span>
                                                        ) : null}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className="mt-2 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] pt-2">
                                        <Link
                                            href="/carrito"
                                            className="block w-full rounded-lg px-2 py-2 text-center text-sm font-semibold text-[var(--primary)] underline-offset-4 hover:bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] hover:underline"
                                        >
                                            Ver el carrito
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {authActionsDesktop}
                    </div>

                    <div className="flex items-center gap-1.5 md:hidden">
                        <MarketingGlobalSearch
                            softwareLinks={softwareLinks}
                            isLoggedIn={Boolean(auth.user)}
                            canRegister={finalCanRegister}
                        />
                        <Link
                            href="/carrito"
                            aria-label="Ir al carrito de compras"
                            title="Ir al carrito. Mantén pulsado Mayús y toca para vaciar."
                            className={[
                                'relative inline-flex items-center gap-1 rounded-md border border-transparent px-2.5 py-2 text-[var(--foreground)]',
                                'transition-colors hover:border-[color-mix(in_oklab,var(--state-info)_48%,transparent)] hover:bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)]',
                                'transform-gpu',
                                cartBump ? 'animate-pulse scale-105' : '',
                            ].join(' ')}
                            onClick={(e) => {
                                if (e.shiftKey) {
                                    e.preventDefault();
                                    clearSoftwareCart();
                                    setCartCount(0);
                                    setCartLines([]);
                                }
                            }}
                        >
                            <ShoppingCart className="size-[1.35rem] text-[var(--state-info)]" />
                            {cartCount > 0 && (
                                <span
                                    className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1 text-[0.65rem] font-bold leading-none text-[var(--primary-foreground)]"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, color-mix(in oklab, var(--state-success) 88%, var(--state-info)), color-mix(in oklab, var(--state-info) 72%, var(--state-success)))',
                                    }}
                                >
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            type="button"
                            className="relative z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] touch-manipulation"
                            aria-label="Abrir menú"
                            aria-expanded={openMobile}
                            onClick={() => setOpenMobile((v) => !v)}
                        >
                            {openMobile ? (
                                <X className="pointer-events-none size-5 shrink-0" aria-hidden />
                            ) : (
                                <Menu className="pointer-events-none size-5 shrink-0" aria-hidden />
                            )}
                        </button>
                    </div>
                </div>

                {openMobile && (
                    <div className="border-t border-[var(--border)] bg-card md:hidden">
                        <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-4">
                            <div className="flex flex-col gap-1">
                                <Link
                                    href="/"
                                    className={cx(
                                        'cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)]',
                                        isInicioActive ? 'text-[var(--state-info)]' : 'text-[var(--foreground)]',
                                    )}
                                    onClick={closeAll}
                                >
                                    Inicio
                                </Link>

                                <button
                                    type="button"
                                    className={cx(
                                        'flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] touch-manipulation',
                                        activeTop === 'software' ? 'text-[var(--state-info)]' : 'text-[var(--foreground)]',
                                    )}
                                    onClick={() =>
                                        setOpenMobileSection((v) => (v === 'software' ? null : 'software'))
                                    }
                                >
                                    <span className="min-w-0 flex-1">Software desarrollado</span>
                                    <ChevronDown
                                        className="size-4 shrink-0 pointer-events-none text-[var(--o-amber)]"
                                        aria-hidden
                                    />
                                </button>
                                {openMobileSection === 'software' && (
                                    <div className="grid gap-1 px-1 pb-2">
                                        {softwareLinks.map((l, i) => (
                                            <span key={l.href}>
                                                {i === 1 && (
                                                    <div className="my-1.5 border-t border-[color-mix(in_oklab,var(--o-amber)_25%,var(--border))]" aria-hidden />
                                                )}
                                                {l.href.startsWith('#') ? (
                                                    <a
                                                        href={l.href}
                                                        className={i === 0 ? 'cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_12%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]' : 'cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/75 hover:text-[var(--o-amber)] hover:bg-[color-mix(in_oklab,var(--o-amber)_8%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]'}
                                                        onClick={closeAll}
                                                    >
                                                        {l.label}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={l.href}
                                                        className={i === 0 ? 'cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_12%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]' : 'cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/75 hover:text-[var(--o-amber)] hover:bg-[color-mix(in_oklab,var(--o-amber)_8%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]'}
                                                    >
                                                        {l.label}
                                                    </Link>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className={cx(
                                        'flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] touch-manipulation',
                                        activeTop === 'precios' ? 'text-[var(--state-info)]' : 'text-[var(--foreground)]',
                                    )}
                                    onClick={() =>
                                        setOpenMobileSection((v) => (v === 'precios' ? null : 'precios'))
                                    }
                                >
                                    <span className="min-w-0 flex-1">Licencias</span>
                                    <ChevronDown
                                        className="size-4 shrink-0 pointer-events-none text-[var(--o-amber)]"
                                        aria-hidden
                                    />
                                </button>
                                {openMobileSection === 'precios' && (
                                    <div className="grid gap-1 px-1 pb-2">
                                        {licenseNavGroups.map((group, groupIndex) => (
                                            <div key={`${group.categoryLabel}-${groupIndex}`} className="grid gap-1">
                                                {groupIndex > 0 && (
                                                    <div className="my-1.5 border-t border-[color-mix(in_oklab,var(--o-amber)_25%,var(--border))]" aria-hidden />
                                                )}
                                                <Link
                                                    href="/licencias"
                                                    className="block cursor-pointer rounded-xl px-3 py-1 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_oklab,var(--o-amber)_12%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]"
                                                    onClick={closeAll}
                                                >
                                                    {group.categoryLabel}
                                                </Link>
                                                <div
                                                    className="mb-1 border-t border-[color-mix(in_oklab,var(--state-info)_24%,var(--border))]"
                                                    aria-hidden
                                                />
                                                {group.items.map((item) => (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/75 hover:bg-[color-mix(in_oklab,var(--o-amber)_8%,transparent)] hover:text-[var(--o-amber)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className={cx(
                                        'flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)] touch-manipulation',
                                        activeTop === 'servicios' ? 'text-[var(--state-info)]' : 'text-[var(--foreground)]',
                                    )}
                                    onClick={() =>
                                        setOpenMobileSection((v) => (v === 'servicios' ? null : 'servicios'))
                                    }
                                >
                                    <span className="min-w-0 flex-1">Servicios</span>
                                    <ChevronDown
                                        className="size-4 shrink-0 pointer-events-none text-[var(--o-amber)]"
                                        aria-hidden
                                    />
                                </button>
                                {openMobileSection === 'servicios' && (
                                    <div className="grid gap-1 px-1 pb-2">
                                        {serviciosLinks.map((l, i) => (
                                            <span key={l.href}>
                                                {i === 1 && (
                                                    <div className="my-1.5 border-t border-[color-mix(in_oklab,var(--o-amber)_25%,var(--border))]" aria-hidden />
                                                )}
                                                {l.href.startsWith('#') ? (
                                                    <a href={l.href} className={i === 0 ? 'cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_12%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]' : 'cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/75 hover:text-[var(--o-amber)] hover:bg-[color-mix(in_oklab,var(--o-amber)_8%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]'} onClick={closeAll}>
                                                    {l.label}
                                                </a>
                                                ) : (
                                                    <Link href={l.href} className={i === 0 ? 'cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--o-amber)_12%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]' : 'cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/75 hover:text-[var(--o-amber)] hover:bg-[color-mix(in_oklab,var(--o-amber)_8%,transparent)] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_26%,var(--background))] dark:hover:text-[color-mix(in_oklab,var(--state-info)_88%,var(--foreground))]'}>
                                                        {l.label}
                                                    </Link>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <Link
                                    href="/contacto"
                                    className={cx(
                                        'cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold hover:bg-[color-mix(in_oklab,var(--o-amber)_10%,transparent)]',
                                        isContactoActive ? 'text-[var(--state-info)]' : 'text-[var(--foreground)]',
                                    )}
                                    onClick={closeAll}
                                >
                                    Contacto
                                </Link>
                            </div>

                            <div className="mt-4 grid gap-2">{authActionsMobile}</div>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}

