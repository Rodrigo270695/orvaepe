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
            className="vs-fade-up mt-10 inline-flex flex-wrap items-center gap-5 rounded-2xl border border-[#99D2BC] bg-white/85 py-4 pl-4 pr-6 shadow-[0_20px_40px_-28px_rgba(0,109,85,0.6)] backdrop-blur"
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
                                'size-12 rounded-full border-2 border-white bg-[#F3FBF7] p-1 text-sm shadow-sm ring-1 ring-[#99D2BC]',
                                index > 0 ? '-ml-3' : '',
                            ].join(' ')}
                        />
                    ))}
                </div>
            ) : null}
            <div>
                <p className="font-display text-4xl font-semibold leading-none tracking-tight text-[#006D55] sm:text-5xl">
                    <CountUp to={clinics} />+
                </p>
                <p className="font-body mt-1 text-sm font-medium text-[#1F6B52]">
                    veterinarias operan con nosotros
                </p>
            </div>
        </div>
    );
}
