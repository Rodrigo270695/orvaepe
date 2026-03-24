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
        <div className="relative min-h-screen text-foreground antialiased">
            <Head title={headTitle ?? title} />
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `
                        linear-gradient(
                            165deg,
                            color-mix(in oklab, var(--background) 94%, var(--state-info) 2%) 0%,
                            color-mix(in oklab, var(--background) 88%, var(--state-info) 4%) 26%,
                            color-mix(in oklab, var(--background) 82%, var(--state-success) 6%) 52%,
                            color-mix(in oklab, var(--background) 88%, var(--state-alert) 4%) 76%,
                            var(--background) 100%
                        ),
                        radial-gradient(
                            ellipse 90% 75% at 0% 20%,
                            color-mix(in oklab, var(--state-info) 18%, transparent) 0%,
                            transparent 56%
                        ),
                        radial-gradient(
                            ellipse 80% 90% at 100% 85%,
                            color-mix(in oklab, var(--state-success) 15%, transparent) 0%,
                            transparent 58%
                        )
                    `,
                }}
                aria-hidden
            />
            <div className="landing-grain pointer-events-none absolute inset-0 z-0" aria-hidden />
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent
                    side="left"
                    className="flex w-[min(100vw-2rem,20rem)] flex-col gap-0 border-[color-mix(in_oklab,var(--state-info)_25%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] p-0 text-foreground backdrop-blur-xl"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Menú del portal</SheetTitle>
                    </SheetHeader>
                    <div className="flex h-16 items-center border-b border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] px-4">
                        <Link
                            href="/cliente"
                            className="flex items-center gap-2"
                            prefetch
                            onClick={() => setMobileNavOpen(false)}
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color-mix(in_oklab,var(--state-info)_35%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)] md:hidden">
                                <AppLogoIcon className="h-5 w-5 fill-(--o-dark2)" />
                            </span>
                            <span className="text-sm font-semibold tracking-wide text-foreground/85 md:hidden">
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
            <div className="relative z-10 flex min-h-screen">
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
