import { Form } from '@inertiajs/react';
import * as React from 'react';
import {
    DialogFooter,
} from '@/components/ui/dialog';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuButtonInset } from '@/components/ui/neu-button-inset';
import AdminModalShell from '@/components/ui/admin-modal-shell';
import { Save, X } from 'lucide-react';

type Mode = 'create' | 'edit';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: Mode;
    title: string;
    description?: string;
    /**
     * URL a la que Inertia enviará el form.
     * Para edición normalmente usas `method="post"` + hidden `_method="patch"`.
     */
    action: string;
    /**
     * Normalmente siempre `post` para compatibilidad con `_method`.
     */
    method: 'post' | 'get';
    methodOverride?: 'patch' | 'put' | 'delete';
    submitLabel: string;
    children: (args: {
        processing: boolean;
        recentlySuccessful: boolean;
        errors: Record<string, string | undefined>;
    }) => React.ReactNode;
    /**
     * Texto del toast success.
     */
    successToastTitle?: string;
    /** Ej. `multipart/form-data` si el formulario incluye `<input type="file" />`. */
    encType?: React.HTMLAttributes<HTMLFormElement>['encType'];
    /**
     * Nombres `name="..."` que deben estar rellenos para habilitar enviar.
     * Si se omite, se usa la heurística por formulario (slug, name, code…).
     */
    requiredFieldNames?: string[];
};

export default function AdminCrudUpsertModal({
    open,
    onOpenChange,
    mode,
    title,
    description,
    action,
    method,
    methodOverride,
    submitLabel,
    children,
    successToastTitle = 'Se ha guardado la configuración',
    encType,
    requiredFieldNames,
}: Props) {
    const handleClose = () => onOpenChange(false);
    const [hasRequiredFields, setHasRequiredFields] = React.useState(
        mode === 'edit',
    );

    const syncRequiredFieldsState = React.useCallback(
        (form: HTMLFormElement) => {
            // Heurística por formulario (si no pasas `requiredFieldNames`):
            // - Categorías: slug, name, revenue_line
            // - Vitrina clientes: solo legal_name (slug es opcional; no usar heurística global)
            const requiredCandidates = [
                'slug',
                'name',
                'revenue_line',
                'code',
                'catalog_product_id',
                'sale_model',
                'list_price',
                'currency',
                'fulfillment_type',
                'discount_type',
                'discount_value',
                'catalog_product_id',
                'released_at',
                'label',
                'path',
                'user_id',
                'catalog_sku_id',
                'max_activations',
                'status',
            ];

            const requiredPresent =
                requiredFieldNames && requiredFieldNames.length > 0
                    ? requiredFieldNames.filter((field) =>
                          Boolean(form.querySelector(`[name="${field}"]`)),
                      )
                    : requiredCandidates.filter((field) =>
                          Boolean(form.querySelector(`[name="${field}"]`)),
                      );

            if (requiredPresent.length === 0) {
                setHasRequiredFields(true);
                return;
            }

            const allFilled = requiredPresent.every((field) => {
                const el = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${field}"]`);
                if (!el) return true;
                if (el instanceof HTMLInputElement && el.type === 'file') {
                    return true;
                }
                /* Ruta o URL opcional si ya hay archivo adjunto (releases / assets). */
                if (
                    el instanceof HTMLInputElement &&
                    (field === 'path' || field === 'artifact_path')
                ) {
                    const fileFieldName =
                        field === 'path' ? 'asset_file' : 'artifact_file';
                    const fileEl = form.querySelector<HTMLInputElement>(
                        `input[type="file"][name="${fileFieldName}"]`,
                    );
                    if (fileEl?.files?.length) {
                        return true;
                    }
                }
                const v = el.value.trim();
                if (v === '') {
                    return false;
                }
                if (field === 'catalog_sku_id' && v === '_none_') {
                    return false;
                }
                return true;
            });

            setHasRequiredFields(allFilled);
        },
        [requiredFieldNames],
    );

    React.useEffect(() => {
        if (!open) return;
        setHasRequiredFields(mode === 'edit');
    }, [open, mode]);

    React.useEffect(() => {
        if (!open) return;
        const frame = window.requestAnimationFrame(() => {
            const form = document.querySelector<HTMLFormElement>(
                'form[action="' + action + '"]',
            );
            if (form) syncRequiredFieldsState(form);
        });
        return () => window.cancelAnimationFrame(frame);
    }, [open, action, syncRequiredFieldsState, requiredFieldNames]);

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
                    encType={encType}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="space-y-6"
                    onInput={(event) =>
                        syncRequiredFieldsState(
                            event.currentTarget as HTMLFormElement,
                        )
                    }
                    onChange={(event) =>
                        syncRequiredFieldsState(
                            event.currentTarget as HTMLFormElement,
                        )
                    }
                >
                    {({ processing, recentlySuccessful, errors }) => (
                        <>
                            {methodOverride ? (
                                <input
                                    type="hidden"
                                    name="_method"
                                    value={methodOverride}
                                />
                            ) : null}

                            {children({
                                processing,
                                recentlySuccessful,
                                errors: errors as Record<
                                    string,
                                    string | undefined
                                >,
                            })}

                            <DialogFooter
                                className="gap-2 sm:justify-end"
                                data-mode={mode}
                            >
                                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
                                    <NeuButtonInset
                                        type="button"
                                        onClick={handleClose}
                                        className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap cursor-pointer sm:w-auto"
                                    >
                                        <X className="size-4 text-[#C05050]" />
                                        Cancelar
                                    </NeuButtonInset>

                                    <NeuButtonRaised
                                        type="submit"
                                        disabled={processing || !hasRequiredFields}
                                        className="w-full cursor-pointer sm:w-auto"
                                    >
                                        <Save
                                            className={
                                                mode === 'create'
                                                    ? 'size-4 text-[#4A9A72]'
                                                    : 'size-4 text-[#4A80B8]'
                                            }
                                        />
                                        {processing
                                            ? 'Guardando…'
                                            : submitLabel}
                                    </NeuButtonRaised>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </Form>
        </AdminModalShell>
    );
}

