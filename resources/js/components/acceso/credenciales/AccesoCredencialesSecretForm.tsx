import { useForm } from '@inertiajs/react';
import * as React from 'react';

import AdminUnderlineInput from '@/components/admin/form/admin-underline-input';
import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import AdminUnderlineTextarea from '@/components/admin/form/admin-underline-textarea';
import { SearchableSelect, type SearchableSelectOption } from '@/components/admin/form/searchable-select';
import InputError from '@/components/input-error';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';

export type EntitlementOption = SearchableSelectOption;

type KindOption = { value: string; label: string };

type Props = {
    entitlementOptions: EntitlementOption[];
    selectedEntitlementId: string | null;
    kindOptions: KindOption[];
    storeUrl: string;
};

export default function AccesoCredencialesSecretForm({
    entitlementOptions,
    selectedEntitlementId,
    kindOptions,
    storeUrl,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        entitlement_id: selectedEntitlementId ?? '',
        kind: kindOptions[0]?.value ?? 'custom',
        label: '',
        public_ref: '',
        secret_value: '',
        expires_at: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeUrl);
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="space-y-4">
                    <div>
                        <AdminUnderlineLabel htmlFor="entitlement_id">
                            Derecho de uso (entitlement) <span className="text-red-500">*</span>
                        </AdminUnderlineLabel>
                        <div className="mt-1.5">
                            <SearchableSelect
                                id="entitlement_id"
                                value={data.entitlement_id}
                                onChange={(v) => setData('entitlement_id', v)}
                                options={entitlementOptions}
                                placeholder="Buscar por cliente, producto o SKU…"
                                noOptionsMessage="No hay entitlements en la lista (máx. 400 recientes)."
                            />
                        </div>
                        <InputError message={errors.entitlement_id} />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            El secreto queda vinculado a la compra/contrato de este cliente.
                        </p>
                    </div>

                    <div>
                        <AdminUnderlineLabel htmlFor="kind">Tipo</AdminUnderlineLabel>
                        <div className="mt-1.5">
                            <AdminUnderlineSelect
                                id="kind"
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
                        <AdminUnderlineLabel htmlFor="label">Etiqueta (opcional)</AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="label"
                            name="label"
                            value={data.label}
                            onChange={(e) => setData('label', e.target.value)}
                            placeholder="Ej. URL del sistema, Token repositorio…"
                            autoComplete="off"
                        />
                        <InputError message={errors.label} />
                    </div>

                    <div>
                        <AdminUnderlineLabel htmlFor="public_ref">
                            Referencia visible (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="public_ref"
                            name="public_ref"
                            value={data.public_ref}
                            onChange={(e) => setData('public_ref', e.target.value)}
                            placeholder="Últimos caracteres o ID público; si lo dejas vacío se infiere del valor."
                            autoComplete="off"
                        />
                        <InputError message={errors.public_ref} />
                    </div>

                    <div>
                        <AdminUnderlineLabel htmlFor="secret_value">
                            Valor secreto <span className="text-red-500">*</span>
                        </AdminUnderlineLabel>
                        <AdminUnderlineTextarea
                            id="secret_value"
                            name="secret_value"
                            value={data.secret_value}
                            onChange={(e) => setData('secret_value', e.target.value)}
                            placeholder="URL, contraseña, token, PEM, etc. Se guarda cifrado; no se muestra luego en listados."
                            rows={5}
                            className="font-mono text-[12px]"
                            autoComplete="off"
                        />
                        <InputError message={errors.secret_value} />
                    </div>

                    <div>
                        <AdminUnderlineLabel htmlFor="expires_at">
                            Caducidad del secreto (opcional)
                        </AdminUnderlineLabel>
                        <AdminUnderlineInput
                            id="expires_at"
                            name="expires_at"
                            type="datetime-local"
                            value={data.expires_at}
                            onChange={(e) => setData('expires_at', e.target.value)}
                        />
                        <InputError message={errors.expires_at} />
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <NeuButtonRaised type="submit" disabled={processing}>
                        {processing ? 'Guardando…' : 'Registrar credencial'}
                    </NeuButtonRaised>
                    <NeuButtonRaised
                        type="button"
                        className="border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground"
                        disabled={processing}
                        onClick={() =>
                            reset({
                                entitlement_id: selectedEntitlementId ?? '',
                                kind: kindOptions[0]?.value ?? 'custom',
                                label: '',
                                public_ref: '',
                                secret_value: '',
                                expires_at: '',
                            })
                        }
                    >
                        Limpiar formulario
                    </NeuButtonRaised>
                </div>
            </NeuCardRaised>
        </form>
    );
}
