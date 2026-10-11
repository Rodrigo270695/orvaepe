import type { VetSaaSShowcaseClient } from '@/components/software/VetSaaSClientsCarousel';

import ClinicsProofBadge from './ClinicsProofBadge';
import HeroStage from './HeroStage';
import HeroTitle from './HeroTitle';

type Props = {
    clinics: number;
    clients: VetSaaSShowcaseClient[];
};

export default function HeroSection({ clinics, clients }: Props) {
    return (
        <section className="relative overflow-hidden bg-[#E7F6EF] text-[#06241C]">
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(60rem 40rem at 0% 0%, rgba(255,255,255,0.85), transparent 60%), radial-gradient(40rem 30rem at 100% 100%, rgba(51,160,123,0.22), transparent 60%)',
                }}
                aria-hidden
            />
            <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
                <div>
                    <p className="vs-fade-up inline-flex items-center gap-2 rounded-full border border-[#99D2BC] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#015743] shadow-sm">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3CB88A] opacity-70 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2 rounded-full bg-[#008762]" />
                        </span>
                        VetSaaS · Software veterinario con IA
                    </p>

                    <HeroTitle />

                    <p
                        className="vs-fade-up font-body mt-6 max-w-xl text-lg leading-relaxed text-[#1F6B52]"
                        style={{ animationDelay: '0.9s' }}
                    >
                        Historia clínica, agenda, grooming, hotel, caja y SUNAT en el subdominio de tu
                        clínica. El asistente responde en WhatsApp y los recordatorios salen solos.
                    </p>

                    <div className="vs-fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '1.05s' }}>
                        <a
                            href="#planes"
                            className="font-body group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#015743] bg-[#006D55] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_-14px_rgba(0,109,85,0.9)] transition-all hover:-translate-y-0.5 hover:bg-[#015743] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D55] focus-visible:ring-offset-2 active:translate-y-px"
                        >
                            Empieza gratis
                            <span aria-hidden className="transition-transform group-hover:translate-x-1">
                                →
                            </span>
                        </a>
                        <a
                            href="#comparar"
                            className="font-body inline-flex cursor-pointer rounded-xl border border-[#006D55] bg-white px-6 py-3.5 text-sm font-semibold text-[#006D55] transition-colors hover:bg-[#F3FBF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D55]"
                        >
                            Comparar planes
                        </a>
                    </div>

                    <ClinicsProofBadge clinics={clinics} clients={clients} />
                </div>

                <div className="vs-fade-up px-4 sm:px-8 lg:px-6" style={{ animationDelay: '0.3s' }}>
                    <HeroStage />
                </div>
            </div>
        </section>
    );
}
