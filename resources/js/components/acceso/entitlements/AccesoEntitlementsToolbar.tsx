import { KeyRound, ShieldCheck } from 'lucide-react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    totalEntitlements: number;
    rowsCount: number;
};

export default function AccesoEntitlementsToolbar({
    totalEntitlements,
    rowsCount,
}: Props) {
    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <KeyRound className="size-4 text-[#4A80B8]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Derechos de uso</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Entitlements: qué producto puede usar cada cliente,
                            vigencia y vínculo con pedido o suscripción. Los
                            secretos técnicos se gestionan en{' '}
                            <span className="font-mono">API keys</span>.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <ShieldCheck className="size-3.5" />
                    Total {totalEntitlements}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    En pantalla {rowsCount}
                </span>
            </div>
        </NeuCardRaised>
    );
}
