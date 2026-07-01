import { useMemo } from 'react';

import GeometricBackground from '@/components/welcome/GeometricBackground';
import SoftwareDetailSection from '@/components/software/SoftwareDetailSection';
import ScrollReveal from '@/components/welcome/ScrollReveal';

export type VetSaaSShowcaseClient = {
    slug: string;
    name: string;
    logo_url: string;
    plan: string | null;
    website_url: string | null;
};

type Props = {
    clients: VetSaaSShowcaseClient[];
};

export default function VetSaaSClientsCarousel({ clients }: Props) {
    const duplicated = useMemo(() => {
        if (clients.length === 0) {
            return [];
        }

        return [...clients, ...clients];
    }, [clients]);

    if (clients.length === 0) {
        return null;
    }

    return (
        <ScrollReveal direction="up">
            <SoftwareDetailSection
                id="clinicas-clientes"
                eyebrow="Clientes"
                title="Clínicas que ya operan con VetSaaS"
                description="Solo mostramos clínicas con plan de pago activo y logo propio configurado en su cuenta."
            >
                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-[color-mix(in_oklab,var(--background)_75%,var(--card))] p-1 shadow-[0_20px_50px_-20px_var(--hero-glow-soft)] ring-1 ring-border/40">
                    <GeometricBackground variant="grid-dots" opacity={0.04} />
                    <div
                        className="landing-carousel-glow pointer-events-none absolute inset-0 bg-gradient-to-b from-[color-mix(in_oklab,var(--primary)_12%,transparent)] to-transparent opacity-80"
                        aria-hidden
                    />
                    <div className="carousel-wrapper group/carousel relative overflow-hidden rounded-[1.35rem] bg-background/40 py-3">
                        <div
                            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent md:w-24"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent md:w-24"
                            aria-hidden
                        />

                        <div
                            className="carousel-track flex w-max animate-marquee gap-10 px-8 [--duration:45s]"
                            style={{ animationDuration: 'var(--duration, 45s)' }}
                        >
                            {duplicated.map((client, index) => {
                                const href = client.website_url?.trim() || null;
                                const card = (
                                    <div className="group/item flex min-w-[9rem] shrink-0 items-center gap-3 rounded-2xl border border-border/70 bg-card/60 px-5 py-4 opacity-90 transition-all duration-300 hover:border-[color-mix(in_oklab,var(--primary)_40%,var(--border))] hover:bg-card hover:opacity-100 md:min-w-[11rem] md:px-6">
                                        <img
                                            src={client.logo_url}
                                            alt={client.name}
                                            className="size-12 shrink-0 rounded-full border border-border/60 bg-background object-contain p-1 md:size-14"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate font-display text-sm font-semibold text-foreground">
                                                {client.name}
                                            </p>
                                            {client.plan ? (
                                                <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
                                                    Plan {client.plan}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                );

                                if (href) {
                                    return (
                                        <a
                                            key={`${client.slug}-${index}`}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block shrink-0 no-underline"
                                            title={`Abrir ${client.name}`}
                                        >
                                            {card}
                                        </a>
                                    );
                                }

                                return (
                                    <div key={`${client.slug}-${index}`} className="shrink-0">
                                        {card}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </SoftwareDetailSection>
        </ScrollReveal>
    );
}
