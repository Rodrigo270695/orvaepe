import { Link } from '@inertiajs/react';
import { KeyRound, Lock, Plus } from 'lucide-react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

const CREATE_CREDENCIAL_HREF = '/panel/acceso-credenciales/create';

type Props = {
    totalSecrets: number;
    rowsCount: number;
};

export default function AccesoCredencialesToolbar({
    totalSecrets,
    rowsCount,
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
                    <Link href={CREATE_CREDENCIAL_HREF} className="shrink-0 self-start">
                        <NeuButtonRaised
                            type="button"
                            className="gap-1.5 text-[12px]"
                        >
                            <Plus className="size-3.5" />
                            Registrar credencial
                        </NeuButtonRaised>
                    </Link>
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
