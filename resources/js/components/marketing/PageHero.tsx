import type { ReactNode } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import HeroTechLogosCarousel from '@/components/marketing/HeroTechLogosCarousel';
import GeometricBackground from '@/components/welcome/GeometricBackground';

export type PageHeroCTA = {
    href: string;
    label: string;
    variant?: 'primary' | 'outline';
};

type Props = {
    id?: string;
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    ctas?: PageHeroCTA[];
    /** Si se pasa, se usa como imagen de fondo; si no, solo efectos tech */
    backgroundImage?: string;
    minHeight?: string;
    children?: ReactNode;
};

/** Rejilla tipo editor / IDE (dos capas para profundidad) */
const GridTech = () => (
    <>
        <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            aria-hidden
            style={{
                backgroundImage: `linear-gradient(to right, var(--o-amber) 1px, transparent 1px), linear-gradient(to bottom, var(--o-amber) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
            }}
        />
        <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            aria-hidden
            style={{
                backgroundImage: `linear-gradient(to right, var(--o-amber) 1px, transparent 1px), linear-gradient(to bottom, var(--o-amber) 1px, transparent 1px)`,
                backgroundSize: '80px 80px',
            }}
        />
    </>
);

/** Puntos tipo mesh (estética dev) */
const DotMesh = () => (
    <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        aria-hidden
        style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--o-amber) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
        }}
    />
);

/** Orbes de gradiente (Amber Core/Amber Light, paleta logo) */
const GlowOrbs = () => (
    <>
        <div
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-30"
            style={{
                background: 'radial-gradient(circle, var(--hero-glow-strong) 0%, transparent 70%)',
                filter: 'blur(40px)',
            }}
            aria-hidden
        />
        <div
            className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full opacity-100"
            style={{
                background: 'radial-gradient(ellipse 80% 50%, var(--hero-glow-mid) 0%, transparent 70%)',
                filter: 'blur(32px)',
            }}
            aria-hidden
        />
        <div
            className="pointer-events-none absolute -left-32 top-1/3 h-64 w-64 rounded-full opacity-100"
            style={{
                background: 'radial-gradient(circle, var(--hero-glow-soft) 0%, transparent 65%)',
                filter: 'blur(36px)',
            }}
            aria-hidden
        />
    </>
);

const heroSemanticAccents = [
    'var(--state-info)',
    'var(--state-success)',
    'var(--state-alert)',
    'var(--state-danger)',
] as const;

export default function PageHero({
    id,
    eyebrow,
    title,
    description,
    ctas = [],
    backgroundImage,
    minHeight = '80vh',
    children,
}: Props) {
    return (
        <section
            id={id}
            className="relative flex min-w-0 flex-col justify-center overflow-hidden scroll-mt-28"
            style={{ minHeight }}
        >
            {/* Base: solo cuando no hay imagen */}
            {!backgroundImage && (
                <>
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(165deg, var(--background) 0%, color-mix(in oklab, var(--o-amber) 6%, var(--background)) 45%, var(--background) 100%)`,
                        }}
                        aria-hidden
                    />
                    <GeometricBackground variant="floating-shapes" opacity={0.09} />
                    <GlowOrbs />
                    <GridTech />
                    <DotMesh />
                </>
            )}

            {/* Con imagen: capas actuales (por si se usa en otras vistas) */}
            {backgroundImage && (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                        role="img"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute inset-0 bg-[color-mix(in_oklab,var(--background)_75%,transparent)]"
                        aria-hidden
                    />
                    <GridTech />
                </>
            )}

            {/* Línea horizontal (Amber, paleta logo) */}
            <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
                style={{
                    background: `linear-gradient(90deg, transparent 0%, var(--hero-line) 15%, var(--o-amber2) 50%, var(--hero-line) 85%, transparent 100%)`,
                }}
                aria-hidden
            />

            {/* Contenido */}
            <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-8">
                    <div className="max-w-2xl shrink-0">
                        {/* Bloque tipo “card” con borde tipo código + efectos */}
                        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                            {/* Brillo sutil en borde superior (efecto glass) */}
                            <div
                                className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 md:rounded-3xl"
                                style={{
                                    background: 'linear-gradient(135deg, var(--hero-card-inset) 0%, transparent 50%, transparent 100%)',
                                    filter: 'blur(0.5px)',
                                }}
                                aria-hidden
                            />

                            <div
                                className="relative rounded-2xl border border-border bg-background/95 px-6 py-8 shadow-[0_0_0_1px_color-mix(in_oklab,var(--o-amber)_18%,transparent)_inset] backdrop-blur-md md:rounded-3xl md:px-10 md:py-10"
                                style={{
                                    boxShadow: `0 4px 24px var(--hero-shadow), 0 0 0 1px var(--hero-card-inset) inset, 0 24px 48px -24px var(--hero-glow-soft), 0 0 80px -20px color-mix(in oklab, var(--o-amber) 15%, transparent)`,
                                }}
                            >
                                {/* Esquinas tipo blueprint */}
                                <div
                                    className="pointer-events-none absolute left-5 top-5 h-10 w-10 rounded-tl-xl border-l-2 border-t-2 border-[color-mix(in_oklab,var(--o-amber)_45%,transparent)] md:left-8 md:top-8"
                                    aria-hidden
                                />
                                <div
                                    className="pointer-events-none absolute right-5 bottom-5 h-10 w-10 rounded-br-xl border-b-2 border-r-2 border-[color-mix(in_oklab,var(--o-tech)_40%,transparent)] md:right-8 md:bottom-8"
                                    aria-hidden
                                />
                                {/* Acento vertical tipo cursor/IDE (con gradiente y glow) */}
                                <div
                                    className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full opacity-90 md:top-8 md:bottom-8"
                                    style={{
                                        background:
                                            'linear-gradient(to bottom, transparent, var(--state-info) 16%, var(--state-success) 38%, var(--state-alert) 62%, var(--state-danger) 84%, transparent)',
                                        boxShadow:
                                            '0 0 16px color-mix(in oklab, var(--state-info) 28%, transparent)',
                                    }}
                                    aria-hidden
                                />

                                <div className="pl-4 md:pl-5">
                                    {eyebrow && (
                                        <div
                                            className={[
                                                'inline-flex select-none items-center gap-3 rounded-full border border-dashed px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.35em]',
                                                'border-[color-mix(in_oklab,var(--foreground)_20%,var(--border))] bg-[color-mix(in_oklab,var(--muted)_55%,var(--background))] text-[var(--o-amber)]',
                                                'ring-1 ring-[color-mix(in_oklab,var(--foreground)_8%,var(--border))]',
                                                'shadow-none',
                                                'dark:border-[color-mix(in_oklab,var(--state-info)_50%,var(--border))]',
                                                'dark:bg-[color-mix(in_oklab,var(--state-info)_10%,var(--card))]',
                                                'dark:text-[color-mix(in_oklab,var(--o-cream2)_82%,var(--state-info))]',
                                                'dark:ring-[color-mix(in_oklab,var(--state-info)_22%,transparent)]',
                                            ].join(' ')}
                                        >
                                            <AppLogoIcon className="size-3.5 shrink-0 fill-[var(--o-amber)] dark:fill-[var(--state-info)]" />
                                            {eyebrow}
                                        </div>
                                    )}

                                    <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-[var(--foreground)] md:text-5xl lg:text-6xl">
                                        {title}
                                    </h1>

                                    {description && (
                                        <p className="mt-6 max-w-xl font-body text-[17px] leading-relaxed text-[var(--muted-foreground)]">
                                            {description}
                                        </p>
                                    )}

                                    {/* Chips informativos (no son controles; distintos de los CTAs) */}
                                    <ul className="mt-8 flex flex-wrap gap-2" aria-label="Ventajas destacadas">
                                        {[
                                            'SaaS u on‑prem',
                                            'Sin desarrollo a medida',
                                            'Operativo en semanas',
                                        ].map((chip, index) => (
                                            <li
                                                key={chip}
                                                className={[
                                                    'cursor-default select-none rounded-md px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider',
                                                    'border border-solid border-[color-mix(in_oklab,var(--foreground)_14%,var(--border))] bg-[color-mix(in_oklab,var(--muted)_52%,var(--background))] text-[var(--muted-foreground)]',
                                                    'ring-1 ring-inset ring-[color-mix(in_oklab,var(--foreground)_6%,var(--border))]',
                                                    'dark:border-0 dark:border-y dark:border-r dark:border-dashed dark:border-[color-mix(in_oklab,var(--border)_78%,transparent)]',
                                                    'dark:bg-[color-mix(in_oklab,var(--card)_40%,transparent)] dark:ring-0',
                                                ].join(' ')}
                                                style={{
                                                    borderLeftWidth: '3px',
                                                    borderLeftStyle: 'solid',
                                                    borderLeftColor: `color-mix(in oklab, ${heroSemanticAccents[index % heroSemanticAccents.length]} 62%, var(--border))`,
                                                }}
                                            >
                                                {chip}
                                            </li>
                                        ))}
                                    </ul>

                                    {ctas.length > 0 && (
                                        <div className="mt-8 flex flex-wrap gap-3">
                                            {ctas.map((cta) => (
                                                <a
                                                    key={cta.href + cta.label}
                                                    href={cta.href}
                                                    className={
                                                        cta.variant === 'outline'
                                                            ? [
                                                                  'inline-flex min-h-12 min-w-[10rem] flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-solid px-6 py-3.5 text-sm font-semibold',
                                                                  'border-[color-mix(in_oklab,var(--foreground)_22%,var(--border))] bg-background text-foreground',
                                                                  'shadow-[0_2px_12px_-4px_color-mix(in_oklab,var(--foreground)_18%,transparent)]',
                                                                  'transition-[transform,box-shadow,border-color,background-color] duration-200',
                                                                  'hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_55%,var(--border))] hover:bg-[color-mix(in_oklab,var(--primary)_10%,var(--background))] hover:shadow-[0_8px_28px_-8px_color-mix(in_oklab,var(--foreground)_22%,transparent)]',
                                                                  'active:translate-y-0',
                                                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                                                  'dark:border-[color-mix(in_oklab,var(--o-tech)_55%,var(--border))] dark:bg-[color-mix(in_oklab,var(--o-dark2)_88%,var(--background))]',
                                                                  'dark:hover:border-[color-mix(in_oklab,var(--state-info)_65%,var(--border))] dark:hover:bg-[color-mix(in_oklab,var(--state-info)_14%,var(--card))]',
                                                                  'sm:flex-initial sm:min-w-0',
                                                              ].join(' ')
                                                            : [
                                                                  'inline-flex min-h-12 min-w-[10rem] flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-transparent px-6 py-3.5 text-sm font-semibold',
                                                                  'bg-primary text-primary-foreground',
                                                                  'shadow-[0_6px_24px_-6px_color-mix(in_oklab,var(--primary)_45%,transparent)]',
                                                                  'transition-[transform,box-shadow,filter] duration-200',
                                                                  'hover:-translate-y-0.5 hover:brightness-[1.05] hover:shadow-[0_10px_32px_-8px_color-mix(in_oklab,var(--primary)_55%,transparent)]',
                                                                  'active:translate-y-0 active:brightness-[0.98]',
                                                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                                                  'dark:shadow-[0_8px_28px_-6px_color-mix(in_oklab,var(--state-info)_42%,transparent)] dark:hover:shadow-[0_12px_36px_-8px_color-mix(in_oklab,var(--state-info)_48%,transparent)]',
                                                                  'sm:flex-initial sm:min-w-0',
                                                              ].join(' ')
                                                    }
                                                >
                                                    {cta.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toda la franja horizontal derecha: “Desarrollamos con” + carrusel */}
                    {!backgroundImage && (
                        <div className="hidden min-w-0 flex-1 animate-in fade-in slide-in-from-right-4 duration-700 delay-150 fill-mode-both lg:block">
                            <HeroTechLogosCarousel />
                        </div>
                    )}
                </div>

                {/* Stack tech: visible en móvil/tablet (antes solo desktop en columna) */}
                {!backgroundImage && (
                    <div className="mt-2 block max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both lg:hidden">
                        <HeroTechLogosCarousel />
                    </div>
                )}

                {/* Terminal debajo del grid (solo sin imagen) */}
                {!backgroundImage && (
                    <div className="mt-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both lg:mt-10">
                        <div
                            className="overflow-hidden rounded-2xl border border-border bg-card/90 font-mono text-sm shadow-lg ring-1 ring-border/50"
                            style={{
                                boxShadow:
                                    '0 12px 40px var(--hero-shadow), 0 0 0 1px var(--hero-card-inset) inset, 0 0 40px -12px var(--hero-glow-soft)',
                            }}
                        >
                            <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-[color-mix(in_oklab,var(--muted)_65%,transparent)] px-4 py-2.5 dark:bg-[color-mix(in_oklab,var(--card)_70%,var(--o-void)_30%)]">
                                <div className="flex gap-2">
                                    <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,#e57373_85%,transparent)]" />
                                    <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,#e0b040_85%,transparent)]" />
                                    <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,var(--o-success)_75%,transparent)]" />
                                </div>
                                <span className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    orvae-cli — init
                                </span>
                                <span className="w-10 shrink-0" aria-hidden />
                            </div>
                            <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                                <code>
                                    <span style={{ color: 'var(--state-alert)' }}>$</span> orvae init
                                    {'\n'}
                                    <span style={{ color: 'var(--state-info)' }}>{'→'}</span> Verificando
                                    catálogo...
                                    {'\n'}
                                    <span className="text-[var(--o-success)]">✓</span> Listo para
                                    operar
                                </code>
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
