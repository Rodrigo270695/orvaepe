import { useForm } from '@inertiajs/react';
import { KeyRound, Save, X } from 'lucide-react';
import * as React from 'react';

import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import AdminUnderlineTextarea from '@/components/admin/form/admin-underline-textarea';
import {
    SearchableSelect,
    type SearchableSelectOption,
} from '@/components/admin/form/searchable-select';
import type { EntitlementRow } from '@/components/acceso/entitlements/entitlementTypes';
import {
    formatClientFullName,
} from '@/components/acceso/entitlements/entitlementDisplay';
import InputError from '@/components/input-error';
import AdminModalShell from '@/components/ui/admin-modal-shell';
import { NeuButtonInset } from '@/components/ui/neu-button-inset';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

type KindOption = { value: string; label: string };

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kindOptions: KindOption[];
    storeUrl: string;
    /** Si viene desde “Derechos de uso”, el entitlement es fijo. */
    fixedEntitlement?: EntitlementRow | null;
    /** Requerido cuando no hay entitlement fijo (alta desde listado de credenciales). */
    entitlementOptions?: SearchableSelectOption[];
};

const emptyForm = (kindDefault: string, entitlementId: string) => ({
    entitlement_id: entitlementId,
    kind: kindDefault,
    label: '',
    public_ref: '',
    secret_value: '',
    expires_at: '',
});

export default function EntitlementSecretModal({
    open,
    onOpenChange,
    kindOptions,
    storeUrl,
    fixedEntitlement = null,
    entitlementOptions = [],
}: Props) {
    const kindDefault = kindOptions[0]?.value ?? 'custom';

    const { data, setData, post, processing, errors, reset, transform } =
        useForm(emptyForm(kindDefault, fixedEntitlement?.id ?? ''));

    const handleModalOpenChange = React.useCallback(
        (next: boolean) => {
            if (!next) {
                reset(emptyForm(kindDefault, fixedEntitlement?.id ?? ''));
            }
            onOpenChange(next);
        },
        [fixedEntitlement?.id, kindDefault, onOpenChange, reset],
    );

    React.useEffect(() => {
        if (!open) {
            return;
        }
        reset(emptyForm(kindDefault, fixedEntitlement?.id ?? ''));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset al abrir / cambiar entitlement fijo
    }, [open, fixedEntitlement?.id]);

    const canSubmit = React.useMemo(() => {
        if (!data.secret_value?.trim()) {
            return false;
        }
        if (!fixedEntitlement && !data.entitlement_id?.trim()) {
            return false;
        }
        return true;
    }, [data.secret_value, data.entitlement_id, fixedEntitlement]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((fd) => ({
            ...fd,
            entitlement_id: fixedEntitlement?.id ?? fd.entitlement_id,
        }));
        post(storeUrl, {
            preserveScroll: true,
            onSuccess: () => handleModalOpenChange(false),
        });
    };

    const title = fixedEntitlement
        ? 'Registrar credencial para este derecho'
        : 'Registrar credencial';

    return (
        <AdminModalShell
            open={open}
            onOpenChange={handleModalOpenChange}
            title={title}
            description="Formulario de credencial técnica"
            width="wide"
        >
            <form onSubmit={submit} className="flex flex-col gap-0">
                <div className="space-y-4">
                    {fixedEntitlement ? (
                        <div>
                            <NeuCardRaised className="rounded-xl p-3 md:p-4">
                                <div className="flex items-start gap-2">
                                    <KeyRound className="mt-0.5 size-4 shrink-0 text-[#D28C3C]" />
                                    <div className="min-w-0 space-y-1 text-[12px]">
                                        <p className="font-medium text-foreground">
                                            {formatClientFullName(
                                                fixedEntitlement.user ?? null,
                                            )}
                                        </p>
                                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                                            {fixedEntitlement.user?.email ?? '—'}
                                        </p>
                                        <p className="text-foreground">
                                            {fixedEntitlement.catalog_product?.name ??
                                                '—'}
                                        </p>
                                        <p className="font-mono text-[11px] text-muted-foreground">
                                            {fixedEntitlement.catalog_sku
                                                ? `${fixedEntitlement.catalog_sku.code} · ${fixedEntitlement.catalog_sku.name}`
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                            </NeuCardRaised>
                            <InputError message={errors.entitlement_id} />
                        </div>
                    ) : (
                        <div className="relative">
                            <AdminUnderlineLabel htmlFor="modal_entitlement_id">
                                Derecho de uso (entitlement){' '}
                                <span className="text-red-500">*</span>
                            </AdminUnderlineLabel>
                            <div className="mt-1.5">
                                <SearchableSelect
                                    id="modal_entitlement_id"
                                    value={data.entitlement_id}
                                    onChange={(v) => setData('entitlement_id', v)}
                                    options={entitlementOptions}
                                    placeholder="Buscar por cliente, producto o SKU…"
                                    noOptionsMessage="No hay entitlements en la lista (máx. 400 recientes)."
                                />
                            </div>
                            <InputError message={errors.entitlement_id} />
                        </div>
                    )}

                    <div>
                        <AdminUnderlineLabel htmlFor="modal_kind">Tipo</AdminUnderlineLabel>
                        <div className="mt-1.5">
                            <AdminUnderlineSelect
                                id="modal_kind"
                                name="kind"
                                value={data.kind}
                                options={kindOptions}
                                onValueChange={(v) => setData('kind', v)}
                                placeholder="Tipo de credencial"
                            />
                        </div>
                        <InputError message={errors.kind} />
                    </div>

                    <div>
                        <AdminUnderlineLabel htmlFor="modal_label">
                            Etiqueta (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="modal_label"
                            name="label"
                            value={data.label}
                            onChange={(e) => setData('label', e.target.value)}
                            placeholder="Ej. URL del sistema, token repositorio…"
                            autoComplete="off"
                        />
                        <InputError message={errors.label} />
                    </div>

                    <div>
                        <AdminUnderlineLabel htmlFor="modal_public_ref">
                            Referencia visible (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="modal_public_ref"
                            name="public_ref"
                            value={data.public_ref}
                            onChange={(e) =>
                                setData('public_ref', e.target.value)
                            }
                            placeholder="Si lo dejas vacío se infiere del valor secreto."
                            autoComplete="off"
                        />
                        <InputError message={errors.public_ref} />
                    </div>

                    <div>
                        <AdminUnderlineLabel htmlFor="modal_secret_value">
                            Valor secreto <span className="text-red-500">*</span>
                        </AdminUnderlineLabel>
                        <AdminUnderlineTextarea
                            id="modal_secret_value"
                            name="secret_value"
                            value={data.secret_value}
                            onChange={(e) =>
                                setData('secret_value', e.target.value)
                            }
                            placeholder="URL, contraseña, token, PEM… Se guarda cifrado."
                            rows={5}
                            className="resize-y font-mono text-[12px]"
                            autoComplete="off"
                        />
                        <InputError message={errors.secret_value} />
                    </div>

                    <div>
                        <AdminUnderlineLabel htmlFor="modal_expires_at">
                            Caducidad del secreto (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="modal_expires_at"
                            name="expires_at"
                            type="datetime-local"
                            value={data.expires_at}
                            onChange={(e) =>
                                setData('expires_at', e.target.value)
                            }
                        />
                        <InputError message={errors.expires_at} />
                    </div>
                </div>

                <Separator className="my-4 bg-border" />

                <DialogFooter className="gap-2 sm:justify-end">
                    <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
                        <NeuButtonInset
                            type="button"
                            onClick={() => handleModalOpenChange(false)}
                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap sm:w-auto"
                        >
                            <X className="size-4 text-[#C05050]" />
                            Cancelar
                        </NeuButtonInset>
                        <NeuButtonRaised
                            type="submit"
                            disabled={processing || !canSubmit}
                            className="w-full cursor-pointer sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="size-4 text-[#4A9A72]" />
                            {processing ? 'Guardando…' : 'Registrar'}
                        </NeuButtonRaised>
                    </div>
                </DialogFooter>
            </form>
        </AdminModalShell>
    );
}
