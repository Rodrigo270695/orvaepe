import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Loader2,
    LogOut,
    MessageCircle,
    RefreshCw,
    Send,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

import type { WhatsAppApiRoutes, WhatsAppProps } from './types';
import { WhatsappDisconnectDialog } from './WhatsappDisconnectDialog';
import { WhatsappTestMessageDialog } from './WhatsappTestMessageDialog';

type Props = {
    whatsapp: WhatsAppProps;
    apiRoutes: WhatsAppApiRoutes;
};

function StatusBadge({ isReady, hasError }: { isReady: boolean; hasError: boolean }) {
    if (isReady) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                Conectado
            </span>
        );
    }
    if (hasError) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/12 px-2.5 py-1 text-xs text-destructive">
                <AlertTriangle className="size-3.5" />
                Error
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-400">
            <Clock3 className="size-3.5" />
            Pendiente
        </span>
    );
}

export function WhatsappConnectCard({ whatsapp, apiRoutes }: Props) {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [qrError, setQrError] = useState<string | null>(null);
    const [waitingQr, setWaitingQr] = useState(false);
    const [loadingQr, setLoadingQr] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [disconnectOpen, setDisconnectOpen] = useState(false);
    const [testOpen, setTestOpen] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPoll = useCallback(() => {
        if (pollRef.current !== null) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    useEffect(() => () => stopPoll(), [stopPoll]);

    const fetchQr = useCallback(async () => {
        setLoadingQr(true);
        try {
            const res = await fetch(apiRoutes.qr, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            const data = (await res.json()) as {
                ready?: boolean;
                waiting?: boolean;
                qr_code?: string | null;
                error?: string;
                message?: string | null;
            };

            if (data.ready) {
                setQrError(null);
                setWaitingQr(false);
                setQrCode(null);
                router.reload({ only: ['whatsapp'] });
                stopPoll();
                return;
            }

            if (data.qr_code) {
                setQrError(null);
                setWaitingQr(false);
                setQrCode(data.qr_code);
                return;
            }

            // OpenWA aún genera el QR: seguir el poll sin error rojo.
            if (data.waiting || (res.ok && !data.error)) {
                setQrError(null);
                setWaitingQr(true);
                return;
            }

            if (!res.ok || data.error) {
                setWaitingQr(false);
                setQrError(data.error || `Error ${res.status} al obtener el QR`);
                setQrCode(null);
            }
        } catch {
            setWaitingQr(false);
            setQrError('No se pudo contactar al servidor para obtener el QR.');
            setQrCode(null);
        } finally {
            setLoadingQr(false);
        }
    }, [apiRoutes.qr, stopPoll]);

    const handleConnect = useCallback(() => {
        setSyncing(true);
        setQrError(null);
        router.post(apiRoutes.sync, {}, {
            preserveScroll: true,
            onFinish: () => setSyncing(false),
            onSuccess: () => {
                void fetchQr();
                stopPoll();
                pollRef.current = setInterval(() => void fetchQr(), 4000);
            },
        });
    }, [apiRoutes.sync, fetchQr, stopPoll]);

    const handleReset = useCallback(() => {
        setResetting(true);
        setQrError(null);
        setQrCode(null);
        stopPoll();
        router.post(apiRoutes.reset, {}, {
            preserveScroll: true,
            onFinish: () => setResetting(false),
            onSuccess: () => {
                void fetchQr();
                pollRef.current = setInterval(() => void fetchQr(), 4000);
            },
        });
    }, [apiRoutes.reset, fetchQr, stopPoll]);

    if (!whatsapp.configured) {
        return (
            <NeuCardRaised className="rounded-xl border border-dashed p-4 md:p-5">
                <div className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                        <h2 className="text-sm font-bold">WhatsApp no configurado</h2>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Define OPENWA_ENABLED y OPENWA_API_KEY en el servidor.
                        </p>
                    </div>
                </div>
            </NeuCardRaised>
        );
    }

    const session = whatsapp.session;
    const isReady = session?.is_ready === true;
    const lastError = session?.last_error ?? null;
    const lastErrorBenign =
        lastError !== null &&
        (/already started|not ready yet|qr code is not ready/i.test(lastError) ||
            /internal server error/i.test(lastError));
    const showSessionError = Boolean(lastError && !lastErrorBenign);

    return (
        <>
            <div className="neumorph-inset rounded-xl border border-border/60 p-4 md:p-5">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                            <StatusBadge isReady={isReady} hasError={showSessionError} />
                            {isReady && session?.phone ? (
                                <p className="text-[11px] text-muted-foreground">
                                    Número: <span className="font-medium text-foreground">{session.phone}</span>
                                </p>
                            ) : null}
                            {showSessionError ? (
                                <p className="text-[11px] text-destructive">{lastError}</p>
                            ) : null}
                            {qrError ? (
                                <p className="text-[11px] text-destructive">{qrError}</p>
                            ) : null}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                            {session?.openwa_session_name ?? 'orvae-platform'}
                        </span>
                    </div>

                    {!isReady && waitingQr && !qrCode ? (
                        <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2.5 text-[11px] text-amber-800 dark:text-amber-200">
                            <Loader2 className="size-3.5 animate-spin" />
                            Generando código QR, espera unos segundos…
                        </div>
                    ) : null}

                    {!isReady && qrCode ? (
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-5">
                            <p className="text-[11px] font-medium">Escanea el QR con WhatsApp</p>
                            <img src={qrCode} alt="QR WhatsApp" className="max-w-[220px] rounded-lg bg-white p-2" />
                        </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        {!isReady ? (
                            <>
                                <NeuButtonRaised type="button" onClick={handleConnect} disabled={syncing || loadingQr || resetting}>
                                    {syncing || loadingQr ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
                                    Vincular WhatsApp
                                </NeuButtonRaised>
                                <NeuButtonRaised
                                    type="button"
                                    onClick={handleReset}
                                    disabled={syncing || loadingQr || resetting}
                                    className="text-muted-foreground"
                                >
                                    {resetting ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                                    Reiniciar sesión
                                </NeuButtonRaised>
                            </>
                        ) : (
                            <>
                                <NeuButtonRaised type="button" onClick={() => setTestOpen(true)}>
                                    <Send className="size-4" /> Probar envío
                                </NeuButtonRaised>
                                <NeuButtonRaised type="button" onClick={handleConnect} disabled={syncing} className="text-muted-foreground">
                                    <RefreshCw className="size-4" /> Sincronizar
                                </NeuButtonRaised>
                                <NeuButtonRaised type="button" onClick={() => setDisconnectOpen(true)} className="text-destructive">
                                    <LogOut className="size-4" /> Desvincular
                                </NeuButtonRaised>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <WhatsappDisconnectDialog
                open={disconnectOpen}
                onOpenChange={setDisconnectOpen}
                phone={session?.phone ?? null}
                logoutUrl={apiRoutes.logout}
                onSuccess={() => { setQrCode(null); stopPoll(); }}
            />

            <WhatsappTestMessageDialog
                open={testOpen}
                onOpenChange={setTestOpen}
                defaultPhone={whatsapp.admin_notification_number || session?.phone || '976709811'}
                testUrl={apiRoutes.test}
            />
        </>
    );
}
