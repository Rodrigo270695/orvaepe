import { router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

import type { OpenWaConnectionState, OpenWaLine } from './types';

const POLL_MS = 3000;

type Props = {
    line: OpenWaLine | null;
    onOpenChange: (open: boolean) => void;
};

export function OpenWaQrDialog({ line, onOpenChange }: Props) {
    const [state, setState] = useState<OpenWaConnectionState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const open = line !== null;

    useEffect(() => {
        if (!line) {
            return;
        }

        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const tick = async () => {
            try {
                const res = await fetch(line.routes.connection, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                const data = (await res.json()) as OpenWaConnectionState;

                if (cancelled) {
                    return;
                }

                if (!res.ok || data.error) {
                    setError(data.error ?? data.message ?? `Error ${res.status} al consultar OpenWA.`);

                    return;
                }

                setError(null);
                setState(data);

                if (data.ready) {
                    router.reload({ only: ['lines'] });

                    return;
                }
            } catch {
                if (!cancelled) {
                    setError('No se pudo contactar al servidor.');
                }

                return;
            }

            if (!cancelled) {
                timer = setTimeout(() => void tick(), POLL_MS);
            }
        };

        void tick();

        return () => {
            cancelled = true;

            if (timer !== null) {
                clearTimeout(timer);
            }
        };
    }, [line, attempt]);

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setState(null);
            setError(null);
        }

        onOpenChange(next);
    };

    const retry = () => {
        setError(null);
        setAttempt((n) => n + 1);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold">
                        Vincular {line?.nombre}
                    </DialogTitle>
                    <DialogDescription className="text-[11px]">
                        En el celular de esta línea abre WhatsApp → Ajustes → Dispositivos
                        vinculados → Vincular dispositivo, y escanea el código.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 py-2">
                    {state?.ready ? (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <CheckCircle2 className="size-12 text-emerald-600" aria-hidden />
                            <p className="text-sm font-bold">WhatsApp conectado</p>
                            {state.phone ? (
                                <p className="font-mono text-xs text-muted-foreground">{state.phone}</p>
                            ) : null}
                        </div>
                    ) : error ? (
                        <div className="flex max-w-xs flex-col items-center gap-2 text-center">
                            <AlertTriangle className="size-10 text-destructive" aria-hidden />
                            <p className="text-[11px] text-destructive">{error}</p>
                        </div>
                    ) : state?.qr_code ? (
                        <>
                            <img
                                src={state.qr_code}
                                alt={`Código QR para vincular ${line?.nombre ?? 'la línea'}`}
                                className="size-[240px] rounded-xl bg-white p-2"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                El código se renueva solo cada pocos segundos.
                            </p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
                            <p className="text-[11px] text-muted-foreground" aria-live="polite">
                                {state?.message ?? 'Conectando con OpenWA…'}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    {error ? (
                        <NeuButtonRaised type="button" onClick={retry}>
                            <RefreshCw className="size-4" aria-hidden /> Reintentar
                        </NeuButtonRaised>
                    ) : null}
                    <NeuButtonRaised
                        type="button"
                        onClick={() => handleOpenChange(false)}
                        className="text-muted-foreground"
                    >
                        {state?.ready ? 'Listo' : 'Cerrar'}
                    </NeuButtonRaised>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
