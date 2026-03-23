import { Form } from '@inertiajs/react';
import { Ban, X } from 'lucide-react';

import { DialogFooter } from '@/components/ui/dialog';
import { NeuButtonInset } from '@/components/ui/neu-button-inset';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import AdminModalShell from '@/components/ui/admin-modal-shell';
import {
    formatClientFullName,
    subscriptionItemsSummary,
} from '@/components/sales/subscriptions/subscriptionDisplay';
import type { SubscriptionRow } from '@/components/sales/subscriptions/subscriptionTypes';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription: SubscriptionRow | null;
    cancelAction: string;
};

export default function VentasSuscripcionCancelModal({
    open,
    onOpenChange,
    subscription,
    cancelAction,
}: Props) {
    const handleClose = () => onOpenChange(false);

    const label = subscription
        ? `${formatClientFullName(subscription.user)} · ${subscriptionItemsSummary(subscription)}`
        : '';

    return (
        <AdminModalShell
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) handleClose();
            }}
            title="Cancelar suscripción"
            description="Confirmar cancelación de suscripción recurrente"
        >
            <Form
                action={cancelAction}
                method="post"
                options={{ preserveScroll: true }}
                onSuccess={() => onOpenChange(false)}
                className="space-y-6"
            >
                {({ processing }) => (
                    <>
                        <p className="text-sm text-muted-foreground">
                            La suscripción quedará en estado cancelado y se
                            registrará la fecha. No se elimina el registro.
                        </p>
                        {subscription ? (
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                    {label}
                                </span>
                            </p>
                        ) : null}

                        <DialogFooter className="gap-2 sm:justify-end">
                            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
                                <NeuButtonInset
                                    type="button"
                                    onClick={handleClose}
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-[13px] sm:w-auto"
                                >
                                    <X className="size-4 text-muted-foreground" />
                                    Volver
                                </NeuButtonInset>

                                <NeuButtonRaised
                                    type="submit"
                                    disabled={processing || !cancelAction}
                                    className="w-full cursor-pointer border-[#C05050]/40 bg-[#C05050]/12 text-[13px] text-[#C05050] hover:bg-[#C05050]/20 sm:w-auto"
                                >
                                    <Ban className="size-4" />
                                    {processing
                                        ? 'Cancelando…'
                                        : 'Cancelar suscripción'}
                                </NeuButtonRaised>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </Form>
        </AdminModalShell>
    );
}
