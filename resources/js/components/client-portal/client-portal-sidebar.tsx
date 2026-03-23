import { Link } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';

import { ClientPortalNav } from '@/components/client-portal/client-portal-nav';

function SidebarFooter() {
    return (
        <div className="border-t border-zinc-100 p-3">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-2 py-2 text-xs text-zinc-500">
                <CreditCard className="size-4 text-(--o-dark2)" />
                Pagos seguros
            </div>
        </div>
    );
}

export function ClientPortalSidebar() {
    return (
        <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
            <div className="flex h-16 items-center border-b border-zinc-100 px-4">
                <Link
                    href="/cliente"
                    className="flex items-center"
                    prefetch
                >
                    <img
                        src="/logo/orvae-logo-h-transparent-light.png"
                        alt="ORVAE"
                        className="h-10 w-auto"
                    />
                </Link>
            </div>
            <ClientPortalNav className="flex-1" />
            <SidebarFooter />
        </aside>
    );
}

export { SidebarFooter as ClientPortalSidebarFooter };
