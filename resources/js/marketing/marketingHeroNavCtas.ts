import type { PageHeroCTA } from '@/components/marketing/PageHero';

/**
 * Contexto de la página marketing donde se muestra el PageHero.
 * Los CTAs guían al visitante hacia las otras áreas (nunca repiten la página actual).
 */
export type MarketingHeroNavContext = 'home' | 'software' | 'licencias' | 'servicios' | 'contacto';

/**
 * Tres accesos rápidos al resto del sitio según la página actual.
 * En inicio y contacto: Software, Licencias, Servicios.
 * En software: Contacto, Licencias, Servicios.
 * En licencias: Software, Contacto, Servicios.
 * En servicios: Software, Contacto, Licencias.
 */
export function getMarketingHeroNavCtas(context: MarketingHeroNavContext): PageHeroCTA[] {
    const outline = 'outline' as const;
    const primary = 'primary' as const;

    switch (context) {
        case 'home':
            return [
                { href: '/software', label: 'Software', variant: primary },
                { href: '/licencias', label: 'Licencias', variant: outline },
                { href: '/servicios', label: 'Servicios', variant: outline },
            ];
        case 'software':
            return [
                { href: '/contacto', label: 'Contacto', variant: primary },
                { href: '/licencias', label: 'Licencias', variant: outline },
                { href: '/servicios', label: 'Servicios', variant: outline },
            ];
        case 'licencias':
            return [
                { href: '/software', label: 'Software', variant: primary },
                { href: '/contacto', label: 'Contacto', variant: outline },
                { href: '/servicios', label: 'Servicios', variant: outline },
            ];
        case 'servicios':
            return [
                { href: '/software', label: 'Software', variant: primary },
                { href: '/contacto', label: 'Contacto', variant: outline },
                { href: '/licencias', label: 'Licencias', variant: outline },
            ];
        case 'contacto':
            return [
                { href: '/software', label: 'Software', variant: primary },
                { href: '/licencias', label: 'Licencias', variant: outline },
                { href: '/servicios', label: 'Servicios', variant: outline },
            ];
    }
}
