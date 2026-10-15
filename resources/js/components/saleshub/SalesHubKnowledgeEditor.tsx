import { router, useForm } from '@inertiajs/react';
import {
    Download,
    Loader2,
    Pencil,
    Plus,
    Save,
    Trash2,
    Undo2,
    X,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import { OpenWaConfirmDialog } from '@/components/operacion/openwa/OpenWaConfirmDialog';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { cn } from '@/lib/utils';

import { SourceBadge } from './SalesHubOverview';
import { SalesHubSectionDialog } from './SalesHubSectionDialog';
import {
    fieldClass,
    SECTION_TIPOS,
    sectionCounts,
    splitKeywords,
} from './salesHubUi';
import type {
    SalesHubKnowledge,
    SalesHubKnowledgeForm,
    SalesHubSection,
    SalesHubSectionTipo,
} from './types';

type Props = {
    productLabel: string;
    knowledge: SalesHubKnowledge;
};

export function SalesHubKnowledgeEditor({ productLabel, knowledge }: Props) {
    const form = useForm<SalesHubKnowledgeForm>(knowledge.form);
    const [importing, setImporting] = useState(false);

    const save = (event?: FormEvent) => {
        event?.preventDefault();
        form.put(knowledge.routes.update, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => form.setDefaults(),
        });
    };

    const importFromSaas = () => {
        setImporting(true);
        router.post(
            knowledge.routes.importar,
            {},
            { preserveScroll: true, onFinish: () => setImporting(false) },
        );
    };

    const field = (name: keyof SalesHubKnowledgeForm) => ({
        name,
        value: form.data[name],
        saasValue: knowledge.saas[name],
        error: form.errors[name],
        onChange: (value: string) => form.setData(name, value),
    });

    return (
        <div className="space-y-5 pb-20">
            <NeuCardRaised className="flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between md:p-5">
                <div className="text-[12px] leading-relaxed text-muted-foreground">
                    <p>
                        <strong className="text-foreground">
                            Lo que escribas aquí manda.
                        </strong>{' '}
                        Lo que dejes vacío lo toma de {productLabel}. Los{' '}
                        <strong className="text-foreground">
                            planes y precios
                        </strong>{' '}
                        no se editan aquí: llegan solos desde {productLabel}.
                    </p>
                </div>
                <NeuButtonRaised
                    type="button"
                    onClick={importFromSaas}
                    disabled={importing || !knowledge.saas_ok}
                    className="shrink-0 self-start md:self-auto"
                    title="Solo llena lo que está vacío en ORVAE. No borra nada."
                >
                    {importing ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                        <Download className="size-4" aria-hidden />
                    )}
                    Copiar lo de {productLabel} a ORVAE
                </NeuButtonRaised>
            </NeuCardRaised>

            <form onSubmit={save} className="space-y-5">
                <Step
                    number={1}
                    title="Cómo se presenta"
                    hint="Con esto abre la conversación y explica qué es."
                >
                    <TextField
                        label="Nombre comercial"
                        placeholder={productLabel}
                        {...field('nombre')}
                    />
                    <TextField
                        label="Qué es, en dos líneas"
                        help="El primer mensaje del bot sale de aquí. Habla del problema que resuelve, no de tecnología."
                        placeholder="Sistema para veterinarias: citas, historias clínicas, ventas y facturación SUNAT en un solo lugar."
                        multiline
                        {...field('resumen')}
                    />
                    <TextField
                        label="Para quién es"
                        help="Ayuda al bot a calificar: si el cliente no encaja, lo dice con honestidad."
                        placeholder="Clínicas veterinarias, pet shops y grooming de 1 a 10 sedes."
                        {...field('publico')}
                    />
                </Step>

                <Step
                    number={2}
                    title="Cómo lo reconoce"
                    hint={`Si un mensaje trae alguna de estas palabras, el bot entiende que preguntan por ${productLabel}.`}
                >
                    <KeywordsField {...field('palabras_clave')} />
                </Step>

                <Step
                    number={3}
                    title="Demo y registro"
                    hint="El bot comparte estos links cuando el cliente quiere probar."
                >
                    <div className="grid gap-5 md:grid-cols-3">
                        <div className="md:col-span-3">
                            <TextField
                                label="Link de la demo"
                                placeholder="https://demo…"
                                type="url"
                                {...field('demo_url')}
                            />
                        </div>
                        <TextField
                            label="Usuario demo"
                            {...field('demo_usuario')}
                        />
                        <TextField
                            label="Clave demo"
                            {...field('demo_password')}
                        />
                        <TextField
                            label="Link de registro"
                            placeholder="https://…/registro"
                            type="url"
                            {...field('registro_url')}
                        />
                    </div>
                </Step>

                <Step
                    number={4}
                    title="Indicaciones para el bot"
                    hint="Órdenes directas de tu equipo. El bot las sigue por encima de todo."
                >
                    <TextField
                        label="Indicaciones"
                        placeholder={
                            'Ej.: Si preguntan por más de 5 sedes, ofrece una llamada.\nNo ofrezcas descuentos.'
                        }
                        multiline
                        {...field('instrucciones')}
                    />
                </Step>

                {form.isDirty ? (
                    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
                        <div className="flex items-center gap-3 rounded-2xl border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur">
                            <span className="text-[12px] font-semibold">
                                Tienes cambios sin guardar
                            </span>
                            <NeuButtonRaised
                                type="button"
                                onClick={() => form.reset()}
                                disabled={form.processing}
                                className="px-3 py-1.5 text-muted-foreground"
                            >
                                Descartar
                            </NeuButtonRaised>
                            <NeuButtonRaised
                                type="submit"
                                disabled={form.processing}
                                className="px-3 py-1.5"
                            >
                                {form.processing ? (
                                    <Loader2
                                        className="size-4 animate-spin"
                                        aria-hidden
                                    />
                                ) : (
                                    <Save className="size-4" aria-hidden />
                                )}
                                Guardar
                            </NeuButtonRaised>
                        </div>
                    </div>
                ) : null}
            </form>

            <SectionsEditor productLabel={productLabel} knowledge={knowledge} />
        </div>
    );
}

function Step({
    number,
    title,
    hint,
    children,
}: {
    number: number;
    title: string;
    hint: string;
    children: ReactNode;
}) {
    return (
        <NeuCardRaised className="rounded-2xl p-4 md:p-5">
            <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#D28C3C]/15 text-xs font-bold text-[#B5762C]">
                    {number}
                </span>
                <div>
                    <h2 className="text-sm font-bold">{title}</h2>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {hint}
                    </p>
                </div>
            </div>
            <div className="mt-5 space-y-5 md:pl-10">{children}</div>
        </NeuCardRaised>
    );
}

type FieldProps = {
    name: keyof SalesHubKnowledgeForm;
    label?: string;
    help?: string;
    placeholder?: string;
    type?: string;
    multiline?: boolean;
    value: string;
    saasValue: string;
    error?: string;
    onChange: (value: string) => void;
};

function TextField({
    name,
    label,
    help,
    placeholder,
    type = 'text',
    multiline = false,
    value,
    saasValue,
    error,
    onChange,
}: FieldProps) {
    const id = `saleshub-${name}`;
    const inputProps = {
        id,
        className: cn(fieldClass, multiline && 'min-h-24 resize-y'),
        value,
        placeholder: saasValue || placeholder,
        onChange: (e: { target: { value: string } }) =>
            onChange(e.target.value),
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
                {label ? (
                    <AdminUnderlineLabel htmlFor={id}>
                        {label}
                    </AdminUnderlineLabel>
                ) : (
                    <span />
                )}
                <SourceBadge
                    source={
                        value.trim() ? 'orvae' : saasValue ? 'saas' : 'falta'
                    }
                    optional={name === 'instrucciones'}
                />
            </div>
            {help ? (
                <p className="text-[11px] text-muted-foreground">{help}</p>
            ) : null}
            {multiline ? (
                <textarea {...inputProps} />
            ) : (
                <input type={type} {...inputProps} />
            )}
            <SaasHint value={value} saasValue={saasValue} onChange={onChange} />
            {error ? (
                <p className="text-[11px] text-destructive">{error}</p>
            ) : null}
        </div>
    );
}

function SaasHint({
    value,
    saasValue,
    onChange,
}: {
    value: string;
    saasValue: string;
    onChange: (value: string) => void;
}) {
    if (!saasValue) {
        return null;
    }

    if (!value.trim()) {
        return (
            <button
                type="button"
                onClick={() => onChange(saasValue)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:underline dark:text-sky-400"
            >
                <Pencil className="size-3" aria-hidden /> Hoy usa lo del SaaS
                (en gris). Editar a partir de eso
            </button>
        );
    }

    if (value.trim() !== saasValue.trim()) {
        return (
            <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
            >
                <Undo2 className="size-3" aria-hidden /> Volver a usar lo del
                SaaS
            </button>
        );
    }

    return null;
}

function KeywordsField({ value, saasValue, error, onChange }: FieldProps) {
    const [draft, setDraft] = useState('');
    const keywords = splitKeywords(value);
    const inherited = keywords.length === 0 ? splitKeywords(saasValue) : [];

    const add = () => {
        const next = splitKeywords(`${value},${draft}`);
        onChange(next.join(', '));
        setDraft('');
    };

    const remove = (keyword: string) =>
        onChange(keywords.filter((k) => k !== keyword).join(', '));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <AdminUnderlineLabel htmlFor="saleshub-palabras_clave">
                    Palabras clave
                </AdminUnderlineLabel>
                <SourceBadge
                    source={
                        keywords.length > 0
                            ? 'orvae'
                            : inherited.length > 0
                              ? 'saas'
                              : 'falta'
                    }
                />
            </div>
            <div className="flex flex-wrap gap-1.5">
                {keywords.map((keyword) => (
                    <span
                        key={keyword}
                        className="inline-flex items-center gap-1 rounded-full bg-[#D28C3C]/15 py-0.5 pr-1 pl-2.5 text-[11px] font-semibold text-[#B5762C]"
                    >
                        {keyword}
                        <button
                            type="button"
                            onClick={() => remove(keyword)}
                            className="rounded-full p-0.5 hover:bg-[#D28C3C]/20"
                            aria-label={`Quitar ${keyword}`}
                        >
                            <X className="size-3" aria-hidden />
                        </button>
                    </span>
                ))}
                {inherited.map((keyword) => (
                    <span
                        key={keyword}
                        className="rounded-full border border-dashed px-2.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                        {keyword}
                    </span>
                ))}
            </div>
            <input
                id="saleshub-palabras_clave"
                className={fieldClass}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        add();
                    }
                }}
                onBlur={() => draft.trim() && add()}
                placeholder="Escribe una palabra y presiona Enter (ej.: veterinaria, clínica, mascotas)"
            />
            {inherited.length > 0 ? (
                <button
                    type="button"
                    onClick={() => onChange(inherited.join(', '))}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:underline dark:text-sky-400"
                >
                    <Pencil className="size-3" aria-hidden /> Hoy usa las del
                    SaaS (punteadas). Editar a partir de esas
                </button>
            ) : null}
            {error ? (
                <p className="text-[11px] text-destructive">{error}</p>
            ) : null}
        </div>
    );
}

function SectionsEditor({ productLabel, knowledge }: Props) {
    const [dialog, setDialog] = useState<{
        section: SalesHubSection | null;
        tipo: SalesHubSectionTipo;
    } | null>(null);
    const [deleting, setDeleting] = useState<SalesHubSection | null>(null);
    const blocks = sectionCounts(knowledge);
    const saasTotal = Object.values(knowledge.saas_tipos).reduce(
        (sum, n) => sum + (n ?? 0),
        0,
    );

    return (
        <NeuCardRaised className="rounded-2xl p-4 md:p-5">
            <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#D28C3C]/15 text-xs font-bold text-[#B5762C]">
                    5
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-sm font-bold">
                            Bloques de conocimiento
                        </h2>
                        <SourceBadge source={blocks.source} />
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {blocks.source === 'orvae'
                            ? `El bot usa solo los bloques activos de aquí${saasTotal > 0 ? ` (ignora los ${saasTotal} de ${productLabel})` : ''}.`
                            : saasTotal > 0
                              ? `Hoy usa los ${saasTotal} bloques de ${productLabel}. En cuanto actives uno aquí, usa solo los de ORVAE.`
                              : 'Agrega lo que el bot debe saber para responder bien.'}
                    </p>
                </div>
            </div>

            <div className="mt-5 space-y-6 md:pl-10">
                {SECTION_TIPOS.map((tipo) => {
                    const items = knowledge.sections.filter(
                        (section) => section.tipo === tipo.key,
                    );
                    const fromSaas = knowledge.saas_tipos[tipo.key] ?? 0;

                    return (
                        <section
                            key={tipo.key}
                            aria-labelledby={`saleshub-tipo-${tipo.key}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3
                                        id={`saleshub-tipo-${tipo.key}`}
                                        className="text-xs font-bold"
                                    >
                                        {tipo.plural}
                                        <span className="ml-1.5 font-medium text-muted-foreground tabular-nums">
                                            {items.length}
                                            {fromSaas > 0
                                                ? ` · ${fromSaas} en ${productLabel}`
                                                : ''}
                                        </span>
                                    </h3>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        {tipo.help}
                                    </p>
                                </div>
                                <NeuButtonRaised
                                    type="button"
                                    onClick={() =>
                                        setDialog({
                                            section: null,
                                            tipo: tipo.key,
                                        })
                                    }
                                    className="shrink-0 px-2.5 py-1 text-[11px]"
                                >
                                    <Plus className="size-3.5" aria-hidden />{' '}
                                    Agregar
                                </NeuButtonRaised>
                            </div>

                            {items.length > 0 ? (
                                <ul className="mt-2 space-y-1.5">
                                    {items.map((section) => (
                                        <li
                                            key={section.id}
                                            className={cn(
                                                'group flex items-start gap-3 rounded-xl bg-muted/40 px-3 py-2.5',
                                                !section.activo && 'opacity-60',
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="flex items-center gap-2 text-xs font-semibold">
                                                    {section.titulo}
                                                    {!section.activo ? (
                                                        <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                                                            apagado
                                                        </span>
                                                    ) : null}
                                                </p>
                                                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                                                    {section.contenido}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDialog({
                                                            section,
                                                            tipo: section.tipo,
                                                        })
                                                    }
                                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
                                                    aria-label={`Editar ${section.titulo}`}
                                                >
                                                    <Pencil
                                                        className="size-3.5"
                                                        aria-hidden
                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleting(section)
                                                    }
                                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-destructive"
                                                    aria-label={`Eliminar ${section.titulo}`}
                                                >
                                                    <Trash2
                                                        className="size-3.5"
                                                        aria-hidden
                                                    />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </section>
                    );
                })}
            </div>

            <SalesHubSectionDialog
                open={dialog !== null}
                onOpenChange={(value) => !value && setDialog(null)}
                section={dialog?.section ?? null}
                defaultTipo={dialog?.tipo}
                storeUrl={knowledge.routes.bloques}
            />

            {deleting ? (
                <OpenWaConfirmDialog
                    open
                    onOpenChange={(value) => !value && setDeleting(null)}
                    title="Eliminar bloque"
                    description={`«${deleting.titulo}» deja de usarse en las respuestas del bot.`}
                    confirmLabel="Eliminar"
                    url={deleting.routes.destroy}
                    method="delete"
                />
            ) : null}
        </NeuCardRaised>
    );
}
