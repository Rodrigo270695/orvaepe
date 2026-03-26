import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { panelPath } from '@/config/admin-panel';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                <Link
                    href={panelPath('acceso-notificaciones')}
                    prefetch
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--state-info)_28%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_6%,transparent)] text-[color-mix(in_oklab,var(--state-info)_82%,var(--foreground))] shadow-sm transition-colors hover:bg-[color-mix(in_oklab,var(--state-info)_12%,transparent)]"
                    aria-label="Ver notificaciones"
                >
                    <Bell className="size-4" />
                </Link>
            </div>
        </header>
    );
}
