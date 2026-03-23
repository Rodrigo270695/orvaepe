import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    FileText,
    Headphones,
    LayoutDashboard,
    Layers,
    Receipt,
    Wallet,
} from 'lucide-react';

import { cn, toUrl } from '@/lib/utils';

type FlyoutItem = { href: string; label: string };

type NavItem = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    flyout?: FlyoutItem[];
};

export const clientPortalNavItems: NavItem[] = [
    {
        href: '/cliente',
        label: 'Dashboard',
        icon: LayoutDashboard,
    },
    {
        href: '/cliente/servicios',
        label: 'Servicios',
        icon: Layers,
        flyout: [
            { href: '/cliente/servicios', label: 'Mis servicios' },
            { href: '/software', label: 'Ver catálogo' },
        ],
    },
    {
        href: '/cliente/pagos',
        label: 'Pagos',
        icon: Wallet,
    },
    {
        href: '/cliente/notificaciones',
        label: 'Notificaciones',
        icon: Bell,
    },
    {
        href: '/cliente/facturas',
        label: 'Facturas',
        icon: FileText,
    },
    {
        href: '/cliente/facturacion',
        label: 'Datos de facturación',
        icon: Receipt,
    },
    {
        href: '/cliente/soporte',
        label: 'Soporte',
        icon: Headphones,
    },
];

function NavRow({
    item,
    currentUrl,
    onNavigate,
}: {
    item: NavItem;
    currentUrl: string;
    onNavigate?: () => void;
}) {
    const Icon = item.icon;
    const active =
        item.href === '/cliente'
            ? currentUrl === '/cliente' || currentUrl === '/cliente/'
            : currentUrl.startsWith(item.href);

    const content = (
        <span
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors',
                active
                    ? 'bg-violet-100 text-violet-900'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900',
            )}
        >
            <Icon
                className={cn(
                    'size-5 shrink-0',
                    active
                        ? 'text-[var(--o-void)]'
                        : 'text-[var(--o-dark2)]',
                )}
            />
            {item.label}
        </span>
    );

    if (!item.flyout?.length) {
        return (
            <li>
                <Link
                    href={item.href}
                    prefetch
                    className="block"
                    onClick={onNavigate}
                >
                    {content}
                </Link>
            </li>
        );
    }

    return (
        <li className="group relative">
            <Link
                href={item.href}
                prefetch
                className="block"
                onClick={onNavigate}
            >
                {content}
            </Link>
            <div
                className={cn(
                    'pointer-events-none invisible absolute left-full top-0 z-50 ml-1 min-w-[13.5rem] rounded-xl border border-zinc-200 bg-white py-2 opacity-0 shadow-xl transition-all duration-150 max-lg:hidden',
                    'group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100',
                )}
            >
                <p className="border-b border-zinc-100 px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {item.label}
                </p>
                <ul className="pt-1">
                    {item.flyout.map((sub) => (
                        <li key={sub.href + sub.label}>
                            <Link
                                href={sub.href}
                                prefetch
                                className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                                onClick={onNavigate}
                            >
                                {sub.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <ul
                className="mt-1 space-y-0.5 border-l-2 border-zinc-200 pl-3 lg:hidden"
                aria-label={`${item.label}: submenú`}
            >
                {item.flyout.map((sub) => (
                    <li key={`m-${sub.href}-${sub.label}`}>
                        <Link
                            href={sub.href}
                            prefetch
                            className="block rounded-md px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                            onClick={onNavigate}
                        >
                            {sub.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </li>
    );
}

export function ClientPortalNav({
    onNavigate,
    className,
}: {
    onNavigate?: () => void;
    className?: string;
}) {
    const { url } = usePage();
    const currentUrl = toUrl(url);

    return (
        <nav
            className={cn('space-y-1 p-3', className)}
            aria-label="Área del cliente"
        >
            <ul className="space-y-0.5">
                {clientPortalNavItems.map((item) => (
                    <NavRow
                        key={item.href + item.label}
                        item={item}
                        currentUrl={currentUrl}
                        onNavigate={onNavigate}
                    />
                ))}
            </ul>
        </nav>
    );
}
