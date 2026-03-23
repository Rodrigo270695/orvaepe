import { Head, Link } from '@inertiajs/react';
import { useState, type PropsWithChildren } from 'react';

import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { ClientPortalHeader } from '@/components/client-portal/client-portal-header';
import { ClientPortalNav } from '@/components/client-portal/client-portal-nav';
import {
    ClientPortalSidebar,
    ClientPortalSidebarFooter,
} from '@/components/client-portal/client-portal-sidebar';
import AdminFlashToast from '@/components/ui/admin-flash-toast';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type Props = PropsWithChildren<{
    title: string;
    headTitle?: string;
    breadcrumbs?: { label: string; href?: string }[];
    /** Si es false, el título no se muestra en la cabecera (p. ej. como card en la página). */
    titleInHeader?: boolean;
}>;

/**
 * Portal de cliente (fondo claro tipo SaaS; navegación móvil con sheet).
 */
export default function ClientPortalLayout({
    children,
    title,
    headTitle,
    breadcrumbs = [{ label: 'Área del cliente' }],
    titleInHeader = true,
}: Props) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-100 text-zinc-900 antialiased">
            <Head title={headTitle ?? title} />
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent
                    side="left"
                    className="flex w-[min(100vw-2rem,20rem)] flex-col gap-0 border-zinc-200 bg-white p-0 text-zinc-900"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Menú del portal</SheetTitle>
                    </SheetHeader>
                    <div className="flex h-16 items-center border-b border-zinc-100 px-4">
                        <Link
                            href="/cliente"
                            className="flex items-center gap-2"
                            prefetch
                            onClick={() => setMobileNavOpen(false)}
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white md:hidden">
                                <AppLogoIcon className="h-5 w-5 fill-(--o-dark2)" />
                            </span>
                            <span className="text-sm font-semibold tracking-wide text-zinc-700 md:hidden">
                                ORVAE
                            </span>
                            <div className="hidden md:block">
                                <AppLogo />
                            </div>
                        </Link>
                    </div>
                    <ClientPortalNav
                        className="flex-1 overflow-y-auto"
                        onNavigate={() => setMobileNavOpen(false)}
                    />
                    <ClientPortalSidebarFooter />
                </SheetContent>
            </Sheet>
            <div className="flex min-h-screen">
                <ClientPortalSidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    <AdminFlashToast />
                    <ClientPortalHeader
                        title={title}
                        breadcrumbs={breadcrumbs}
                        showTitle={titleInHeader}
                        onOpenMobileNav={() => setMobileNavOpen(true)}
                    />
                    <main className="flex-1 px-6 py-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
