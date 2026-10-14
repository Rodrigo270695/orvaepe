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

import type { OpenWaLine, OpenWaProduct } from './types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** null = crear línea nueva */
    line: OpenWaLine | null;
    products: OpenWaProduct[];
    storeUrl: string;
};

const inputClass =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent px-0 py-2 text-sm outline-none transition-colors focus:border-[var(--o-amber)]/60 disabled:opacity-60';

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
}

export function OpenWaLineFormDialog({ open, onOpenChange, line, products, storeUrl }: Props) {
    const editing = line !== null;
    const form = useForm<{ nombre: string; session_name: string; productos: string[] }>({
        nombre: '',
        session_name: '',
        productos: [],
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData({
            nombre: line?.nombre ?? '',
            session_name: line?.session_name ?? '',
            productos: line?.productos ?? [],
        });
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, line]);

    const toggleProduct = (key: string, checked: boolean) => {
        form.setData(
            'productos',
            checked ? [...form.data.productos, key] : form.data.productos.filter((p) => p !== key),
        );
    };

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };

        if (editing) {
            form.put(line.routes.update, options);
        } else {
            form.post(storeUrl, options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold">
                            {editing ? 'Editar línea' : 'Nueva línea de WhatsApp'}
                        </DialogTitle>
                        <DialogDescription className="text-[11px]">
                            Cada línea es un número de WhatsApp. Marca qué SaaS atiende: la IA usará
                            esa información para responder.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        <div className="space-y-1">
                            <AdminUnderlineLabel htmlFor="openwa-line-nombre">Nombre</AdminUnderlineLabel>
                            <input
                                id="openwa-line-nombre"
                                className={inputClass}
                                value={form.data.nombre}
                                onChange={(e) => {
                                    const nombre = e.target.value;
                                    form.setData((data) => ({
                                        ...data,
                                        nombre,
                                        session_name: editing ? data.session_name : slugify(nombre),
                                    }));
                                }}
                                placeholder="ORVAE Ventas"
                                maxLength={80}
                                required
                            />
                            {form.errors.nombre ? (
                                <p className="text-[11px] text-destructive">{form.errors.nombre}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <AdminUnderlineLabel htmlFor="openwa-line-session">
                                Identificador en OpenWA
                            </AdminUnderlineLabel>
                            <input
                                id="openwa-line-session"
                                className={`${inputClass} font-mono`}
                                value={form.data.session_name}
                                onChange={(e) => form.setData('session_name', e.target.value)}
                                placeholder="orvae-ventas"
                                pattern="[a-z0-9-]{3,50}"
                                disabled={editing}
                                required
                            />
                            {form.errors.session_name ? (
                                <p className="text-[11px] text-destructive">{form.errors.session_name}</p>
                            ) : (
                                <p className="text-[10px] text-muted-foreground">
                                    {editing
                                        ? 'No se puede cambiar después de crear la línea.'
                                        : 'Minúsculas, números y guiones. No se puede cambiar luego.'}
                                </p>
                            )}
                        </div>

                        <fieldset className="space-y-2">
                            <legend className="text-[11px] font-semibold text-muted-foreground">
                                SaaS que atiende
                            </legend>
                            {products.map((product) => (
                                <label
                                    key={product.key}
                                    className="flex cursor-pointer items-center gap-2.5 text-sm"
                                >
                                    <Checkbox
                                        checked={form.data.productos.includes(product.key)}
                                        onCheckedChange={(v) => toggleProduct(product.key, v === true)}
                                    />
                                    {product.label}
                                </label>
                            ))}
                            {form.errors.productos ? (
                                <p className="text-[11px] text-destructive">{form.errors.productos}</p>
                            ) : null}
                        </fieldset>
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
                        <NeuButtonRaised type="submit" disabled={form.processing}>
                            {form.processing ? (
                                <Loader2 className="size-4 animate-spin" aria-hidden />
                            ) : (
                                <Save className="size-4" aria-hidden />
                            )}
                            {editing ? 'Guardar' : 'Crear línea'}
                        </NeuButtonRaised>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
