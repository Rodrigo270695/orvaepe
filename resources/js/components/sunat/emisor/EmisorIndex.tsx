import { Building2, ShieldCheck } from 'lucide-react';
import * as React from 'react';

import EmisorSingletonForm from '@/components/sunat/emisor/EmisorSingletonForm';
import EmisorTabStrip from '@/components/sunat/emisor/EmisorTabStrip';
import EmisorCertificatesPanel from '@/components/sunat/emisor/tabs/EmisorCertificatesPanel';
import EmisorEmitterSettingsPanel from '@/components/sunat/emisor/tabs/EmisorEmitterSettingsPanel';
import EmisorInvoiceSequencesPanel from '@/components/sunat/emisor/tabs/EmisorInvoiceSequencesPanel';
import type {
    CompanyLegalProfileLoaded,
    EmisorTabId,
} from '@/components/sunat/emisor/types';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

export type {
    CompanyLegalProfile,
    CompanyLegalProfileLoaded,
    FormErrors,
} from '@/components/sunat/emisor/types';

type Props = {
    profile: CompanyLegalProfileLoaded | null;
};

export default function EmisorIndex({ profile }: Props) {
    const [tab, setTab] = React.useState<EmisorTabId>('perfil');

    const certs = profile?.digital_certificates ?? [];
    const setting = profile?.sunat_emitter_setting ?? null;

    return (
        <div className="space-y-6">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <Building2 className="size-4 text-[#D28C3C]" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold">
                                Configuración de emisión SUNAT
                            </h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Perfil legal, certificados, integración OSE/PSE y
                                secuencias correlativas en un solo lugar.
                            </p>
                        </div>
                    </div>
                    <div className="inline-flex items-center gap-2 text-[10px] text-muted-foreground">
                        <ShieldCheck className="size-3.5 text-[#D28C3C]" />
                        Emisor único (singleton)
                    </div>
                </div>
            </NeuCardRaised>

            {/* Misma lectura que AdminCrudTable (catálogo): superficie hundida (inset) */}
            <div className="neumorph-inset overflow-x-auto rounded-xl border border-border/60 p-4 md:p-5">
                <EmisorTabStrip active={tab} onChange={setTab} />
                <div className="mt-6">
                    {tab === 'perfil' ? (
                        <EmisorSingletonForm profile={profile} />
                    ) : null}
                    {tab === 'certificados' ? (
                        <EmisorCertificatesPanel profile={profile} />
                    ) : null}
                    {tab === 'setup' ? (
                        <EmisorEmitterSettingsPanel
                            profile={profile}
                            setting={setting}
                            certificates={certs}
                        />
                    ) : null}
                    {tab === 'secuencias' ? (
                        <EmisorInvoiceSequencesPanel profile={profile} />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
