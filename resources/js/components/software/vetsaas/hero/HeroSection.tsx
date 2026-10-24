import type { VetSaaSShowcaseClient } from '@/components/software/VetSaaSClientsCarousel';

import ClinicsProofBadge from './ClinicsProofBadge';
import DemoCredentials from './DemoCredentials';
import HeroStage from './HeroStage';
import HeroTitle from './HeroTitle';

type Props = {
    clinics: number;
    clients: VetSaaSShowcaseClient[];
    demoUrl: string;
    demoUser: string;
    demoPassword: string;
};

export default function HeroSection({ clinics, clients, demoUrl, demoUser, demoPassword }: Props) {
    return (
        <section className="vs-hero-section">
            <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-[8.5rem] sm:px-8 lg:min-h-dvh lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-16 lg:pt-[9.5rem]">
                <div>
                    <p className="vs-fade-up vs-chip">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3CB88A] opacity-70 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2 rounded-full bg-[#008762]" />
                        </span>
                        VetSaaS · Software veterinario con IA
                    </p>

                    <HeroTitle />

                    <p
                        className="vs-fade-up font-body mt-6 max-w-xl text-lg leading-relaxed vs-text-muted"
                        style={{ animationDelay: '0.4s' }}
                    >
                        Historia clínica, agenda, grooming, hotel, caja y SUNAT en el subdominio de tu
                        clínica. El asistente responde en WhatsApp y los recordatorios salen solos.
                    </p>

                    <div className="vs-fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.5s' }}>
                        <a href="#planes" className="font-body vs-btn-primary group">
                            Empieza gratis
                            <span aria-hidden className="transition-transform group-hover:translate-x-1">
                                →
                            </span>
                        </a>
                        <a
                            href={demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body vs-btn-secondary"
                        >
                            Probar la demo
                        </a>
                    </div>

                    <DemoCredentials url={demoUrl} user={demoUser} password={demoPassword} />

                    <ClinicsProofBadge clinics={clinics} clients={clients} />
                </div>

                <div className="vs-fade-up px-4 sm:px-8 lg:px-6" style={{ animationDelay: '0.1s' }}>
                    <HeroStage />
                </div>
            </div>
        </section>
    );
}
