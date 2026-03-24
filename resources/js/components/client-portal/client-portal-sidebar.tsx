import { Link } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';

import { ClientPortalNav } from '@/components/client-portal/client-portal-nav';

function SidebarFooter() {
    return (
        <div className="border-t border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] p-3">
            <div className="flex items-center gap-2 rounded-lg border border-[color-mix(in_oklab,var(--state-success)_34%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--state-success)_14%,transparent),color-mix(in_oklab,var(--state-info)_12%,transparent))] px-2 py-2 text-xs text-[color-mix(in_oklab,var(--state-success)_74%,var(--foreground))]">
                <CreditCard className="size-4 text-(--state-success)" />
                Pagos seguros
            </div>
        </div>
    );
}

export function ClientPortalSidebar() {
    return (
        <aside className="hidden w-60 shrink-0 flex-col border-r border-[color-mix(in_oklab,var(--state-info)_24%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,transparent),color-mix(in_oklab,var(--card)_82%,var(--background)))] backdrop-blur-xl lg:flex">
            <div className="flex h-16 items-center border-b border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] px-4">
                <Link
                    href="/cliente"
                    className="flex items-center"
                    prefetch
                >
                    <img
                        src="/logo/orvae-logo-h-transparent-light.png"
                        alt="ORVAE"
                        className="h-10 w-auto dark:hidden"
                    />
                    <img
                        src="/logo/orvae-logo-h-transparent-dark.png"
                        alt="ORVAE"
                        className="hidden h-10 w-auto dark:block"
                    />
                </Link>
            </div>
            <ClientPortalNav className="flex-1" />
            <SidebarFooter />
        </aside>
    );
}

export { SidebarFooter as ClientPortalSidebarFooter };
