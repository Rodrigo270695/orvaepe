import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

/** Enlace dentro de un menú desplegable del sidebar */
export type NavSubItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
};

/** Grupo colapsable (ej. Catálogo, Ventas). `id` único para acordeón y URL activa */
export type NavCollapsibleGroup = {
    id: string;
    title: string;
    icon: LucideIcon;
    items: NavSubItem[];
};
