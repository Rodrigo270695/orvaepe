'use client';

import { useMemo, useState } from 'react';

import PortfolioClientCard from '@/components/portfolio/PortfolioClientCard';
import GeometricBackground from '@/components/welcome/GeometricBackground';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';
import type { ShowcaseClientPublic } from '@/types/showcase-client';

const semanticCycle = [
    'var(--state-info)',
    'var(--state-success)',
    'var(--state-alert)',
    'var(--state-danger)',
] as const;

type Props = {
    clients: ShowcaseClientPublic[];
};

export default function PortfolioClientsShowcase({ clients }: Props) {
    const [activeSector, setActiveSector] = useState<string>('todos');

    const sectors = useMemo(() => {
        const fromData = [
            ...new Set(
                clients
                    .map((c) => c.sector?.trim())
                    .filter((s): s is string => Boolean(s)),
            ),
        ];
        return fromData;
    }, [clients]);

    const visible = useMemo(() => {
        if (activeSector === 'todos') {
            return clients;
        }
        return clients.filter(
            (c) => (c.sector?.trim() ?? '') === activeSector,
        );
    }, [activeSector, clients]);

    const pills = useMemo(
        () => [{ slug: 'todos', title: 'Todos' }, ...sectors.map((s) => ({ slug: s, title: s }))],
        [sectors],
    );

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
                        description="Tarjetas grandes: un clic abre el sitio o la plataforma en vivo."
                        variant="sparkles"
                        layout="sparkles"
                        titleClassName="font-display text-2xl font-bold tracking-tight md:text-3xl"
                        descriptionClassName="mt-3 max-w-lg text-sm font-body"
                    />

                    {pills.length > 1 ? (
                        <div
                            className="mt-6 flex flex-wrap items-center justify-center gap-2"
                            role="group"
                            aria-label="Filtrar empresas por rubro"
                        >
                            {pills.map((pill, index) => {
                                const accent = semanticCycle[index % semanticCycle.length];
                                const selected = activeSector === pill.slug;
                                return (
                                    <button
                                        key={pill.slug}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setActiveSector(pill.slug)}
                                        className={[
                                            'rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-all duration-200',
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                            selected
                                                ? 'shadow-[0_8px_20px_-12px_color-mix(in_oklab,var(--foreground)_28%,transparent)]'
                                                : 'bg-background/60 text-muted-foreground backdrop-blur-sm hover:-translate-y-px dark:bg-[color-mix(in_oklab,var(--card)_75%,transparent)]',
                                        ].join(' ')}
                                        style={{
                                            borderColor: `color-mix(in oklab, ${accent} ${selected ? 55 : 40}%, var(--border))`,
                                            color: selected
                                                ? `color-mix(in oklab, ${accent} 88%, var(--foreground))`
                                                : `color-mix(in oklab, ${accent} 75%, var(--foreground))`,
                                            background: selected
                                                ? `color-mix(in oklab, ${accent} 14%, var(--background))`
                                                : undefined,
                                        }}
                                    >
                                        {pill.title}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                {clients.length === 0 ? (
                    <p className="rounded-2xl border border-border/60 bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
                        Pronto mostraremos aquí empresas que confían en ORVAE.
                    </p>
                ) : visible.length === 0 ? (
                    <p className="rounded-2xl border border-border/60 bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
                        No hay empresas en este rubro por ahora.
                    </p>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {visible.map((client, index) => (
                            <PortfolioClientCard
                                key={client.id}
                                client={client}
                                accent={semanticCycle[index % semanticCycle.length]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
