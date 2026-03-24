import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Menu } from 'lucide-react';

import { ClientUserMenuContent } from '@/components/client-portal/client-user-menu-content';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

type Props = {
    title: string;
    breadcrumbs?: { label: string; href?: string }[];
    /** Mostrar el título (h1) bajo las migas en la cabecera. */
    showTitle?: boolean;
    onOpenMobileNav?: () => void;
};

export function ClientPortalHeader({
    title,
    breadcrumbs,
    showTitle = true,
    onOpenMobileNav,
}: Props) {
    const { auth } = usePage().props;
    const user = auth.user as User | null;

    return (
        <header className="sticky top-0 z-40 border-b border-[color-mix(in_oklab,var(--state-info)_24%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,var(--background))]/95 backdrop-blur-xl">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                        {onOpenMobileNav ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="mt-0.5 h-9 w-9 shrink-0 border-[color-mix(in_oklab,var(--state-info)_28%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)] text-foreground lg:hidden"
                                onClick={onOpenMobileNav}
                                aria-label="Abrir menú de navegación"
                            >
                                <Menu className="size-5" />
                            </Button>
                        ) : null}
                        <div
                            className={cn(
                                'flex min-w-0 flex-1 flex-col',
                                showTitle && 'gap-2.5',
                            )}
                        >
                        <nav aria-label="Migas de pan">
                            <ol className="flex flex-wrap items-center gap-x-1 text-[13px] leading-snug text-muted-foreground sm:text-sm">
                                <li className="inline-flex items-center">
                                    <Link
                                        href="/cliente"
                                        className="font-medium text-muted-foreground transition-colors hover:text-[color-mix(in_oklab,var(--state-info)_72%,var(--foreground))]"
                                    >
                                        Portal
                                    </Link>
                                </li>
                                {breadcrumbs?.map((b) => (
                                    <li
                                        key={b.label}
                                        className="inline-flex max-w-full items-center gap-x-1"
                                    >
                                        <ChevronRight
                                            className="size-3.5 shrink-0 text-muted-foreground"
                                            aria-hidden
                                        />
                                        {b.href ? (
                                            <Link
                                                href={b.href}
                                                className="truncate font-medium text-foreground/80 underline-offset-2 hover:text-[color-mix(in_oklab,var(--state-info)_72%,var(--foreground))] hover:underline"
                                            >
                                                {b.label}
                                            </Link>
                                        ) : (
                                            <span
                                                className="truncate font-medium text-foreground/80"
                                                aria-current="page"
                                            >
                                                {b.label}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                        {showTitle ? (
                            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                                {title}
                            </h1>
                        ) : null}
                        </div>
                    </div>
                    {user ? (
                        <div className="flex shrink-0 justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="max-w-44 border-[color-mix(in_oklab,var(--state-info)_25%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] text-left text-xs font-normal text-foreground shadow-[0_8px_20px_-14px_color-mix(in_oklab,var(--foreground)_30%,transparent)] sm:max-w-56 sm:text-sm"
                                >
                                    <span className="truncate">
                                        {user.name}
                                        {user.lastname
                                            ? ` ${user.lastname}`
                                            : ''}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="min-w-56"
                            >
                                <ClientUserMenuContent user={user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
