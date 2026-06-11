import { Form } from '@inertiajs/react';
import { BadgeCheck, FileKey2, KeyRound, Plus, Save, Trash2, Upload } from 'lucide-react';
import * as React from 'react';

import AdminCrudDeleteModal from '@/components/admin/crud/AdminCrudDeleteModal';
import InputError from '@/components/input-error';
import RequiredFieldMark from '@/components/sunat/emisor/RequiredFieldMark';
import type {
    CompanyLegalProfileLoaded,
    DigitalCertificateRow,
} from '@/components/sunat/emisor/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NeuButtonInset } from '@/components/ui/neu-button-inset';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import panel from '@/routes/panel';

const labelClass =
    'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';

const inputClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2.5 pl-1 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:ring-0';

const fileInputClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2 pl-1 pr-2 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] file:mr-3 file:rounded file:border-0 file:bg-[var(--o-amber)]/10 file:px-2 file:py-1 file:text-[11px] file:text-[var(--o-amber)] file:cursor-pointer focus:outline-none focus-visible:ring-0';

const insetCardClass =
    'neumorph-inset overflow-x-auto rounded-xl border border-border/60 p-4 md:p-5';

/** Extrae solo el nombre de archivo de una ruta de almacenamiento. */
function basename(path: string): string {
    return path.split('/').pop() ?? path;
}

type Props = {
    profile: CompanyLegalProfileLoaded | null;
};

function CertificateRow({ cert }: { cert: DigitalCertificateRow }) {
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const destroyAction = panel.sunatEmisor.digitalCertificates.destroy.url(cert.id);

    return (
        <div className={insetCardClass}>
            <AdminCrudDeleteModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Eliminar certificado"
                description="Se eliminará el archivo del disco y la referencia en base de datos."
                entityLabel={cert.label}
                action={destroyAction}
                method="post"
                methodOverride="delete"
                confirmLabel="Eliminar certificado"
            />

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <BadgeCheck className="size-4 shrink-0 text-[#D28C3C]" />
                    <span className="truncate text-sm font-semibold">{cert.label}</span>
                    {cert.is_active ? (
                        <span className="shrink-0 rounded-full bg-[#4A9A72]/12 px-2 py-0.5 text-[10px] text-[#4A9A72]">
                            Activo
                        </span>
                    ) : (
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            Inactivo
                        </span>
                    )}
                </div>
                <NeuButtonInset
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="inline-flex shrink-0 cursor-pointer flex-row items-center gap-2 whitespace-nowrap text-[#C05050]"
                >
                    <Trash2 className="size-4 shrink-0" />
                    Eliminar
                </NeuButtonInset>
            </div>

            {/* Info del archivo actual */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-(--o-amber)/5 px-3 py-2 text-[11px] text-muted-foreground">
                <FileKey2 className="size-3.5 shrink-0 text-[#D28C3C]" />
                <span>
                    Archivo actual:{' '}
                    <code className="font-mono text-foreground">{basename(cert.storage_path)}</code>
                </span>
                {cert.has_password && (
                    <span className="ml-2 flex items-center gap-1 text-[#4A9A72]">
                        <KeyRound className="size-3" />
                        contraseña guardada
                    </span>
                )}
            </div>

            <Form
                {...panel.sunatEmisor.digitalCertificates.update.form.patch(cert.id)}
                options={{ preserveScroll: true }}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-1.5">
                            <Label htmlFor={`c-${cert.id}-label`} className={labelClass}>
                                Etiqueta
                                <RequiredFieldMark />
                            </Label>
                            <Input
                                id={`c-${cert.id}-label`}
                                name="label"
                                defaultValue={cert.label}
                                required
                                className={inputClass}
                            />
                            <InputError message={errors.label} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor={`c-${cert.id}-file`} className={labelClass}>
                                Reemplazar certificado (.p12 / .pfx)
                                <span className="ml-1 text-muted-foreground">(opcional)</span>
                            </Label>
                            <div className="relative">
                                <Upload className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-[#D28C3C]" />
                                <input
                                    id={`c-${cert.id}-file`}
                                    name="certificate_file"
                                    type="file"
                                    accept=".p12,.pfx"
                                    className={`${fileInputClass} pl-7`}
                                />
                            </div>
                            <InputError message={errors.certificate_file} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor={`c-${cert.id}-pwd`} className={labelClass}>
                                {cert.has_password
                                    ? 'Nueva contraseña del certificado (dejar vacío para conservar)'
                                    : 'Contraseña del certificado (opcional)'}
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-[#D28C3C]" />
                                <Input
                                    id={`c-${cert.id}-pwd`}
                                    name="certificate_password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder={cert.has_password ? '••••••••' : 'Sin contraseña'}
                                    className={`${inputClass} pl-7`}
                                />
                            </div>
                            <InputError message={errors.certificate_password} />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id={`c-${cert.id}-active`}
                                name="is_active"
                                type="checkbox"
                                value="1"
                                defaultChecked={cert.is_active}
                                className="size-4 cursor-pointer rounded border border-(--o-border2) accent-[#4A9A72]"
                            />
                            <Label
                                htmlFor={`c-${cert.id}-active`}
                                className={`${labelClass} cursor-pointer`}
                            >
                                Activo
                            </Label>
                        </div>

                        <div className="flex justify-end pt-2">
                            <NeuButtonRaised
                                type="submit"
                                disabled={processing}
                                className="cursor-pointer"
                            >
                                <Save className="size-4 text-[#D28C3C]" />
                                {processing ? 'Guardando…' : 'Guardar certificado'}
                            </NeuButtonRaised>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

function AddCertificateForm({
    onCancel,
    showCancel,
}: {
    onCancel?: () => void;
    showCancel?: boolean;
}) {
    return (
        <div className={insetCardClass}>
            <div className="mb-4 flex items-center gap-2">
                <Plus className="size-4 text-[#4A9A72]" />
                <h3 className="text-sm font-semibold">Añadir certificado</h3>
            </div>

            <Form
                {...panel.sunatEmisor.digitalCertificates.store.form.post()}
                options={{ preserveScroll: true }}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-1.5">
                            <Label htmlFor="new-c-label" className={labelClass}>
                                Etiqueta
                                <RequiredFieldMark />
                            </Label>
                            <Input
                                id="new-c-label"
                                name="label"
                                required
                                placeholder="Ej. CDT SUNAT 2026"
                                className={inputClass}
                            />
                            <InputError message={errors.label} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="new-c-file" className={labelClass}>
                                Archivo del certificado (.p12 / .pfx)
                                <RequiredFieldMark />
                            </Label>
                            <div className="relative">
                                <Upload className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-[#D28C3C]" />
                                <input
                                    id="new-c-file"
                                    name="certificate_file"
                                    type="file"
                                    accept=".p12,.pfx"
                                    required
                                    className={`${fileInputClass} pl-7`}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                El archivo se almacena de forma privada en el servidor (no es público).
                            </p>
                            <InputError message={errors.certificate_file} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="new-c-pwd" className={labelClass}>
                                Contraseña del certificado
                                <span className="ml-1 text-muted-foreground">(si aplica)</span>
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-1 top-1/2 size-3.5 -translate-y-1/2 text-[#D28C3C]" />
                                <Input
                                    id="new-c-pwd"
                                    name="certificate_password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Contraseña con la que protegiste el .p12"
                                    className={`${inputClass} pl-7`}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Se guarda cifrada con AES-256. Necesaria para firmar XMLs en tiempo de ejecución.
                            </p>
                            <InputError message={errors.certificate_password} />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="new-c-active"
                                name="is_active"
                                type="checkbox"
                                value="1"
                                defaultChecked
                                className="size-4 cursor-pointer rounded border border-(--o-border2) accent-[#4A9A72]"
                            />
                            <Label
                                htmlFor="new-c-active"
                                className={`${labelClass} cursor-pointer`}
                            >
                                Activo
                            </Label>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                            {showCancel ? (
                                <NeuButtonInset
                                    type="button"
                                    className="cursor-pointer"
                                    onClick={onCancel}
                                >
                                    Cancelar
                                </NeuButtonInset>
                            ) : null}
                            <NeuButtonRaised
                                type="submit"
                                disabled={processing}
                                className="cursor-pointer"
                            >
                                <Plus className="size-4 text-[#4A9A72]" />
                                {processing ? 'Subiendo…' : 'Registrar certificado'}
                            </NeuButtonRaised>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

export default function EmisorCertificatesPanel({ profile }: Props) {
    const certs = profile?.digital_certificates ?? [];
    const hasCertificates = certs.length > 0;

    const [showAddForm, setShowAddForm] = React.useState(!hasCertificates);

    React.useEffect(() => {
        if (!hasCertificates) {
            setShowAddForm(true);
        }
    }, [hasCertificates]);

    if (!profile) {
        return (
            <p className="text-sm text-muted-foreground">
                Primero completa el <strong>perfil legal</strong> en la pestaña
                anterior para poder registrar certificados digitales.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-sm font-semibold">Certificados digitales</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                    Sube tu archivo .p12 (CDT gratuito de SUNAT u otro). La contraseña
                    se cifra con AES-256 y nunca se expone al navegador.
                </p>
            </header>

            {certs.map((c) => (
                <CertificateRow key={c.id} cert={c} />
            ))}

            {hasCertificates && !showAddForm ? (
                <div className="flex justify-start">
                    <NeuButtonRaised
                        type="button"
                        className="cursor-pointer"
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus className="size-4 text-[#4A9A72]" />
                        Añadir nuevo certificado
                    </NeuButtonRaised>
                </div>
            ) : null}

            {(!hasCertificates || showAddForm) && (
                <AddCertificateForm
                    showCancel={hasCertificates}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
        </div>
    );
}
