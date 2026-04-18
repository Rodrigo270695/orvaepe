'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export default function SoftwareDetailGlassCard({
    children,
    className = '',
    stepIndex,
}: {
    children: ReactNode;
    className?: string;
    /** Si se define, muestra un índice de paso accesible (flujo “cómo funciona”). */
    stepIndex?: number;
}) {
    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-background/60 p-5',
                'transition-all duration-300 hover:-translate-y-0.5 hover:bg-background/75',
                'hover:border-[color-mix(in_oklab,var(--state-info)_32%,var(--border))]',
                'hover:shadow-[0_12px_40px_-12px_color-mix(in_oklab,var(--foreground)_18%,transparent)]',
                stepIndex !== undefined && 'pl-4 md:pl-5',
                className,
            )}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'radial-gradient(ellipse at 12% 0%, color-mix(in oklab, var(--state-info) 14%, transparent) 0%, transparent 58%)',
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -inset-px opacity-[0.12] blur-xl transition-opacity duration-300 group-hover:opacity-[0.2]"
                style={{
                    background:
                        'conic-gradient(from 200deg at 50% 40%, color-mix(in oklab, var(--state-alert) 24%, transparent), transparent 32%, color-mix(in oklab, var(--state-info) 14%, transparent), transparent 68%)',
                }}
                aria-hidden
            />
            <div className="relative flex gap-4">
                {stepIndex !== undefined && (
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--state-alert)_35%,var(--border))] bg-[color-mix(in_oklab,var(--state-alert)_10%,transparent)] font-[family-name:var(--font-mono)] text-base font-bold text-[var(--state-alert)]"
                        aria-hidden
                    >
                        {stepIndex}
                    </div>
                )}
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    );
}

