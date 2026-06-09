import { router } from '@inertiajs/react';
import { Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';

import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phone: string | null;
    logoutUrl: string;
    onSuccess?: () => void;
};

export function WhatsappDisconnectDialog({
    open,
    onOpenChange,
    phone,
    logoutUrl,
    onSuccess,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const onConfirm = () => {
        setProcessing(true);
        router.post(
            logoutUrl,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    onOpenChange(false);
                    onSuccess?.();
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <LogOut className="size-5" strokeWidth={2.5} />
                    </div>
                    <DialogTitle className="pt-2 text-sm font-bold">
                        Desvincular WhatsApp
                    </DialogTitle>
                    <DialogDescription className="text-[11px]">
                        Se cerrará la sesión de Orvae en OpenWA. Las notificaciones
                        automáticas dejarán de enviarse hasta que vuelvas a escanear el QR.
                        {phone ? (
                            <span className="mt-2 block font-medium text-foreground">
                                {phone}
                            </span>
                        ) : null}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <NeuButtonRaised
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                        className="text-muted-foreground"
                    >
                        Cancelar
                    </NeuButtonRaised>
                    <NeuButtonRaised
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="bg-destructive/10 text-destructive hover:text-destructive"
                    >
                        {processing && <Loader2 className="size-4 animate-spin" />}
                        Desvincular
                    </NeuButtonRaised>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
