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
                <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:gap-6">
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
                                className="relative rounded-2xl border border-border bg-background/95 px-6 py-8 backdrop-blur-md md:rounded-3xl md:px-10 md:py-10"
                                style={{
                                    boxShadow: `0 4px 24px var(--hero-shadow), 0 0 0 1px var(--hero-card-inset) inset, 0 24px 48px -24px var(--hero-glow-soft)`,
                                }}
                            >
                                {/* Acento vertical tipo cursor/IDE (con gradiente y glow) */}
                                <div
                                    className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full opacity-90 md:top-8 md:bottom-8"
                                    style={{
                                        background: 'linear-gradient(to bottom, transparent, var(--o-amber) 20%, var(--o-amber2) 50%, var(--o-amber) 80%, transparent)',
                                        boxShadow: '0 0 12px var(--o-amber)',
                                    }}
                                    aria-hidden
                                />

                                <div className="pl-4 md:pl-5">
                                    {eyebrow && (
                                        <div className="inline-flex items-center gap-3 rounded-full border border-[color-mix(in_oklab,var(--o-amber)_22%,var(--border))] bg-[color-mix(in_oklab,var(--o-amber)_08%,var(--background))] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.4em] text-[var(--o-amber)]">
                                            <AppLogoIcon className="size-4 fill-[var(--o-amber)]" />
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

                                    {ctas.length > 0 && (
                                        <div className="mt-8 flex flex-wrap gap-3">
                                            {ctas.map((cta) => (
                                                <a
                                                    key={cta.href + cta.label}
                                                    href={cta.href}
                                                    className={
                                                        cta.variant === 'outline'
                                                            ? 'inline-flex items-center justify-center rounded-xl border-2 border-border bg-background/90 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-accent/10'
                                                            : 'inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_20px_var(--o-glow)] transition-all hover:opacity-95 dark:shadow-[0_4px_24px_var(--hero-glow-mid)]'
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

                    {/* Toda la franja horizontal derecha: “Desarrollado con” + carrusel */}
                    {!backgroundImage && (
                        <div className="hidden min-w-0 flex-1 lg:block animate-in fade-in slide-in-from-right-4 duration-700 delay-150 fill-mode-both">
                            <HeroTechLogosCarousel />
                        </div>
                    )}
                </div>

                {/* Terminal debajo del grid (solo sin imagen) */}
                {!backgroundImage && (
                    <div className="mt-10 hidden max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both lg:block">
                        <div
                            className="rounded-2xl border border-border bg-card/80 p-5 font-mono text-sm shadow-lg"
                            style={{
                                boxShadow: '0 8px 32px var(--hero-shadow), 0 0 0 1px var(--hero-card-inset) inset',
                            }}
                        >
                            <div className="flex gap-2 pb-3">
                                <span className="size-3 rounded-full bg-[var(--o-amber)]/40" />
                                <span className="size-3 rounded-full bg-[var(--o-amber)]/25" />
                                <span className="size-3 rounded-full bg-[var(--o-amber)]/25" />
                            </div>
                            <pre className="overflow-x-auto text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                                <code>
                                    <span className="text-[var(--o-amber)]/80">$</span> orvae init
                                    {'\n'}
                                    <span className="text-[var(--o-amber)]/80">{'→'}</span> Checking
                                    catalog...
                                    {'\n'}
                                    <span className="text-[var(--o-success)]">✓</span> Ready to
                                    operate
                                </code>
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
