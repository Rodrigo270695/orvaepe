import VetSaaSClientsCarousel, { type VetSaaSShowcaseClient } from '@/components/software/VetSaaSClientsCarousel';
import VetSaaSReveal from '@/components/software/VetSaaSReveal';

type Props = {
    clinics: number;
    clients: VetSaaSShowcaseClient[];
};

export default function ClientsSection({ clinics, clients }: Props) {
    if (clients.length === 0) return null;

    return (
        <section className="bg-[#F3FBF7] pt-14">
            <VetSaaSReveal>
                <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
                    <h2 className="font-display text-3xl font-semibold tracking-tight text-[#06241C] sm:text-5xl">
                        Más de <span className="text-[#006D55]">{clinics}</span> veterinarias operan con nosotros
                    </h2>
                    <p className="font-body mx-auto mt-3 max-w-xl text-base text-[#1F6B52]">
                        Cada una con su subdominio, su logo y su marca. Del Perú para las clínicas del Perú.
                    </p>
                </div>
            </VetSaaSReveal>
            <div className="mt-10">
                <VetSaaSClientsCarousel clients={clients} compact />
            </div>
        </section>
    );
}
