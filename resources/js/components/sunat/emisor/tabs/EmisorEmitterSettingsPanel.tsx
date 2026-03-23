import { Form } from '@inertiajs/react';
import { Save, SlidersHorizontal } from 'lucide-react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import AdminUnderlineSelect from '@/components/admin/form/admin-underline-select';
import InputError from '@/components/input-error';
import type {
    CompanyLegalProfileLoaded,
    DigitalCertificateRow,
    SunatEmitterSettingRow,
} from '@/components/sunat/emisor/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import panel from '@/routes/panel';

const labelClass =
    'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';

const inputClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2.5 pl-1 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';

const emissionOptions = [
    { value: 'sunat_direct', label: 'SUNAT directo' },
    { value: 'ose', label: 'OSE' },
    { value: 'pse', label: 'PSE' },
];

const environmentOptions = [
    { value: 'beta', label: 'Beta / pruebas' },
    { value: 'production', label: 'Producción' },
];

type Props = {
    profile: CompanyLegalProfileLoaded | null;
    setting: SunatEmitterSettingRow | null;
    certificates: DigitalCertificateRow[];
};

export default function EmisorEmitterSettingsPanel({
    profile,
    setting,
    certificates,
}: Props) {
    if (!profile) {
        return (
            <p className="text-sm text-muted-foreground">
                Primero completa el <strong>perfil legal</strong> para configurar
                la integración con SUNAT / OSE / PSE.
            </p>
        );
    }

    const defaultCertOptions = [
        { value: '_none_', label: 'Sin certificado por defecto' },
        ...certificates.map((c) => ({
            value: c.id,
            label: c.label,
        })),
    ];

    const defaultCertValue =
        setting?.default_certificate_id &&
        certificates.some((c) => c.id === setting.default_certificate_id)
            ? setting.default_certificate_id
            : '_none_';

    return (
        <div className="space-y-6">
            <header className="flex items-start gap-3">
                <div className="mt-0.5">
                    <SlidersHorizontal className="size-4 text-[#D28C3C]" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold">Integración SUNAT / OSE</h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Modo de emisión, entorno y referencias a credenciales (sin
                        guardar secretos en texto plano).
                    </p>
                </div>
            </header>

            <Form
                {...panel.sunatEmisor.emitterSettings.upsert.form.patch()}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <AdminUnderlineLabel htmlFor="emission_mode" required>
                                    Modo de emisión
                                </AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id="emission_mode"
                                    name="emission_mode"
                                    defaultValue={
                                        setting?.emission_mode ?? 'sunat_direct'
                                    }
                                    options={emissionOptions}
                                />
                                <InputError message={errors.emission_mode} />
                            </div>

                            <div className="space-y-2">
                                <AdminUnderlineLabel htmlFor="environment" required>
                                    Entorno
                                </AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id="environment"
                                    name="environment"
                                    defaultValue={setting?.environment ?? 'beta'}
                                    options={environmentOptions}
                                />
                                <InputError message={errors.environment} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="ose_provider_code" className={labelClass}>
                                    Código proveedor OSE
                                </Label>
                                <Input
                                    id="ose_provider_code"
                                    name="ose_provider_code"
                                    defaultValue={setting?.ose_provider_code ?? ''}
                                    className={inputClass}
                                />
                                <InputError message={errors.ose_provider_code} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sunat_username_hint" className={labelClass}>
                                    Pista usuario SOL
                                </Label>
                                <Input
                                    id="sunat_username_hint"
                                    name="sunat_username_hint"
                                    defaultValue={setting?.sunat_username_hint ?? ''}
                                    placeholder="Últimos caracteres"
                                    className={inputClass}
                                />
                                <InputError message={errors.sunat_username_hint} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="api_base_url" className={labelClass}>
                                URL base API (proveedor)
                            </Label>
                            <Input
                                id="api_base_url"
                                name="api_base_url"
                                defaultValue={setting?.api_base_url ?? ''}
                                placeholder="https://…"
                                className={inputClass}
                            />
                            <InputError message={errors.api_base_url} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="credentials_secret_ref" className={labelClass}>
                                Referencia a secretos (vault / id)
                            </Label>
                            <Input
                                id="credentials_secret_ref"
                                name="credentials_secret_ref"
                                defaultValue={setting?.credentials_secret_ref ?? ''}
                                placeholder="Identificador en tu gestor de secretos"
                                className={inputClass}
                            />
                            <InputError message={errors.credentials_secret_ref} />
                        </div>

                        <div className="space-y-2">
                            <AdminUnderlineLabel htmlFor="default_certificate_id">
                                Certificado por defecto
                            </AdminUnderlineLabel>
                            <AdminUnderlineSelect
                                id="default_certificate_id"
                                name="default_certificate_id"
                                defaultValue={defaultCertValue}
                                options={defaultCertOptions}
                            />
                            <InputError message={errors.default_certificate_id} />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="setup-active"
                                name="is_active"
                                type="checkbox"
                                value="1"
                                defaultChecked={setting?.is_active ?? true}
                                className="size-4 cursor-pointer rounded border border-[var(--o-border2)] accent-[#4A9A72]"
                            />
                            <Label
                                htmlFor="setup-active"
                                className={`${labelClass} cursor-pointer`}
                            >
                                Configuración activa
                            </Label>
                        </div>

                        <div className="flex justify-end pt-2">
                            <NeuButtonRaised
                                type="submit"
                                disabled={processing}
                                className="cursor-pointer"
                            >
                                <Save className="size-4 text-[#4A80B8]" />
                                {processing ? 'Guardando…' : 'Guardar setup'}
                            </NeuButtonRaised>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}
