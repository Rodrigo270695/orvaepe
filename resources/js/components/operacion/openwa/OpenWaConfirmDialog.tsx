import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    url: string;
    method: 'post' | 'delete';
};

export function OpenWaConfirmDialog({ open, onOpenChange, title, description, confirmLabel, url, method }: Props) {
    const [processing, setProcessing] = useState(false);

    const onConfirm = () => {
        setProcessing(true);
        router.visit(url, {
            method,
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-[11px]">{description}</DialogDescription>
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
                        {processing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                        {confirmLabel}
                    </NeuButtonRaised>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
