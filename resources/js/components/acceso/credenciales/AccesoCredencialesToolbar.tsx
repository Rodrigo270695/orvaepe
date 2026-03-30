import { KeyRound, Lock, Plus } from 'lucide-react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    totalSecrets: number;
    rowsCount: number;
    onRegisterClick: () => void;
};

export default function AccesoCredencialesToolbar({
    totalSecrets,
    rowsCount,
    onRegisterClick,
}: Props) {
    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                            <KeyRound className="size-4 text-[#D28C3C]" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold">Credenciales y API keys</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Registros en{' '}
                                <span className="font-mono">entitlement_secrets</span>{' '}
                                vinculados a un entitlement. El valor del secreto no
                                se expone en pantalla.
                            </p>
                        </div>
                    </div>
                    <NeuButtonRaised
                        type="button"
                        className="shrink-0 cursor-pointer gap-1.5 self-start border border-[#4A9A72]/35 bg-[#4A9A72]/12 text-[12px] font-semibold text-[#2d6b47] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] dark:text-[#6ee7a8] hover:bg-[#4A9A72]/22"
                        onClick={onRegisterClick}
                    >
                        <Plus className="size-3.5 text-[#4A9A72]" />
                        Registrar credencial
                    </NeuButtonRaised>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/12 px-2.5 py-1 text-xs text-[#D28C3C]">
                    <Lock className="size-3.5" />
                    Total {totalSecrets}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    En pantalla {rowsCount}
                </span>
            </div>
        </NeuCardRaised>
    );
}
