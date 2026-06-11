import { Form } from '@inertiajs/react';
import { ExternalLink, KeyRound, Link2, Save, SlidersHorizontal, User, Zap } from 'lucide-react';
import * as React from 'react';

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

const inputIconClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2.5 pl-7 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';

const emissionOptions = [
    { value: 'apisunat', label: '⚡ API SUNAT · Lucode PSE (recomendado, sin certificado)' },
    { value: 'sunat_direct', label: 'SUNAT directo · SEE-Del Contribuyente (requiere certificado .p12)' },
    { value: 'ose', label: 'OSE – Operador de Servicios Electrónicos' },
    { value: 'pse', label: 'PSE – Proveedor de Servicios Electrónicos genérico' },
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
    const [mode, setMode] = React.useState<string>(
        setting?.emission_mode ?? 'sunat_direct',
    );

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
        ...certificates.map((c) => ({ value: c.id, label: c.label })),
    ];

    const defaultCertValue =
        setting?.default_certificate_id &&
        certificates.some((c) => c.id === setting.default_certificate_id)
            ? setting.default_certificate_id
            : '_none_';

    const isApiSunat  = mode === 'apisunat';
    const isSunatDirect = mode === 'sunat_direct';
    const isOse = mode === 'ose';
    const isPse = mode === 'pse';
    const needsProviderUrl = isOse || isPse;

    return (
        <div className="space-y-6">
            <header className="flex items-start gap-3">
                <SlidersHorizontal className="mt-0.5 size-4 text-[#D28C3C]" />
                <div>
                    <h2 className="text-sm font-semibold">Integración SUNAT / OSE</h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Modo de emisión, entorno y credenciales. Las contraseñas se
                        cifran con AES-256 y nunca se devuelven al navegador.
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
                        {/* ── Modo y entorno ── */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <AdminUnderlineLabel htmlFor="emission_mode" required>
                                    Modo de emisión
                                </AdminUnderlineLabel>
                                <AdminUnderlineSelect
                                    id="emission_mode"
                                    name="emission_mode"
                                    defaultValue={setting?.emission_mode ?? 'sunat_direct'}
                                    options={emissionOptions}
                                    onValueChange={setMode}
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

                        {/* ── API SUNAT / Lucode PSE ── */}
                        {isApiSunat && (
                            <div className="space-y-4 rounded-xl border border-[#4A9A72]/25 bg-[#4A9A72]/4 p-4">
                                <div className="flex items-start gap-2">
                                    <Zap className="mt-0.5 size-4 shrink-0 text-[#4A9A72]" />
                                    <div>
                                        <p className="text-[11px] font-semibold text-[#4A9A72]">
                                            API SUNAT · Lucode PSE
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                                            Sin certificado propio. Lucode firma y envía a SUNAT por ti.{' '}
                                            Plan gratuito: 20 comprobantes/mes · Plan 01: S/ 8/mes (100 comprobantes).
                                        </p>
                                        <a
                                            href="https://app.apisunat.pe/organization"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#4A9A72] underline underline-offset-2"
                                        >
                                            Ir a app.apisunat.pe para obtener tu token
                                            <ExternalLink className="size-2.5" />
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="apisunat_token" className={labelClass}>
                                        Token API SUNAT
                                        {setting?.has_apisunat_token && (
                                            <span className="ml-2 text-[#4A9A72]">● guardado</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-[#4A9A72]" />
                                        <Input
                                            id="apisunat_token"
                                            name="apisunat_token"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder={
                                                setting?.has_apisunat_token
                                                    ? '••••••••  (dejar vacío para conservar)'
                                                    : 'Pega aquí tu Bearer token de API SUNAT'
                                            }
                                            className={inputIconClass}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Se cifra con AES-256. Encuéntralo en{' '}
                                        <code>app.apisunat.pe → Organizaciones → Token</code>.
                                    </p>
                                    <InputError message={errors.apisunat_token} />
                                </div>

                                <div className="rounded-lg border border-[#4A9A72]/20 bg-[#4A9A72]/6 px-3 py-2 text-[10px] text-[#4A9A72]">
                                    <strong>Paso previo:</strong> Autoriza a Lucode como tu PSE en el portal SOL →
                                    Comprobantes de Pago → PSE → Autorizar proveedor.
                                </div>
                            </div>
                        )}

                        {/* ── Credenciales SUNAT directo ── */}
                        {isSunatDirect && (
                            <div className="space-y-5 rounded-xl border border-[#4A80B8]/20 bg-[#4A80B8]/4 p-4">
                                <p className="text-[11px] font-medium text-[#4A80B8]">
                                    Credenciales SOL — usuario secundario creado en el menú SOL
                                </p>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="sol_username" className={labelClass}>
                                            Usuario SOL (secundario)
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-[#4A80B8]" />
                                            <Input
                                                id="sol_username"
                                                name="sol_username"
                                                defaultValue={setting?.sol_username ?? ''}
                                                placeholder="MODDATOS"
                                                autoComplete="off"
                                                className={inputIconClass}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Sin el RUC. Ej: <code>MODDATOS</code> o el usuario que creaste.
                                        </p>
                                        <InputError message={errors.sol_username} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="sol_password" className={labelClass}>
                                            Clave SOL
                                            {setting?.has_sol_password && (
                                                <span className="ml-2 text-[#4A9A72]">● guardada</span>
                                            )}
                                        </Label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-[#4A80B8]" />
                                            <Input
                                                id="sol_password"
                                                name="sol_password"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder={
                                                    setting?.has_sol_password
                                                        ? '••••••••  (dejar vacío para conservar)'
                                                        : 'Clave SOL del usuario secundario'
                                                }
                                                className={inputIconClass}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Se cifra con AES-256. Nunca se expone al navegador.
                                        </p>
                                        <InputError message={errors.sol_password} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Proveedor OSE / PSE ── */}
                        {needsProviderUrl && (
                            <div className="space-y-5 rounded-xl border border-[#D28C3C]/20 bg-[#D28C3C]/4 p-4">
                                <p className="text-[11px] font-medium text-[#D28C3C]">
                                    {isOse ? 'Datos del Operador de Servicios Electrónicos (OSE)' : 'Datos del Proveedor de Servicios Electrónicos (PSE)'}
                                </p>

                                {isOse && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ose_provider_code" className={labelClass}>
                                            Código proveedor OSE
                                        </Label>
                                        <Input
                                            id="ose_provider_code"
                                            name="ose_provider_code"
                                            defaultValue={setting?.ose_provider_code ?? ''}
                                            placeholder="Ej. NUBEFACT, GREENTER…"
                                            className={inputClass}
                                        />
                                        <InputError message={errors.ose_provider_code} />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="api_base_url" className={labelClass}>
                                        URL base API del proveedor
                                    </Label>
                                    <div className="relative">
                                        <Link2 className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-[#D28C3C]" />
                                        <Input
                                            id="api_base_url"
                                            name="api_base_url"
                                            defaultValue={setting?.api_base_url ?? ''}
                                            placeholder="https://api.proveedor.pe/v1"
                                            className={inputIconClass}
                                        />
                                    </div>
                                    <InputError message={errors.api_base_url} />
                                </div>
                            </div>
                        )}

                        {/* ── Certificado por defecto ── */}
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
                            <p className="text-[10px] text-muted-foreground">
                                El que se usará para firmar XMLs si no se especifica otro.
                            </p>
                            <InputError message={errors.default_certificate_id} />
                        </div>

                        {/* ── Activo ── */}
                        <div className="flex items-center gap-3">
                            <input
                                id="setup-active"
                                name="is_active"
                                type="checkbox"
                                value="1"
                                defaultChecked={setting?.is_active ?? true}
                                className="size-4 cursor-pointer rounded border border-(--o-border2) accent-[#4A9A72]"
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
