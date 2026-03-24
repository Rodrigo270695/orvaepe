import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

type Layout = 'default' | 'wide' | 'sparkles';

const layoutRow: Record<Layout, string> = {
    default: 'mx-auto mb-5 max-w-xl',
    wide: 'mx-auto mb-6 max-w-2xl',
    sparkles: 'mx-auto mb-4 max-w-lg',
};

type Props = {
    eyebrow: string;
    title: string;
    description?: string;
    /** Líneas + texto central, o iconos sparkles (clientes) */
    variant?: 'lines' | 'sparkles';
    /** Ancho del bloque superior y espaciado */
    layout?: Layout;
    /** Título principal: “hero” incluye tamaño grande en lg (solo ofertas) */
    titleSize?: 'section' | 'hero';
    /** Ancho del párrafo (p. ej. max-w-xl en misión/testimonios) */
    descriptionClassName?: string;
    /** Sustituye clases del h2 (p. ej. carrusel más compacto) */
    titleClassName?: string;
    className?: string;
};

export default function LandingSectionHeader({
    eyebrow,
    title,
    description,
    variant = 'lines',
    layout = 'default',
    titleSize = 'section',
    descriptionClassName,
    titleClassName,
    className,
}: Props) {
    const isSparkles = variant === 'sparkles';

    return (
        <header className={cn('text-center', className)}>
            {isSparkles ? (
                <div
                    className={cn(
                        'flex items-center justify-center gap-2',
                        layoutRow[layout],
                    )}
                >
                    <Sparkles
                        className="size-4 shrink-0 text-[var(--o-amber)] dark:text-[color-mix(in_oklab,var(--o-tech2)_90%,var(--o-amber))]"
                        aria-hidden
                    />
                    <p className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.4em] text-[var(--o-amber)] dark:text-[color-mix(in_oklab,var(--o-tech2)_88%,var(--o-amber))]">
                        {eyebrow}
                    </p>
                    <Sparkles
                        className="size-4 shrink-0 text-[var(--o-amber)] dark:text-[color-mix(in_oklab,var(--o-tech2)_90%,var(--o-amber))]"
                        aria-hidden
                    />
                </div>
            ) : (
                <div
                    className={cn(
                        'flex items-center justify-center gap-3',
                        layoutRow[layout],
                    )}
                >
                    <span className="h-px flex-1 max-w-[4rem] bg-gradient-to-r from-transparent to-[color-mix(in_oklab,var(--o-amber)_52%,transparent)] dark:to-[color-mix(in_oklab,var(--o-tech)_38%,transparent)]" />
                    <p className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.4em] text-[var(--o-amber)] dark:text-[color-mix(in_oklab,var(--o-tech2)_85%,var(--o-amber))]">
                        {eyebrow}
                    </p>
                    <span className="h-px flex-1 max-w-[4rem] bg-gradient-to-l from-transparent to-[color-mix(in_oklab,var(--o-amber)_52%,transparent)] dark:to-[color-mix(in_oklab,var(--o-tech)_38%,transparent)]" />
                </div>
            )}
            <h2
                className={cn(
                    'font-display font-bold tracking-tight text-foreground',
                    titleClassName ??
                        (titleSize === 'hero'
                            ? 'text-3xl md:text-4xl lg:text-[2.75rem]'
                            : 'text-3xl md:text-4xl'),
                )}
            >
                {title}
            </h2>
            {description ? (
                <p
                    className={cn(
                        'mx-auto mt-4 font-body text-muted-foreground',
                        descriptionClassName ?? 'max-w-2xl',
                    )}
                >
                    {description}
                </p>
            ) : null}
        </header>
    );
}
