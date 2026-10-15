import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import AdminFlashToast from '@/components/ui/admin-flash-toast';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="h-svh min-h-0 overflow-hidden md:peer-data-[variant=inset]:h-[calc(100svh-(--spacing(4)))]"
            >
                <AdminFlashToast />
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {/* scroll-region: Inertia guarda y restaura el scroll de este contenedor */}
                <div
                    scroll-region=""
                    className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
                >
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
