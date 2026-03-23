import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Building2, Fingerprint, Landmark, Tags } from 'lucide-react';
import RequiredFieldMark from '@/components/sunat/emisor/RequiredFieldMark';
import type {
    CompanyLegalProfile,
    FormErrors,
} from '@/components/sunat/emisor/types';

type Props = {
    profile: CompanyLegalProfile | null;
    errors: FormErrors;
};

export default function EmisorGeneralFields({ profile, errors }: Props) {
    const inputUnderlineClassName =
        'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-3 pl-9 pr-3 font-[family-name:var(--font-body)] text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--o-amber)]/60 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[var(--o-amber)]/60 transition-colors duration-150';

    const labelClassName =
        'font-[family-name:var(--font-mono)] text-[9px] font-normal uppercase tracking-[0.14em] text-[var(--o-warm)]';

    return (
        <>
            <header className="mb-4">
                <h3 className="text-sm font-semibold">Información base</h3>
                <p className="text-xs text-muted-foreground">
                    Identidad legal del emisor.
                </p>
            </header>

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="slug" className={labelClassName}>
                            Slug
                            <RequiredFieldMark />
                        </Label>
                        <div className="relative">
                            <Tags className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="slug"
                                name="slug"
                                required
                                defaultValue={
                                    profile?.slug ?? 'orvae-principal'
                                }
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.slug} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ruc" className={labelClassName}>
                            RUC
                            <RequiredFieldMark />
                        </Label>
                        <div className="relative">
                            <Fingerprint className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="ruc"
                                name="ruc"
                                required
                                inputMode="numeric"
                                defaultValue={profile?.ruc ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.ruc} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label
                            htmlFor="legal_name"
                            className={labelClassName}
                        >
                            Razón social
                            <RequiredFieldMark />
                        </Label>
                        <div className="relative">
                            <Building2 className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="legal_name"
                                name="legal_name"
                                required
                                defaultValue={profile?.legal_name ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.legal_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="trade_name" className={labelClassName}>
                            Nombre comercial
                        </Label>
                        <div className="relative">
                            <Landmark className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="trade_name"
                                name="trade_name"
                                defaultValue={profile?.trade_name ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.trade_name} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tax_regime" className={labelClassName}>
                        Régimen (SUNAT)
                    </Label>
                    <Input
                        id="tax_regime"
                        name="tax_regime"
                        defaultValue={profile?.tax_regime ?? ''}
                        className={inputUnderlineClassName}
                    />
                    <InputError message={errors.tax_regime} />
                </div>
            </div>
        </>
    );
}

