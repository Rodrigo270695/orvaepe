import { router, usePage } from '@inertiajs/react';
import { Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
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
    defaultPhone?: string | null;
    testUrl: string;
};

const inputClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent px-0 py-2 text-sm outline-none transition-colors focus:border-[var(--o-amber)]/60';

export function WhatsappTestMessageDialog({
    open,
    onOpenChange,
    defaultPhone,
    testUrl,
}: Props) {
    const errors = usePage().props.errors as Record<string, string> | undefined;
    const [destinatario, setDestinatario] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            setDestinatario(defaultPhone ?? '976709811');
            setMensaje('Prueba ORVAE por OpenWA — ' + new Date().toLocaleString('es-PE'));
        }
    }, [open, defaultPhone]);

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        router.post(
            testUrl,
            { destinatario, mensaje },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => onOpenChange(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold">
                            Enviar mensaje de prueba
                        </DialogTitle>
                        <DialogDescription className="text-[11px]">
                            Verifica que la sesión de Orvae puede enviar mensajes por
                            WhatsApp.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-1">
                            <AdminUnderlineLabel htmlFor="whatsapp-test-phone">
                                Número destino
                            </AdminUnderlineLabel>
                            <input
                                id="whatsapp-test-phone"
                                type="tel"
                                className={inputClass}
                                value={destinatario}
                                onChange={(e) => setDestinatario(e.target.value)}
                                placeholder="976709811"
                                autoComplete="tel"
                                required
                            />
                            {errors?.destinatario ? (
                                <p className="text-[11px] text-destructive">
                                    {errors.destinatario}
                                </p>
                            ) : (
                                <p className="text-[10px] text-muted-foreground">
                                    Perú: 9 dígitos o con código 51.
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <AdminUnderlineLabel htmlFor="whatsapp-test-message">
                                Mensaje
                            </AdminUnderlineLabel>
                            <textarea
                                id="whatsapp-test-message"
                                className={`${inputClass} min-h-[88px] resize-none`}
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                rows={4}
                                maxLength={1000}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <NeuButtonRaised
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                            className="text-muted-foreground"
                        >
                            Cancelar
                        </NeuButtonRaised>
                        <NeuButtonRaised type="submit" disabled={processing}>
                            {processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )}
                            Enviar prueba
                        </NeuButtonRaised>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
