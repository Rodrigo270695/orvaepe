import { useMemo } from 'react';

import GeometricBackground from '@/components/welcome/GeometricBackground';
import SoftwareDetailSection from '@/components/software/SoftwareDetailSection';
import ScrollReveal from '@/components/welcome/ScrollReveal';

export type VetSaaSShowcaseClient = {
    slug: string;
    name: string;
    logo_url: string;
};

type Props = {
    clients: VetSaaSShowcaseClient[];
    /** Solo el marquee, sin títulos duplicados (landing VetSaaS). */
    compact?: boolean;
};

function Marquee({ clients }: { clients: VetSaaSShowcaseClient[] }) {
    const duplicated = useMemo(() => {
        if (clients.length === 0) {
            return [];
        }

        return [...clients, ...clients];
    }, [clients]);

    return (
        <div className="relative overflow-hidden rounded-3xl border border-[#C5E5D9]/50 bg-[color-mix(in_oklab,var(--background)_75%,var(--card))] p-1 shadow-[0_20px_50px_-20px_rgba(0,109,85,0.18)] ring-1 ring-[#99D2BC]/25 dark:border-white/10 dark:ring-white/10">
            <GeometricBackground variant="grid-dots" opacity={0.04} />
            <div
                className="landing-carousel-glow pointer-events-none absolute inset-0 bg-gradient-to-b from-[color-mix(in_oklab,#006D55_12%,transparent)] to-transparent opacity-80"
                aria-hidden
            />
            <div className="carousel-wrapper group/carousel relative overflow-hidden rounded-[1.35rem] bg-background/40 py-5 md:py-6">
                <div
                    className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent md:w-24"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent md:w-24"
                    aria-hidden
                />

                <div
                    className="carousel-track flex w-max animate-marquee gap-12 px-10 [--duration:50s] md:gap-14"
                    style={{ animationDuration: 'var(--duration, 50s)' }}
                >
                    {duplicated.map((client, index) => (
                        <div
                            key={`${client.slug}-${index}`}
                            className="flex min-w-[12rem] shrink-0 items-center gap-4 rounded-2xl border border-[#C5E5D9]/60 bg-card/70 px-6 py-5 md:min-w-[15rem] md:gap-5 md:px-8 md:py-6 dark:border-white/10"
                        >
                            <img
                                src={client.logo_url}
                                alt={client.name}
                                className="size-16 shrink-0 rounded-full border border-border/60 bg-background object-contain p-1.5 md:size-20"
                                loading="lazy"
                                decoding="async"
                            />
                            <p className="min-w-0 font-display text-base font-semibold leading-snug text-foreground md:text-lg">
                                {client.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function VetSaaSClientsCarousel({ clients, compact = false }: Props) {
    if (clients.length === 0) {
        return null;
    }

    if (compact) {
        return <Marquee clients={clients} />;
    }

    return (
        <ScrollReveal direction="up">
            <SoftwareDetailSection
                id="clinicas-clientes"
                eyebrow="Clientes"
                title="Clínicas que ya operan con VetSaaS"
                description="Clínicas veterinarias que confían en VetSaaS para su operación diaria."
            >
                <Marquee clients={clients} />
            </SoftwareDetailSection>
        </ScrollReveal>
    );
}
