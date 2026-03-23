import { Box, LayoutGrid, Tags, User, UserX } from 'lucide-react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    totalLogs: number;
    rowsCount: number;
    withUserOnPage: number;
    systemOnPage: number;
};

export default function OperacionAuditoriaToolbar({
    totalLogs,
    rowsCount,
    withUserOnPage,
    systemOnPage,
}: Props) {
    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <Box className="size-4 text-[#D28C3C]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Auditoría</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Registro de acciones sobre entidades: quién, qué
                            cambió (valores previos y nuevos) e IP.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <Tags className="size-3.5" />
                    Registros {totalLogs}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A9A72]/12 px-2.5 py-1 text-xs text-[#4A9A72]">
                    <User className="size-3.5" />
                    Con usuario {withUserOnPage}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#B8860B]/12 px-2.5 py-1 text-xs text-[#D4A84B]">
                    <UserX className="size-3.5" />
                    Sistema {systemOnPage}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/12 px-2.5 py-1 text-xs text-[#8B5CF6]">
                    <LayoutGrid className="size-3.5" />
                    En pantalla {rowsCount}
                </span>
            </div>
        </NeuCardRaised>
    );
}
