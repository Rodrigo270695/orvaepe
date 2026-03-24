'use client';

import { Building2 } from 'lucide-react';

import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

/**
 * Logos de clientes. Sustituye "name" por el nombre y opcionalmente "logo" por URL de imagen.
 * Si no hay logo, se muestra un placeholder con iniciales.
 */
const clients = [
    { name: 'Empresa A', logo: null },
    { name: 'Empresa B', logo: null },
    { name: 'Empresa C', logo: null },
    { name: 'Empresa D', logo: null },
    { name: 'Empresa E', logo: null },
    { name: 'Empresa F', logo: null },
    { name: 'Empresa G', logo: null },
    { name: 'Empresa H', logo: null },
];

/** Duplicamos para scroll infinito */
const duplicated = [...clients, ...clients];

const sectors = ['Retail', 'Logística', 'Industria', 'Servicios'];
const semanticCycle = [
    'var(--state-info)',
    'var(--state-success)',
    'var(--state-alert)',
    'var(--state-danger)',
] as const;

export default function ClientsCarousel() {
    return (
        <section
            id="clientes"
            className="relative scroll-mt-28 border-t border-border bg-[color-mix(in_oklab,var(--landing-surface-2)_90%,var(--background))] py-16 backdrop-blur-[1px] md:py-24 dark:bg-[color-mix(in_oklab,var(--landing-surface-2)_82%,var(--background))]"
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--o-amber)_35%,transparent)] to-transparent"
                aria-hidden
            />
            <GeometricBackground variant="diagonal-lines" opacity={0.05} />
            <GeometricBackground variant="grid-dots" opacity={0.04} />

            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="mb-10 text-center md:mb-12">
                    <LandingSectionHeader
                        eyebrow="Confían en nosotros"
                        title="Empresas que operan con ORVAE"
                        description="Retail, logística, industria y más — implementación y soporte cercanos."
                        variant="sparkles"
                        layout="sparkles"
                        titleClassName="font-display text-2xl font-bold tracking-tight md:text-3xl"
                        descriptionClassName="mt-3 max-w-lg text-sm font-body"
                    />
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        {sectors.map((s, index) => {
                            const accent = semanticCycle[index % semanticCycle.length];
                            return (
                                <span
                                    key={s}
                                    className="rounded-full border border-border/80 bg-background/60 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm dark:bg-[color-mix(in_oklab,var(--card)_75%,transparent)]"
                                    style={{
                                        borderColor: `color-mix(in oklab, ${accent} 40%, var(--border))`,
                                        color: `color-mix(in oklab, ${accent} 75%, var(--foreground))`,
                                    }}
                                >
                                    {s}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-[color-mix(in_oklab,var(--background)_75%,var(--card))] p-1 shadow-[0_20px_50px_-20px_var(--hero-glow-soft)] ring-1 ring-border/40 dark:bg-[color-mix(in_oklab,var(--card)_55%,var(--o-void)_45%)]">
                    <div
                        className="landing-carousel-glow pointer-events-none absolute inset-0 bg-gradient-to-b from-[color-mix(in_oklab,var(--o-amber)_12%,transparent)] to-transparent opacity-80"
                        aria-hidden
                    />
                    <div className="carousel-wrapper group/carousel relative overflow-hidden rounded-[1.35rem] bg-background/40 py-2 dark:bg-[color-mix(in_oklab,var(--background)_40%,transparent)]">
                        {/* Gradientes laterales */}
                        <div
                            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent md:w-24"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent md:w-24"
                            aria-hidden
                        />

                        <div
                            className="carousel-track flex w-max animate-marquee gap-12 px-8 [--duration:40s]"
                            style={{ animationDuration: 'var(--duration, 40s)' }}
                        >
                            {duplicated.map((client, i) => (
                                <div
                                    key={`${client.name}-${i}`}
                                    className="group/item flex min-w-[7rem] shrink-0 cursor-default items-center gap-2 rounded-xl border border-border bg-card/50 px-5 py-5 opacity-80 grayscale transition-all duration-300 hover:min-w-[12rem] hover:border-[var(--o-amber)]/40 hover:bg-card hover:opacity-100 hover:grayscale-0 hover:px-6 md:py-6 md:hover:min-w-[14rem]"
                                >
                                    {client.logo ? (
                                        <>
                                            <img
                                                src={client.logo}
                                                alt={client.name}
                                                className="h-8 w-auto max-w-[120px] shrink-0 object-contain md:h-10"
                                            />
                                            <span className="min-w-0 max-w-0 shrink overflow-hidden whitespace-nowrap font-display text-sm font-semibold text-foreground transition-[max-width] duration-300 group-hover/item:max-w-[8rem]">
                                                {client.name}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Building2
                                                className="size-8 shrink-0 text-muted-foreground transition-colors duration-300 group-hover/item:text-[var(--o-amber)] md:size-10"
                                                strokeWidth={1}
                                            />
                                            <span className="min-w-[1.25rem] shrink-0 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground transition-opacity duration-300 group-hover/item:opacity-0 md:text-base">
                                                {client.name.split(' ').pop()}
                                            </span>
                                            <span className="min-w-0 max-w-0 shrink overflow-hidden whitespace-nowrap font-display text-sm font-semibold text-foreground opacity-0 transition-[max-width,opacity] duration-300 group-hover/item:max-w-[7rem] group-hover/item:opacity-100">
                                                {client.name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
