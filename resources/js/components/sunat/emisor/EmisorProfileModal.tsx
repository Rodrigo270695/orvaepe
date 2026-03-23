import { useEffect, useMemo, useState } from 'react';
import { Form } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { inertiaFormProps } from '@/lib/inertia-form-props';
import type { CompanyLegalProfile } from '@/components/sunat/emisor/types';

type Props = {
    open: boolean;
    mode: 'create' | 'edit';
    profile: CompanyLegalProfile | null;
    onOpenChange: (open: boolean) => void;
};

function boolToFormValue(value: boolean) {
    return value ? '1' : '0';
}

export default function EmisorProfileModal({
    open,
    mode,
    profile,
    onOpenChange,
}: Props) {
    const [isDefaultIssuer, setIsDefaultIssuer] = useState(false);

    useEffect(() => {
        setIsDefaultIssuer(mode === 'edit' ? Boolean(profile?.is_default_issuer) : false);
    }, [mode, profile]);

    const title = mode === 'create' ? 'Nuevo emisor' : 'Editar emisor';
    const action = useMemo(() => {
        if (mode === 'create') {
            return inertiaFormProps({ url: '/panel/sunat-emisor', method: 'post' });
        }

        return inertiaFormProps({
            url: `/panel/sunat-emisor/${profile?.id ?? ''}`,
            method: 'patch',
        });
    }, [mode, profile?.id]);

    const handleClose = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Configura los datos del emisor SUNAT que se usarán para
                        emitir comprobantes a tus clientes.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...action}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="space-y-6"
                >
                    {({ errors, processing }) => {
                        return (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            defaultValue={profile?.slug ?? ''}
                                            required
                                        />
                                        <InputError message={errors.slug} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ruc">RUC</Label>
                                        <Input
                                            id="ruc"
                                            name="ruc"
                                            defaultValue={profile?.ruc ?? ''}
                                            required
                                            inputMode="numeric"
                                        />
                                        <InputError message={errors.ruc} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="legal_name">Razón social</Label>
                                        <Input
                                            id="legal_name"
                                            name="legal_name"
                                            defaultValue={profile?.legal_name ?? ''}
                                            required
                                        />
                                        <InputError message={errors.legal_name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="trade_name">Nombre comercial</Label>
                                        <Input
                                            id="trade_name"
                                            name="trade_name"
                                            defaultValue={profile?.trade_name ?? ''}
                                        />
                                        <InputError message={errors.trade_name} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tax_regime">Régimen (SUNAT)</Label>
                                    <Input
                                        id="tax_regime"
                                        name="tax_regime"
                                        defaultValue={profile?.tax_regime ?? ''}
                                        placeholder="Ej: Régimen MYPE, general, etc."
                                    />
                                    <InputError message={errors.tax_regime} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_line">Dirección fiscal</Label>
                                    <Input
                                        id="address_line"
                                        name="address_line"
                                        defaultValue={profile?.address_line ?? ''}
                                        placeholder="Av., calle, N°, etc."
                                    />
                                    <InputError message={errors.address_line} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="district">Distrito</Label>
                                        <Input
                                            id="district"
                                            name="district"
                                            defaultValue={profile?.district ?? ''}
                                        />
                                        <InputError message={errors.district} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="province">Provincia</Label>
                                        <Input
                                            id="province"
                                            name="province"
                                            defaultValue={profile?.province ?? ''}
                                        />
                                        <InputError message={errors.province} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Departamento</Label>
                                        <Input
                                            id="department"
                                            name="department"
                                            defaultValue={profile?.department ?? ''}
                                        />
                                        <InputError message={errors.department} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ubigeo">Ubigeo</Label>
                                        <Input
                                            id="ubigeo"
                                            name="ubigeo"
                                            defaultValue={profile?.ubigeo ?? ''}
                                            inputMode="numeric"
                                        />
                                        <InputError message={errors.ubigeo} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            defaultValue={profile?.phone ?? ''}
                                            placeholder="(opcional)"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="support_email">Email soporte</Label>
                                        <Input
                                            id="support_email"
                                            name="support_email"
                                            type="email"
                                            defaultValue={profile?.support_email ?? ''}
                                            placeholder="soporte@empresa.com"
                                        />
                                        <InputError message={errors.support_email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Web</Label>
                                        <Input
                                            id="website"
                                            name="website"
                                            defaultValue={profile?.website ?? ''}
                                            placeholder="https://..."
                                        />
                                        <InputError message={errors.website} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="logo_path">Logo (path)</Label>
                                        <Input
                                            id="logo_path"
                                            name="logo_path"
                                            defaultValue={profile?.logo_path ?? ''}
                                        />
                                        <InputError message={errors.logo_path} />
                                    </div>

                                    <div className="flex items-end gap-3">
                                        <div className="flex flex-col">
                                            <Label>Default</Label>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Se usará para emitir por defecto.
                                            </div>
                                        </div>
                                        <div className="pb-1">
                                            <Checkbox
                                                checked={isDefaultIssuer}
                                                onCheckedChange={(v) =>
                                                    setIsDefaultIssuer(Boolean(v))
                                                }
                                                aria-label="Default issuer"
                                            />
                                        </div>
                                        <input
                                            type="hidden"
                                            name="is_default_issuer"
                                            value={boolToFormValue(isDefaultIssuer)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleClose}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Guardar
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </>
                        );
                    }}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

