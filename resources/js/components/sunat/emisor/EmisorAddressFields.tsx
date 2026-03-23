import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { House, MapPinned } from 'lucide-react';
import type {
    CompanyLegalProfile,
    FormErrors,
} from '@/components/sunat/emisor/types';

type Props = {
    profile: CompanyLegalProfile | null;
    errors: FormErrors;
};

export default function EmisorAddressFields({
    profile,
    errors,
}: Props) {
    const inputUnderlineClassName =
        'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-3 pl-9 pr-3 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[var(--o-amber)]/60 transition-colors duration-150';

    const labelClassName =
        'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';

    return (
        <>
            <header className="mb-4">
                <h3 className="text-sm font-semibold">Dirección fiscal</h3>
                <p className="text-xs text-muted-foreground">
                    Datos de ubicación que se imprimen en los comprobantes.
                </p>
            </header>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="address_line" className={labelClassName}>
                        Dirección fiscal
                    </Label>
                    <div className="relative">
                        <House className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                        <Input
                            id="address_line"
                            name="address_line"
                            defaultValue={profile?.address_line ?? ''}
                            className={inputUnderlineClassName}
                        />
                    </div>
                    <InputError message={errors.address_line} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="district" className={labelClassName}>
                            Distrito
                        </Label>
                        <div className="relative">
                            <MapPinned className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="district"
                                name="district"
                                defaultValue={profile?.district ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.district} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="province" className={labelClassName}>
                            Provincia
                        </Label>
                        <div className="relative">
                            <MapPinned className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="province"
                                name="province"
                                defaultValue={profile?.province ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.province} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="department" className={labelClassName}>
                            Departamento
                        </Label>
                        <div className="relative">
                            <House className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="department"
                                name="department"
                                defaultValue={profile?.department ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.department} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ubigeo" className={labelClassName}>
                            Ubigeo
                        </Label>
                        <div className="relative">
                            <MapPinned className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="ubigeo"
                                name="ubigeo"
                                inputMode="numeric"
                                defaultValue={profile?.ubigeo ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.ubigeo} />
                    </div>
                </div>
            </div>
        </>
    );
}

