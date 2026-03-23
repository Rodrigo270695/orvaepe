import { Form } from '@inertiajs/react';
import { ListOrdered, Plus, Save, Trash2 } from 'lucide-react';
import * as React from 'react';

import AdminCrudDeleteModal from '@/components/admin/crud/AdminCrudDeleteModal';
import InputError from '@/components/input-error';
import RequiredFieldMark from '@/components/sunat/emisor/RequiredFieldMark';
import type {
    CompanyLegalProfileLoaded,
    InvoiceDocumentSequenceRow,
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

type Props = {
    profile: CompanyLegalProfileLoaded | null;
};

function SequenceRow({ row }: { row: InvoiceDocumentSequenceRow }) {
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const destroyAction =
        panel.sunatEmisor.invoiceSequences.destroy.url(row.id);

    return (
        <div className={insetCardClass}>
            <AdminCrudDeleteModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Eliminar secuencia"
                description="Se eliminará esta fila de numeración. No borra comprobantes ya emitidos en SUNAT."
                entityLabel={`${row.document_type_code} · ${row.serie} · Est. ${row.establishment_code}`}
                action={destroyAction}
                method="post"
                methodOverride="delete"
                confirmLabel="Eliminar secuencia"
            />

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <ListOrdered className="size-4 shrink-0 text-[#D28C3C]" />
                    <span className="truncate font-mono text-sm font-semibold">
                        {row.document_type_code} · {row.serie} · Est.{' '}
                        {row.establishment_code}
                    </span>
                    {row.is_active ? (
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
                {...panel.sunatEmisor.invoiceSequences.update.form.patch(row.id)}
                options={{ preserveScroll: true }}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1.5">
                                <Label htmlFor={`s-${row.id}-tipo`} className={labelClass}>
                                    Tipo doc.
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id={`s-${row.id}-tipo`}
                                    name="document_type_code"
                                    defaultValue={row.document_type_code}
                                    required
                                    className={inputClass}
                                />
                                <InputError message={errors.document_type_code} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`s-${row.id}-serie`} className={labelClass}>
                                    Serie
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id={`s-${row.id}-serie`}
                                    name="serie"
                                    defaultValue={row.serie}
                                    required
                                    className={inputClass}
                                />
                                <InputError message={errors.serie} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`s-${row.id}-est`} className={labelClass}>
                                    Establecimiento
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id={`s-${row.id}-est`}
                                    name="establishment_code"
                                    defaultValue={row.establishment_code}
                                    required
                                    className={inputClass}
                                />
                                <InputError message={errors.establishment_code} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`s-${row.id}-next`} className={labelClass}>
                                    Siguiente correlativo
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id={`s-${row.id}-next`}
                                    name="next_correlative"
                                    type="number"
                                    min={1}
                                    defaultValue={row.next_correlative}
                                    required
                                    className={inputClass}
                                />
                                <InputError message={errors.next_correlative} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor={`s-${row.id}-from`} className={labelClass}>
                                    Rango desde (opcional)
                                </Label>
                                <Input
                                    id={`s-${row.id}-from`}
                                    name="correlative_from"
                                    type="number"
                                    min={1}
                                    defaultValue={row.correlative_from ?? ''}
                                    className={inputClass}
                                />
                                <InputError message={errors.correlative_from} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`s-${row.id}-to`} className={labelClass}>
                                    Rango hasta (opcional)
                                </Label>
                                <Input
                                    id={`s-${row.id}-to`}
                                    name="correlative_to"
                                    type="number"
                                    min={1}
                                    defaultValue={row.correlative_to ?? ''}
                                    className={inputClass}
                                />
                                <InputError message={errors.correlative_to} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id={`s-${row.id}-active`}
                                name="is_active"
                                type="checkbox"
                                value="1"
                                defaultChecked={row.is_active}
                                className="size-4 cursor-pointer rounded border border-(--o-border2) accent-[#4A9A72]"
                            />
                            <Label
                                htmlFor={`s-${row.id}-active`}
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
                                {processing ? 'Guardando…' : 'Guardar secuencia'}
                            </NeuButtonRaised>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

function AddSequenceForm({
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
                <h3 className="text-sm font-semibold">Añadir secuencia</h3>
            </div>

            <Form
                {...panel.sunatEmisor.invoiceSequences.store.form.post()}
                options={{ preserveScroll: true }}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="new-s-tipo" className={labelClass}>
                                    Tipo doc.
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id="new-s-tipo"
                                    name="document_type_code"
                                    required
                                    placeholder="01"
                                    className={inputClass}
                                />
                                <InputError message={errors.document_type_code} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-s-serie" className={labelClass}>
                                    Serie
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id="new-s-serie"
                                    name="serie"
                                    required
                                    placeholder="F001"
                                    className={inputClass}
                                />
                                <InputError message={errors.serie} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-s-est" className={labelClass}>
                                    Establecimiento
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id="new-s-est"
                                    name="establishment_code"
                                    required
                                    placeholder="001"
                                    className={inputClass}
                                />
                                <InputError message={errors.establishment_code} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-s-next" className={labelClass}>
                                    Siguiente correlativo
                                    <RequiredFieldMark />
                                </Label>
                                <Input
                                    id="new-s-next"
                                    name="next_correlative"
                                    type="number"
                                    min={1}
                                    defaultValue={1}
                                    required
                                    className={inputClass}
                                />
                                <InputError message={errors.next_correlative} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new-s-from" className={labelClass}>
                                    Rango desde
                                </Label>
                                <Input
                                    id="new-s-from"
                                    name="correlative_from"
                                    type="number"
                                    min={1}
                                    className={inputClass}
                                />
                                <InputError message={errors.correlative_from} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-s-to" className={labelClass}>
                                    Rango hasta
                                </Label>
                                <Input
                                    id="new-s-to"
                                    name="correlative_to"
                                    type="number"
                                    min={1}
                                    className={inputClass}
                                />
                                <InputError message={errors.correlative_to} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="new-s-active"
                                name="is_active"
                                type="checkbox"
                                value="1"
                                defaultChecked
                                className="size-4 cursor-pointer rounded border border-(--o-border2) accent-[#4A9A72]"
                            />
                            <Label
                                htmlFor="new-s-active"
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
                                {processing ? 'Creando…' : 'Registrar secuencia'}
                            </NeuButtonRaised>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

export default function EmisorInvoiceSequencesPanel({ profile }: Props) {
    const rows = profile?.invoice_document_sequences ?? [];
    const hasRows = rows.length > 0;

    const [showAddForm, setShowAddForm] = React.useState(!hasRows);

    React.useEffect(() => {
        if (!hasRows) {
            setShowAddForm(true);
        }
    }, [hasRows]);

    if (!profile) {
        return (
            <p className="text-sm text-muted-foreground">
                Primero completa el <strong>perfil legal</strong> para definir series
                y correlativos SUNAT.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-sm font-semibold">Secuencias documentarias</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                    Tipo SUNAT (01 factura, 03 boleta…), serie, establecimiento y
                    siguiente correlativo. El incremento al emitir debe ser
                    transaccional.
                </p>
            </header>

            {rows.map((row) => (
                <SequenceRow key={row.id} row={row} />
            ))}

            {hasRows && !showAddForm ? (
                <div className="flex justify-start">
                    <NeuButtonRaised
                        type="button"
                        className="cursor-pointer"
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus className="size-4 text-[#4A9A72]" />
                        Añadir nueva secuencia
                    </NeuButtonRaised>
                </div>
            ) : null}

            {(!hasRows || showAddForm) && (
                <AddSequenceForm
                    showCancel={hasRows}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
        </div>
    );
}
