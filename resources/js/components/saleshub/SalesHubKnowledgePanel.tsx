import { Link, router, useForm } from '@inertiajs/react';
import {
    CloudDownload,
    Loader2,
    Pencil,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import { OpenWaConfirmDialog } from '@/components/operacion/openwa/OpenWaConfirmDialog';
import { saasColor } from '@/components/operacion/openwa/saasColors';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { cn } from '@/lib/utils';

import { SalesHubSectionDialog } from './SalesHubSectionDialog';
import {
    fieldClass,
    formatDateTime,
    formatPrice,
    sectionTipoLabel,
} from './salesHubUi';
import type {
    SalesHubKnowledge,
    SalesHubKnowledgeForm,
    SalesHubProductItem,
    SalesHubSection,
} from './types';

type Props = {
    products: SalesHubProductItem[];
    knowledge: SalesHubKnowledge | null;
    indexUrl: string;
};

const FIELDS: {
    key: keyof SalesHubKnowledgeForm;
    label: string;
    textarea?: boolean;
    hint?: string;
}[] = [
    { key: 'nombre', label: 'Nombre comercial' },
    {
        key: 'resumen',
        label: 'Resumen (qué es y qué resuelve)',
        textarea: true,
    },
    { key: 'publico', label: 'Para quién es' },
    {
        key: 'palabras_clave',
        label: 'Palabras clave',
        hint: 'Separadas por coma. Si el cliente escribe una, el bot sabe que pregunta por este SaaS.',
    },
    { key: 'demo_url', label: 'Demo · link' },
    { key: 'demo_usuario', label: 'Demo · usuario' },
    { key: 'demo_password', label: 'Demo · clave' },
    { key: 'registro_url', label: 'Link de registro y pago' },
    {
        key: 'instrucciones',
        label: 'Indicaciones para el bot',
        textarea: true,
        hint: 'Reglas propias de este SaaS: promociones vigentes, qué no ofrecer, cómo cerrar, etc.',
    },
];

export function SalesHubKnowledgePanel({
    products,
    knowledge,
    indexUrl,
}: Props) {
    const [sectionDialog, setSectionDialog] = useState<{
        open: boolean;
        section: SalesHubSection | null;
    }>({
        open: false,
        section: null,
    });
    const [deleting, setDeleting] = useState<SalesHubSection | null>(null);
    const [importing, setImporting] = useState(false);

    const form = useForm<SalesHubKnowledgeForm>(knowledge?.form ?? emptyForm());

    useEffect(() => {
        form.setDefaults(knowledge?.form ?? emptyForm());
        form.setData(knowledge?.form ?? emptyForm());
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [knowledge?.producto, knowledge?.form]);

    if (products.length === 0 || knowledge === null) {
        return (
            <NeuCardRaised className="rounded-xl p-8 text-center">
                <p className="text-sm font-bold">No hay SaaS conectados</p>
                <p className="mx-auto mt-1 max-w-sm text-[11px] text-muted-foreground">
                    Activa la provisión de cada sistema en el .env para poder
                    configurar cómo se vende.
                </p>
            </NeuCardRaised>
        );
    }

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(knowledge.routes.update, { preserveScroll: true });
    };

    const onImport = () => {
        setImporting(true);
        router.post(
            knowledge.routes.importar,
            {},
            { preserveScroll: true, onFinish: () => setImporting(false) },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {products.map((product) => {
                    const active = product.key === knowledge.producto;
                    const color = saasColor(product.key);

                    return (
                        <Link
                            key={product.key}
                            href={indexUrl}
                            data={{
                                tab: 'conocimiento',
                                producto: product.key,
                            }}
                            preserveScroll
                            className={cn(
                                'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors',
                                active
                                    ? 'bg-background shadow-sm'
                                    : 'border-transparent text-muted-foreground hover:bg-muted',
                            )}
                            style={active ? { borderColor: color } : undefined}
                        >
                            <span
                                className="size-2 rounded-full"
                                style={{ background: color }}
                                aria-hidden
                            />
                            {product.label}
                            <span className="text-[10px] font-normal text-muted-foreground">
                                {product.editado
                                    ? `ORVAE · ${product.secciones} bloques`
                                    : 'usa lo del SaaS'}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-sm font-bold">Planes y precios</h2>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            {knowledge.saas_ok
                                ? `Se leen del SaaS (actualizado ${formatDateTime(knowledge.saas_obtenido_at)}). Para cambiarlos, edítalos en el propio sistema.`
                                : 'El SaaS no publica su conocimiento todavía: el bot no podrá dar precios de este sistema.'}
                        </p>
                    </div>
                    <NeuButtonRaised
                        type="button"
                        onClick={onImport}
                        disabled={importing}
                        className="self-start"
                    >
                        {importing ? (
                            <Loader2
                                className="size-4 animate-spin"
                                aria-hidden
                            />
                        ) : (
                            <CloudDownload className="size-4" aria-hidden />
                        )}
                        Copiar lo del SaaS a ORVAE
                    </NeuButtonRaised>
                </div>

                {knowledge.planes.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {knowledge.planes.map((plan) => (
                            <div
                                key={`${plan.codigo}-${plan.nombre}`}
                                className="rounded-xl border border-border/70 p-3"
                            >
                                <p className="text-xs font-bold">
                                    {plan.nombre}
                                </p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    {formatPrice(
                                        plan.precio_mensual,
                                        plan.moneda,
                                    )}
                                    /mes
                                    {plan.precio_anual !== null
                                        ? ` · ${formatPrice(plan.precio_anual, plan.moneda)}/año`
                                        : ''}
                                </p>
                                {plan.incluye.length > 0 ? (
                                    <ul className="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
                                        {plan.incluye
                                            .slice(0, 5)
                                            .map((item) => (
                                                <li key={item}>· {item}</li>
                                            ))}
                                        {plan.incluye.length > 5 ? (
                                            <li>
                                                · y {plan.incluye.length - 5}{' '}
                                                más
                                            </li>
                                        ) : null}
                                    </ul>
                                ) : null}
                            </div>
                        ))}
                    </div>
                ) : null}
            </NeuCardRaised>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <form onSubmit={onSubmit}>
                    <h2 className="text-sm font-bold">Cómo se presenta</h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Lo que dejes vacío se toma del SaaS (se muestra en gris
                        como referencia).
                    </p>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        {FIELDS.map((field) => {
                            const id = `saleshub-${field.key}`;
                            const placeholder =
                                knowledge.placeholders[field.key] ?? '';
                            const common = {
                                id,
                                value: form.data[field.key],
                                placeholder,
                                onChange: (
                                    e: React.ChangeEvent<
                                        HTMLInputElement | HTMLTextAreaElement
                                    >,
                                ) => form.setData(field.key, e.target.value),
                            };

                            return (
                                <div
                                    key={field.key}
                                    className={cn(
                                        'space-y-1',
                                        field.textarea && 'md:col-span-2',
                                    )}
                                >
                                    <AdminUnderlineLabel htmlFor={id}>
                                        {field.label}
                                    </AdminUnderlineLabel>
                                    {field.textarea ? (
                                        <textarea
                                            {...common}
                                            className={`${fieldClass} min-h-24 resize-y`}
                                        />
                                    ) : (
                                        <input
                                            {...common}
                                            className={fieldClass}
                                        />
                                    )}
                                    {form.errors[field.key] ? (
                                        <p className="text-[11px] text-destructive">
                                            {form.errors[field.key]}
                                        </p>
                                    ) : field.hint ? (
                                        <p className="text-[10px] text-muted-foreground">
                                            {field.hint}
                                        </p>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 flex justify-end">
                        <NeuButtonRaised
                            type="submit"
                            disabled={form.processing || !form.isDirty}
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
                </form>
            </NeuCardRaised>

            <NeuCardRaised className="rounded-xl p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-sm font-bold">
                            Módulos, FAQ, objeciones y novedades
                        </h2>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            {knowledge.sections.some((s) => s.activo)
                                ? 'El bot usa estos bloques (los del SaaS ya no se usan para este sistema).'
                                : `Aún no hay bloques en ORVAE: el bot usa los ${knowledge.saas_secciones} del SaaS. Cópialos o crea los tuyos.`}
                        </p>
                    </div>
                    <NeuButtonRaised
                        type="button"
                        onClick={() =>
                            setSectionDialog({ open: true, section: null })
                        }
                        className="self-start"
                    >
                        <Plus className="size-4" aria-hidden /> Nuevo bloque
                    </NeuButtonRaised>
                </div>

                {knowledge.sections.length > 0 ? (
                    <ul className="mt-4 divide-y divide-border/60">
                        {knowledge.sections.map((section) => (
                            <li
                                key={section.id}
                                className={cn(
                                    'flex gap-3 py-3',
                                    !section.activo && 'opacity-50',
                                )}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-semibold tracking-wide text-[#D28C3C] uppercase">
                                        {sectionTipoLabel(section.tipo)}
                                        {!section.activo ? ' · inactivo' : ''}
                                    </p>
                                    <p className="truncate text-xs font-bold">
                                        {section.titulo}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                                        {section.contenido}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-start gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSectionDialog({
                                                open: true,
                                                section,
                                            })
                                        }
                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        aria-label={`Editar ${section.titulo}`}
                                    >
                                        <Pencil
                                            className="size-3.5"
                                            aria-hidden
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleting(section)}
                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
            </NeuCardRaised>

            <SalesHubSectionDialog
                open={sectionDialog.open}
                onOpenChange={(open) =>
                    setSectionDialog((current) => ({ ...current, open }))
                }
                section={sectionDialog.section}
                storeUrl={knowledge.routes.bloques}
            />

            {deleting ? (
                <OpenWaConfirmDialog
                    open
                    onOpenChange={(open) => !open && setDeleting(null)}
                    title={`Eliminar «${deleting.titulo}»`}
                    description="El bot dejará de usar este bloque."
                    confirmLabel="Eliminar"
                    url={deleting.routes.destroy}
                    method="delete"
                />
            ) : null}
        </div>
    );
}

function emptyForm(): SalesHubKnowledgeForm {
    return {
        nombre: '',
        resumen: '',
        publico: '',
        palabras_clave: '',
        demo_url: '',
        demo_usuario: '',
        demo_password: '',
        registro_url: '',
        instrucciones: '',
    };
}
