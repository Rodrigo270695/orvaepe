import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import * as React from 'react';

import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import InputError from '@/components/input-error';
import AdminModalShell from '@/components/ui/admin-modal-shell';
import { NeuButtonInset } from '@/components/ui/neu-button-inset';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { cn } from '@/lib/utils';
import panel from '@/routes/panel';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quoteId: string;
    quoteNumber: string;
    defaultEmail: string;
    canSend: boolean;
};

/**
 * Modal para confirmar correo del destinatario y enviar la cotización en PDF (POST send-email).
 */
export default function VentasCotizacionSendEmailModal({
    open,
    onOpenChange,
    quoteId,
    quoteNumber,
    defaultEmail,
    canSend,
}: Props) {
    const sendForm = useForm({
        email: defaultEmail,
    });

    React.useEffect(() => {
        sendForm.setDefaults({ email: defaultEmail });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultEmail]);

    React.useEffect(() => {
        if (open) {
            sendForm.setData('email', defaultEmail);
            sendForm.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- al abrir / cambiar cotización
    }, [open, quoteId, defaultEmail]);

    const submitSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSend || !quoteId) {
            return;
        }
        sendForm.post(panel.ventasCotizaciones.sendEmail.url(quoteId), {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <AdminModalShell
            open={open}
            onOpenChange={onOpenChange}
            title="Enviar cotización por correo"
            description="Confirmar destinatario"
        >
            <form onSubmit={submitSend} className="space-y-4 pb-2 pt-0">
                <div
                    className={cn(
                        '-mx-2 flex gap-3 rounded-xl border border-[#4A80B8]/40',
                        'bg-gradient-to-br from-[#4A80B8]/14 via-[#5A9AD0]/10 to-[#4A80B8]/8',
                        'p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)]',
                        'dark:border-[#4A80B8]/50 dark:from-[#4A80B8]/20 dark:via-[#4A80B8]/12 dark:to-[#4A80B8]/8',
                    )}
                >
                    <div
                        className={cn(
                            'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                            'bg-[#4A80B8] text-white shadow-md shadow-[#4A80B8]/40',
                            'ring-2 ring-white/30 dark:ring-white/10',
                        )}
                        aria-hidden
                    >
                        <Send className="size-5" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#4A80B8] dark:text-[#6BA3D4]">
                            Envío con PDF adjunto
                        </p>
                        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                            Se genera el documento y se envía al correo que indiques abajo.
                        </p>
                    </div>
                </div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                    Se adjuntará el PDF de la cotización{' '}
                    <span className="font-mono font-semibold text-[#4A80B8]">
                        {quoteNumber}
                    </span>
                    . Revisa el correo del{' '}
                    <strong className="text-foreground">destinatario</strong>; puedes
                    corregirlo antes de enviar.
                </p>
                <div className="space-y-1.5">
                    <AdminUnderlineLabel htmlFor="send_quote_email_modal" required>
                        Correo del destinatario
                    </AdminUnderlineLabel>
                    <AdminUnderlineInput
                        id="send_quote_email_modal"
                        name="email"
                        type="email"
                        value={sendForm.data.email}
                        onChange={(e) => sendForm.setData('email', e.target.value)}
                        autoComplete="email"
                        placeholder="cliente@empresa.com"
                        required
                        disabled={!canSend}
                    />
                    <InputError message={sendForm.errors.email} />
                </div>
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                    <NeuButtonInset
                        type="button"
                        className="cursor-pointer"
                        onClick={() => onOpenChange(false)}
                        disabled={sendForm.processing}
                    >
                        Cancelar
                    </NeuButtonInset>
                    <NeuButtonRaised
                        type="submit"
                        disabled={sendForm.processing || !canSend}
                        className={cn(
                            'cursor-pointer border border-[#4A80B8]/45',
                            'bg-[#4A80B8]/14 text-[#1a3558] hover:bg-[#4A80B8]/22',
                            'dark:text-foreground dark:hover:bg-[#4A80B8]/25',
                        )}
                    >
                        <Send
                            className="size-3.5 shrink-0 text-[#4A80B8]"
                            aria-hidden
                        />
                        {sendForm.processing ? 'Enviando…' : 'Confirmar y enviar'}
                    </NeuButtonRaised>
                </div>
            </form>
        </AdminModalShell>
    );
}
