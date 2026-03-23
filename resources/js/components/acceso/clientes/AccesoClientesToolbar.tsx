import { Users } from 'lucide-react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    totalUsers: number;
};

export default function AccesoClientesToolbar({ totalUsers }: Props) {
    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <Users className="size-4 text-[#4A80B8]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Usuarios cliente</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Cuentas con rol{' '}
                            <span className="font-mono font-medium text-foreground">
                                client
                            </span>{' '}
                            (portal cliente). Busca por nombre, correo, documento
                            o usuario.
                        </p>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground md:text-right">
                    <span className="font-mono font-semibold text-foreground">
                        {totalUsers}
                    </span>{' '}
                    en el rango y filtros actuales
                </div>
            </div>
        </NeuCardRaised>
    );
}
