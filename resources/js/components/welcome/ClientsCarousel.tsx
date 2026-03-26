'use client';

import { useMemo } from 'react';

import { Building2 } from 'lucide-react';

import type { ShowcaseClientPublic } from '@/types/showcase-client';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';

const defaultSectors = ['Retail', 'Logística', 'Industria', 'Servicios'] as const;

const semanticCycle = [
    'var(--state-info)',
    'var(--state-success)',
    'var(--state-alert)',
    'var(--state-danger)',
] as const;

function websiteHref(raw: string | null | undefined): string | null {
    const t = raw?.trim();
    if (!t) {
        return null;
    }
    if (t.startsWith('http://') || t.startsWith('https://')) {
        return t;
    }
    return `https://${t}`;
}

type Props = {
    clients: ShowcaseClientPublic[];
};

export default function ClientsCarousel({ clients }: Props) {
    const duplicated = useMemo(() => {
        if (clients.length === 0) {
            return [];
        }
        return [...clients, ...clients];
    }, [clients]);

    const sectorPills = useMemo(() => {
        const fromData = [
            ...new Set(
                clients
                    .map((c) => c.sector?.trim())
                    .filter((s): s is string => Boolean(s)),
            ),
        ];
        return fromData.length > 0 ? fromData : [...defaultSectors];
    }, [clients]);

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
                        {sectorPills.map((s, index) => {
                            const accent =
                                semanticCycle[index % semanticCycle.length];
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
                {clients.length === 0 ? (
                    <p className="rounded-2xl border border-border/60 bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
                        Pronto mostraremos aquí empresas que confían en ORVAE.
                    </p>
                ) : (
                    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-[color-mix(in_oklab,var(--background)_75%,var(--card))] p-1 shadow-[0_20px_50px_-20px_var(--hero-glow-soft)] ring-1 ring-border/40 dark:bg-[color-mix(in_oklab,var(--card)_55%,var(--o-void)_45%)]">
                        <div
                            className="landing-carousel-glow pointer-events-none absolute inset-0 bg-gradient-to-b from-[color-mix(in_oklab,var(--o-amber)_12%,transparent)] to-transparent opacity-80"
                            aria-hidden
                        />
                        <div className="carousel-wrapper group/carousel relative overflow-hidden rounded-[1.35rem] bg-background/40 py-2 dark:bg-[color-mix(in_oklab,var(--background)_40%,transparent)]">
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
                                {duplicated.map((client, i) => {
                                    const href = websiteHref(client.website_url);
                                    const card = (
                                        <div className="group/item flex min-w-[7rem] shrink-0 cursor-default items-center gap-2 rounded-xl border border-border bg-card/50 px-5 py-5 opacity-80 grayscale transition-all duration-300 hover:min-w-[12rem] hover:border-[var(--o-amber)]/40 hover:bg-card hover:opacity-100 hover:grayscale-0 hover:px-6 md:py-6 md:hover:min-w-[14rem]">
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
                                                        {client.name
                                                            .split(' ')
                                                            .pop()}
                                                    </span>
                                                    <span className="min-w-0 max-w-0 shrink overflow-hidden whitespace-nowrap font-display text-sm font-semibold text-foreground opacity-0 transition-[max-width,opacity] duration-300 group-hover/item:max-w-[7rem] group-hover/item:opacity-100">
                                                        {client.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    );
                                    if (href) {
                                        return (
                                            <a
                                                key={`${client.id}-${i}`}
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block shrink-0 no-underline"
                                            >
                                                {card}
                                            </a>
                                        );
                                    }
                                    return (
                                        <div key={`${client.id}-${i}`}>
                                            {card}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
