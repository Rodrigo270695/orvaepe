import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';

import AdminUnderlineLabel from '@/components/admin/form/admin-underline-label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';

import { SECTION_TIPOS, fieldClass } from './salesHubUi';
import type { SalesHubSection, SalesHubSectionTipo } from './types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** null = bloque nuevo */
    section: SalesHubSection | null;
    storeUrl: string;
};

export function SalesHubSectionDialog({
    open,
    onOpenChange,
    section,
    storeUrl,
}: Props) {
    const form = useForm<{
        tipo: SalesHubSectionTipo;
        titulo: string;
        contenido: string;
        activo: boolean;
    }>({
        tipo: 'faq',
        titulo: '',
        contenido: '',
        activo: true,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData({
            tipo: section?.tipo ?? 'faq',
            titulo: section?.titulo ?? '',
            contenido: section?.contenido ?? '',
            activo: section?.activo ?? true,
        });
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, section]);

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (section) {
            form.put(section.routes.update, options);
        } else {
            form.post(storeUrl, options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold">
                            {section ? 'Editar bloque' : 'Nuevo bloque'}
                        </DialogTitle>
                        <DialogDescription className="text-[11px]">
                            El bot usa cada bloque tal cual. Escribe como se lo
                            explicarías a un cliente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        <div className="space-y-1">
                            <AdminUnderlineLabel htmlFor="saleshub-section-tipo">
                                Tipo
                            </AdminUnderlineLabel>
                            <select
                                id="saleshub-section-tipo"
                                className={fieldClass}
                                value={form.data.tipo}
                                onChange={(e) =>
                                    form.setData(
                                        'tipo',
                                        e.target.value as SalesHubSectionTipo,
                                    )
                                }
                            >
                                {SECTION_TIPOS.map((tipo) => (
                                    <option key={tipo.key} value={tipo.key}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <AdminUnderlineLabel htmlFor="saleshub-section-titulo">
                                Título
                            </AdminUnderlineLabel>
                            <input
                                id="saleshub-section-titulo"
                                className={fieldClass}
                                value={form.data.titulo}
                                onChange={(e) =>
                                    form.setData('titulo', e.target.value)
                                }
                                placeholder="¿Emite boletas electrónicas?"
                                maxLength={200}
                                required
                            />
                            {form.errors.titulo ? (
                                <p className="text-[11px] text-destructive">
                                    {form.errors.titulo}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <AdminUnderlineLabel htmlFor="saleshub-section-contenido">
                                Contenido
                            </AdminUnderlineLabel>
                            <textarea
                                id="saleshub-section-contenido"
                                className={`${fieldClass} min-h-36 resize-y`}
                                value={form.data.contenido}
                                onChange={(e) =>
                                    form.setData('contenido', e.target.value)
                                }
                                maxLength={4000}
                                required
                            />
                            {form.errors.contenido ? (
                                <p className="text-[11px] text-destructive">
                                    {form.errors.contenido}
                                </p>
                            ) : null}
                        </div>

                        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                            <Checkbox
                                checked={form.data.activo}
                                onCheckedChange={(v) =>
                                    form.setData('activo', v === true)
                                }
                            />
                            Activo (el bot lo usa)
                        </label>
                    </div>

                    <DialogFooter className="gap-2">
                        <NeuButtonRaised
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={form.processing}
                            className="text-muted-foreground"
                        >
                            Cancelar
                        </NeuButtonRaised>
                        <NeuButtonRaised
                            type="submit"
                            disabled={form.processing}
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
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
