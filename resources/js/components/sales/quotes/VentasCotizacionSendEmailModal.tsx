import { useForm } from '@inertiajs/react';
import { Plus, Send, Trash2 } from 'lucide-react';
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
        cc_emails: [] as string[],
    });

    React.useEffect(() => {
        sendForm.setDefaults({ email: defaultEmail, cc_emails: [] });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultEmail]);

    React.useEffect(() => {
        if (open) {
            sendForm.setData('email', defaultEmail);
            sendForm.setData('cc_emails', []);
            sendForm.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- al abrir / cambiar cotización
    }, [open, quoteId, defaultEmail]);

    const submitSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSend || !quoteId) {
            return;
        }
        const normalizedCc = sendForm.data.cc_emails
            .map((x) => x.trim().toLowerCase())
            .filter((x) => x !== '');
        sendForm.post(panel.ventasCotizaciones.sendEmail.url(quoteId), {
            preserveScroll: true,
            data: {
                email: sendForm.data.email,
                cc_emails: normalizedCc,
            },
            onSuccess: () => onOpenChange(false),
        });
    };

    const addCcEmail = () => {
        sendForm.setData('cc_emails', [...sendForm.data.cc_emails, '']);
    };

    const updateCcEmail = (index: number, value: string) => {
        sendForm.setData(
            'cc_emails',
            sendForm.data.cc_emails.map((row, i) => (i === index ? value : row)),
        );
    };

    const removeCcEmail = (index: number) => {
        sendForm.setData(
            'cc_emails',
            sendForm.data.cc_emails.filter((_, i) => i !== index),
        );
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
                        'bg-linear-to-br from-[#4A80B8]/14 via-[#5A9AD0]/10 to-[#4A80B8]/8',
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
                <div className="space-y-2 rounded-xl border border-border/60 p-3 neumorph-inset">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Copias (CC)
                            </p>
                            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                                Opcional. Agrega uno o varios correos para copia.
                            </p>
                        </div>
                        <NeuButtonInset
                            type="button"
                            onClick={addCcEmail}
                            disabled={!canSend || sendForm.processing}
                            className="cursor-pointer text-xs"
                        >
                            <Plus className="size-3.5" />
                            Agregar copia
                        </NeuButtonInset>
                    </div>
                    {sendForm.data.cc_emails.length > 0 ? (
                        <div className="space-y-2">
                            {sendForm.data.cc_emails.map((ccEmail, index) => (
                                <div key={index} className="flex items-end gap-2">
                                    <div className="flex-1 space-y-1.5">
                                        <AdminUnderlineLabel
                                            htmlFor={`send_quote_cc_${index}`}
                                        >
                                            Correo CC {index + 1}
                                        </AdminUnderlineLabel>
                                        <AdminUnderlineInput
                                            id={`send_quote_cc_${index}`}
                                            name={`cc_emails[${index}]`}
                                            type="email"
                                            value={ccEmail}
                                            onChange={(e) =>
                                                updateCcEmail(index, e.target.value)
                                            }
                                            autoComplete="off"
                                            placeholder="copia@empresa.com"
                                            disabled={!canSend}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeCcEmail(index)}
                                        disabled={!canSend || sendForm.processing}
                                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border/50 text-muted-foreground transition-colors hover:border-[#C05050]/40 hover:text-[#C05050] disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label={`Quitar correo CC ${index + 1}`}
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[11px] text-muted-foreground">
                            Sin copias por ahora.
                        </p>
                    )}
                    <InputError message={sendForm.errors.cc_emails} />
                    {sendForm.data.cc_emails.map((_, index) => (
                        <InputError
                            key={`cc_err_${index}`}
                            message={
                                (sendForm.errors as Record<string, string>)[
                                    `cc_emails.${index}`
                                ]
                            }
                        />
                    ))}
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
