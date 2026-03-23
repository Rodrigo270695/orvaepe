import { Form } from '@inertiajs/react';
import { BadgeCheck, Plus, Save, Trash2 } from 'lucide-react';
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

const insetCardClass =
    'neumorph-inset overflow-x-auto rounded-xl border border-border/60 p-4 md:p-5';

function isoToDate(iso: string | null): string {
    if (!iso) return '';
    return iso.slice(0, 10);
}

type Props = {
    profile: CompanyLegalProfileLoaded | null;
};

function CertificateRow({
    cert,
}: {
    cert: DigitalCertificateRow;
}) {
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const destroyAction =
        panel.sunatEmisor.digitalCertificates.destroy.url(cert.id);

    return (
        <div className={insetCardClass}>
            <AdminCrudDeleteModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Eliminar certificado"
                description="Se quitará la referencia en base de datos. El archivo en disco no se borra automáticamente."
                entityLabel={cert.label}
                action={destroyAction}
                method="post"
                methodOverride="delete"
                confirmLabel="Eliminar certificado"
            />

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <BadgeCheck className="size-4 shrink-0 text-[#D28C3C]" />
                    <span className="truncate text-sm font-semibold">
                        {cert.label}
                    </span>
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

            <Form
                {...panel.sunatEmisor.digitalCertificates.update.form.patch(
                    cert.id,
                )}
                options={{ preserveScroll: true }}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                <Label htmlFor={`c-${cert.id}-disk`} className={labelClass}>
                                    Disco
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id={`c-${cert.id}-disk`}
                                    name="storage_disk"
                                    defaultValue={cert.storage_disk}
                                    required
                                    placeholder="local, s3…"
                                    className={inputClass}
                                />
                                <InputError message={errors.storage_disk} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor={`c-${cert.id}-path`} className={labelClass}>
                                Ruta al certificado
                                <RequiredFieldMark />
                            </Label>
                            <Input
                                id={`c-${cert.id}-path`}
                                name="storage_path"
                                defaultValue={cert.storage_path}
                                required
                                className={inputClass}
                            />
                            <InputError message={errors.storage_path} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor={`c-${cert.id}-thumb`} className={labelClass}>
                                    Huella (SHA)
                                </Label>
                                <Input
                                    id={`c-${cert.id}-thumb`}
                                    name="certificate_thumbprint"
                                    defaultValue={cert.certificate_thumbprint ?? ''}
                                    className={inputClass}
                                />
                                <InputError message={errors.certificate_thumbprint} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`c-${cert.id}-serial`} className={labelClass}>
                                    N.º serie
                                </Label>
                                <Input
                                    id={`c-${cert.id}-serial`}
                                    name="serial_number"
                                    defaultValue={cert.serial_number ?? ''}
                                    className={inputClass}
                                />
                                <InputError message={errors.serial_number} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor={`c-${cert.id}-issuer`} className={labelClass}>
                                Emisor CN
                            </Label>
                            <Input
                                id={`c-${cert.id}-issuer`}
                                name="issuer_cn"
                                defaultValue={cert.issuer_cn ?? ''}
                                className={inputClass}
                            />
                            <InputError message={errors.issuer_cn} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor={`c-${cert.id}-vf`} className={labelClass}>
                                    Válido desde
                                </Label>
                                <Input
                                    id={`c-${cert.id}-vf`}
                                    name="valid_from"
                                    type="date"
                                    defaultValue={isoToDate(cert.valid_from)}
                                    className={inputClass}
                                />
                                <InputError message={errors.valid_from} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`c-${cert.id}-vu`} className={labelClass}>
                                    Válido hasta
                                </Label>
                                <Input
                                    id={`c-${cert.id}-vu`}
                                    name="valid_until"
                                    type="date"
                                    defaultValue={isoToDate(cert.valid_until)}
                                    className={inputClass}
                                />
                                <InputError message={errors.valid_until} />
                            </div>
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new-c-label" className={labelClass}>
                                    Etiqueta
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id="new-c-label"
                                    name="label"
                                    required
                                    placeholder="Ej. SUNAT 2026"
                                    className={inputClass}
                                />
                                <InputError message={errors.label} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-c-disk" className={labelClass}>
                                    Disco
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id="new-c-disk"
                                    name="storage_disk"
                                    defaultValue="local"
                                    required
                                    className={inputClass}
                                />
                                <InputError message={errors.storage_disk} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="new-c-path" className={labelClass}>
                                Ruta al certificado
                                <RequiredFieldMark />
                            </Label>
                            <Input
                                id="new-c-path"
                                name="storage_path"
                                required
                                placeholder="certificate/certificado.p12"
                                className={inputClass}
                            />
                            <InputError message={errors.storage_path} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new-c-thumb" className={labelClass}>
                                    Huella (opcional)
                                </Label>
                                <Input
                                    id="new-c-thumb"
                                    name="certificate_thumbprint"
                                    className={inputClass}
                                />
                                <InputError message={errors.certificate_thumbprint} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-c-serial" className={labelClass}>
                                    N.º serie (opcional)
                                </Label>
                                <Input
                                    id="new-c-serial"
                                    name="serial_number"
                                    className={inputClass}
                                />
                                <InputError message={errors.serial_number} />
                            </div>
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
                                {processing ? 'Creando…' : 'Registrar certificado'}
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
                    Referencia al .pfx (u otro almacén) para firmar XML. La
                    contraseña del certificado no se guarda en base de datos.
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
