'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useMemo, useRef, useState } from 'react';

import PortfolioClientCard from '@/components/portfolio/PortfolioClientCard';
import HomeSection from '@/components/welcome/HomeSection';
import LandingSectionHeader from '@/components/welcome/LandingSectionHeader';
import type { ShowcaseClientPublic } from '@/types/showcase-client';

import './portfolio-orvae.css';

const semanticCycle = ['#2563eb', '#0d9488', '#ea580c', '#7c3aed'] as const;

type Props = {
    clients: ShowcaseClientPublic[];
};

export default function PortfolioClientsShowcase({ clients }: Props) {
    const [activeSector, setActiveSector] = useState<string>('todos');
    const gridRef = useRef<HTMLDivElement>(null);

    const sectors = useMemo(() => {
        return [
            ...new Set(
                clients
                    .map((c) => c.sector?.trim())
                    .filter((s): s is string => Boolean(s)),
            ),
        ];
    }, [clients]);

    const visible = useMemo(() => {
        if (activeSector === 'todos') {
            return clients;
        }
        return clients.filter((c) => (c.sector?.trim() ?? '') === activeSector);
    }, [activeSector, clients]);

    const pills = useMemo(
        () => [
            { slug: 'todos', title: 'Todos' },
            ...sectors.map((s) => ({
                slug: s,
                title: s.charAt(0).toUpperCase() + s.slice(1),
            })),
        ],
        [sectors],
    );

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const items = gridRef.current?.querySelectorAll('[data-portfolio-card]');
                if (!items?.length) return;
                gsap.from(items, {
                    opacity: 0,
                    y: 14,
                    duration: 0.35,
                    stagger: { each: 0.04, from: 'start' },
                    ease: 'power2.out',
                    clearProps: 'transform',
                });
            });
            return () => mm.revert();
        },
        { scope: gridRef, dependencies: [activeSector, visible.length] },
    );

    return (
        <HomeSection id="clientes" aria-label="Empresas que operan con ORVAE">
            <LandingSectionHeader
                className="mb-8 md:mb-10"
                eyebrow="Confían en nosotros"
                title="Empresas que operan con ORVAE"
                description="Sitios y plataformas en vivo. Filtra por rubro y abre cada empresa."
                layout="wide"
                titleSize="hero"
                titleClassName="font-display text-2xl font-bold tracking-tight md:text-4xl"
                descriptionClassName="mt-3 max-w-lg text-sm font-body"
            />

            {pills.length > 1 ? (
                <div
                    className="sticky top-[4.75rem] z-20 mb-8 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/80 p-2 backdrop-blur-xl"
                    role="group"
                    aria-label="Filtrar empresas por rubro"
                >
                    {pills.map((pill) => {
                        const selected = activeSector === pill.slug;
                        return (
                            <button
                                key={pill.slug}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setActiveSector(pill.slug)}
                                className={['pf-filter', selected && 'is-on'].filter(Boolean).join(' ')}
                            >
                                {pill.title}
                            </button>
                        );
                    })}
                </div>
            ) : null}

            <div ref={gridRef}>
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
        </HomeSection>
    );
}
