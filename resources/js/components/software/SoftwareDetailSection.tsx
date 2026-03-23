'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Props = {
    id?: string;
    eyebrow: string;
    title: string;
    description?: string;
    children?: ReactNode;
    /** Primera sección tras el hero: sin línea superior */
    noDivider?: boolean;
    className?: string;
};

/**
 * Sección del detalle de producto: tipografía y espaciado alineados a lectura larga.
 */
export default function SoftwareDetailSection({
    id,
    eyebrow,
    title,
    description,
    children,
    noDivider = false,
    className,
}: Props) {
    return (
        <section
            id={id}
            className={cn(
                'scroll-mt-24 md:scroll-mt-28',
                !noDivider &&
                    'border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)]',
                'py-14 md:py-[5.5rem]',
                className,
            )}
        >
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <header className="max-w-3xl">
                    <p className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.28em] text-[color-mix(in_oklab,var(--primary)_88%,var(--muted-foreground))]">
                        {eyebrow}
                    </p>
                    <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-[1.65rem] font-bold leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-3xl md:text-[2rem]">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-4 max-w-2xl font-[family-name:var(--font-body)] text-[15px] leading-relaxed text-[var(--muted-foreground)] md:text-base">
                            {description}
                        </p>
                    )}
                </header>
                <div className="mt-9 md:mt-11">{children}</div>
            </div>
        </section>
    );
}
