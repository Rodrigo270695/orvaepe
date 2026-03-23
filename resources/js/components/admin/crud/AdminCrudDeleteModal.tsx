import * as React from 'react';
import { Form } from '@inertiajs/react';

import { DialogFooter } from '@/components/ui/dialog';
import { NeuButtonInset } from '@/components/ui/neu-button-inset';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import AdminModalShell from '@/components/ui/admin-modal-shell';
import { Trash2, X } from 'lucide-react';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    /**
     * URL del endpoint de borrado.
     * Recomendado: `/panel/.../${'id'}`.
     */
    action: string;
    /**
     * Normalmente `post` + `_method="delete"` para compatibilidad.
     */
    method: 'post' | 'get';
    methodOverride?: 'delete';
    /**
     * Texto opcional que mostramos en el body.
     */
    entityLabel?: string;
};

export default function AdminCrudDeleteModal({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Eliminar',
    action,
    method,
    methodOverride = 'delete',
    entityLabel,
}: Props) {
    const handleClose = () => onOpenChange(false);

    return (
        <AdminModalShell
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) handleClose();
            }}
            title={title}
            description={description}
        >
                <Form
                    action={action}
                    method={method}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="space-y-6"
                >
                    {({ processing }) => (
                        <>
                            {entityLabel ? (
                                <p className="text-sm text-muted-foreground">
                                    ¿Seguro que deseas eliminar{' '}
                                    <span className="font-semibold text-foreground">
                                        {entityLabel}
                                    </span>
                                    ?
                                </p>
                            ) : null}

                            {methodOverride ? (
                                <input
                                    type="hidden"
                                    name="_method"
                                    value={methodOverride}
                                />
                            ) : null}

                            <DialogFooter className="gap-2 sm:justify-end">
                                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
                                    <NeuButtonInset
                                        type="button"
                                        onClick={handleClose}
                                        className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap cursor-pointer text-[13px] sm:w-auto"
                                    >
                                        <X className="size-4 text-[#C05050]" />
                                        Cancelar
                                    </NeuButtonInset>

                                    <NeuButtonRaised
                                        type="submit"
                                        disabled={processing}
                                        className="w-full cursor-pointer text-[13px] sm:w-auto"
                                    >
                                        <Trash2 className="size-4 text-[#C05050]" />
                                        {processing
                                            ? 'Eliminando…'
                                            : confirmLabel}
                                    </NeuButtonRaised>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </Form>
        </AdminModalShell>
    );
}

