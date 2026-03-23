import type { SeoDefaults } from '@/components/seo/SeoHead';
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
            /** Metadatos y URLs para SEO (manifest, OG, JSON-LD) */
            seo: SeoDefaults;
            [key: string]: unknown;
        };
    }
}
