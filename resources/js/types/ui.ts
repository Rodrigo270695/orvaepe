import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
    /**
     * Clase Tailwind para controlar el ancho máximo de la card de auth.
     * Ejemplo: 'max-w-[400px]' (por defecto), 'max-w-[480px]' para formularios más anchos.
     */
    maxWidthClass?: string;
};
