import { KeyRound, Package, Plus, ShieldCheck } from 'lucide-react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

type Props = {
    totalKeys: number;
    rowsCount: number;
    onCreate?: () => void;
    /** Conteos en la página actual (referencia rápida). */
    statusOnPage?: {
        draft: number;
        pending: number;
        active: number;
        expired: number;
        revoked: number;
    };
};

export default function AccesoLicenciasToolbar({
    totalKeys,
    rowsCount,
    onCreate,
    statusOnPage,
}: Props) {
    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <Package className="size-4 text-[#4A80B8]" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold">Licencias propias</h1>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Claves de producto software vinculadas a cliente, SKU y
                            pedido. Las activaciones por dominio o equipo se ven en{' '}
                            <span className="font-mono">Activaciones</span>.
                        </p>
                    </div>
                </div>

                {onCreate ? (
                    <div className="flex shrink-0 items-center gap-2">
                        <NeuButtonRaised
                            type="button"
                            className="cursor-pointer"
                            onClick={onCreate}
                        >
                            <Plus className="size-4 text-[#4A9A72]" />
                            Nueva licencia
                        </NeuButtonRaised>
                    </div>
                ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4A80B8]/12 px-2.5 py-1 text-xs text-[#4A80B8]">
                    <KeyRound className="size-3.5" />
                    Total {totalKeys}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <ShieldCheck className="size-3.5" />
                    En pantalla {rowsCount}
                </span>
                {statusOnPage ? (
                    <>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#B8860B]/35 bg-[#B8860B]/10 px-2.5 py-1 text-xs font-medium text-[#D4A84B]">
                            Borradores {statusOnPage.draft}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#E8C547]/35 bg-[#B8860B]/10 px-2.5 py-1 text-xs font-medium text-[#E8C547]">
                            Pendientes {statusOnPage.pending}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#4A9A72]/30 bg-[#4A9A72]/10 px-2.5 py-1 text-xs font-medium text-[#4A9A72]">
                            Activas {statusOnPage.active}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/80 px-2.5 py-1 text-xs text-muted-foreground">
                            Vencidas {statusOnPage.expired}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#C05050]/30 bg-[#C05050]/10 px-2.5 py-1 text-xs font-medium text-[#C05050]">
                            Revocadas {statusOnPage.revoked}
                        </span>
                    </>
                ) : null}
            </div>
        </NeuCardRaised>
    );
}
