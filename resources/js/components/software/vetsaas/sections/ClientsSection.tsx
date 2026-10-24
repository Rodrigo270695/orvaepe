import VetSaaSClientsCarousel, { type VetSaaSShowcaseClient } from '@/components/software/VetSaaSClientsCarousel';
import VetSaaSReveal from '@/components/software/VetSaaSReveal';

type Props = {
    clinics: number;
    clients: VetSaaSShowcaseClient[];
};

export default function ClientsSection({ clinics, clients }: Props) {
    if (clients.length === 0) return null;

    return (
        <section className="vs-bg-soft pt-14">
            <VetSaaSReveal>
                <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
                    <h2 className="font-display text-3xl font-semibold tracking-tight vs-text-ink sm:text-5xl">
                        Más de <span className="vs-text-accent-strong">{clinics}</span> veterinarias operan con nosotros
                    </h2>
                    <p className="font-body mx-auto mt-3 max-w-xl text-base vs-text-muted">
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
