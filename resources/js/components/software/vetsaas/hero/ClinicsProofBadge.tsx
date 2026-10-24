import type { VetSaaSShowcaseClient } from '@/components/software/VetSaaSClientsCarousel';

import ClientLogo from '../ClientLogo';
import CountUp from '../CountUp';

type Props = {
    clinics: number;
    clients: VetSaaSShowcaseClient[];
};

export default function ClinicsProofBadge({ clinics, clients }: Props) {
    return (
        <div
            className="vs-fade-up vs-proof-badge mt-10 inline-flex flex-wrap items-center gap-5 py-4 pl-4 pr-6"
            style={{ animationDelay: '0.6s' }}
        >
            {clients.length > 0 ? (
                <div className="flex">
                    {clients.slice(0, 5).map((client, index) => (
                        <ClientLogo
                            key={client.slug}
                            name={client.name}
                            src={client.logo_url}
                            eager
                            className={[
                                'vs-logo-ring size-12 rounded-full border-2 p-1 text-sm shadow-sm ring-1',
                                index > 0 ? '-ml-3' : '',
                            ].join(' ')}
                        />
                    ))}
                </div>
            ) : null}
            <div>
                <p className="font-display text-4xl font-semibold leading-none tracking-tight vs-text-accent-strong sm:text-5xl">
                    <CountUp to={clinics} />+
                </p>
                <p className="font-body mt-1 text-sm font-medium vs-text-muted">
                    veterinarias operan con nosotros
                </p>
            </div>
        </div>
    );
}
