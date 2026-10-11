import { useMemo } from 'react';

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
        <div className="relative overflow-hidden border-y border-[#99D2BC] bg-[#F3FBF7]">
            <div className="carousel-wrapper group/carousel relative overflow-hidden py-6 md:py-8">
                <div
                    className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#F3FBF7] to-transparent md:w-28"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#F3FBF7] to-transparent md:w-28"
                    aria-hidden
                />

                <div className="carousel-track flex w-max animate-marquee gap-5 px-8 [--duration:42s]">
                    {duplicated.map((client, index) => (
                        <div
                            key={`${client.slug}-${index}`}
                            className="flex min-w-[16rem] shrink-0 items-center gap-4 border border-[#99D2BC] bg-white px-5 py-4 shadow-[0_12px_30px_-18px_rgba(0,109,85,0.55)]"
                        >
                            <img
                                src={client.logo_url}
                                alt={client.name}
                                className="size-16 shrink-0 rounded-full border border-[#99D2BC] bg-[#F3FBF7] object-contain p-1.5 md:size-20"
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
                title="Veterinarias que operan con nosotros"
                description="Cada una con su subdominio y su marca."
            >
                <Marquee clients={clients} />
            </SoftwareDetailSection>
        </ScrollReveal>
    );
}
