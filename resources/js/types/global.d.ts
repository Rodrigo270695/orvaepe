import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            flash: { toast?: unknown };
            /** Dropdown Software en navbar marketing (catálogo dinámico) */
            softwareNavLinks?: { label: string; href: string }[];
            [key: string]: unknown;
        };
    }
}
