import { Ban, Box, CheckCircle2, LayoutGrid, Tags } from 'lucide-react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    totalActivations: number;
    rowsCount: number;
    activeOnPage: number;
    inactiveOnPage: number;
};

export default function AccesoActivacionesToolbar({
    totalActivations,
    rowsCount,
    activeOnPage,
    inactiveOnPage,
}: Props) {
    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <Box className="size-4 text-[#D28C3C]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">
                            Activaciones de licencias
                        </h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Registro de uso por dominio o equipo: IP, huella y
                            último ping. Las claves y límites globales están en{' '}
                            <span className="font-mono">Licencias</span>.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <Tags className="size-3.5" />
                    Activaciones {totalActivations}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    <CheckCircle2 className="size-3.5" />
                    Activas {activeOnPage}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C05050]/12 px-2.5 py-1 text-xs text-[#C05050]">
                    <Ban className="size-3.5" />
                    Inactivas {inactiveOnPage}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <LayoutGrid className="size-3.5" />
                    En pantalla {rowsCount}
                </span>
            </div>
        </NeuCardRaised>
    );
}
