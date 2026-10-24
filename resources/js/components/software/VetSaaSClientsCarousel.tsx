import { useMemo } from 'react';

import SoftwareDetailSection from '@/components/software/SoftwareDetailSection';
import ClientLogo from '@/components/software/vetsaas/ClientLogo';
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
        <div className="vs-marquee-strip relative overflow-hidden">
            <div className="carousel-wrapper group/carousel relative overflow-hidden py-6 md:py-8">
                <div
                    className="vs-fade-edge-l pointer-events-none absolute left-0 top-0 z-10 h-full w-16 md:w-28"
                    aria-hidden
                />
                <div
                    className="vs-fade-edge-r pointer-events-none absolute right-0 top-0 z-10 h-full w-16 md:w-28"
                    aria-hidden
                />

                <div className="carousel-track flex w-max animate-marquee gap-5 px-8 [--duration:42s]">
                    {duplicated.map((client, index) => (
                        <div
                            key={`${client.slug}-${index}`}
                            aria-hidden={index >= clients.length || undefined}
                            className="vs-card flex min-w-[16rem] shrink-0 items-center gap-4 px-5 py-4"
                        >
                            <ClientLogo
                                name={client.name}
                                src={client.logo_url}
                                className="vs-logo-ring size-16 shrink-0 rounded-full border p-1.5 text-lg md:size-20"
                            />
                            <p className="min-w-0 font-display text-base font-semibold leading-snug vs-text-ink md:text-lg">
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
