import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Globe, Mail, Phone, Upload } from 'lucide-react';
import type {
    CompanyLegalProfile,
    FormErrors,
} from '@/components/sunat/emisor/types';

type Props = {
    profile: CompanyLegalProfile | null;
    errors: FormErrors;
};

export default function EmisorContactFields({
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
                <h3 className="text-sm font-semibold">Contacto y branding</h3>
                <p className="text-xs text-muted-foreground">
                    Información para soporte y representación visual en PDF.
                </p>
            </header>

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className={labelClassName}>
                            Teléfono
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={profile?.phone ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.phone} />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="support_email"
                            className={labelClassName}
                        >
                            Email soporte
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="support_email"
                                name="support_email"
                                type="email"
                                defaultValue={profile?.support_email ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.support_email} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website" className={labelClassName}>
                            Web
                        </Label>
                        <div className="relative">
                            <Globe className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                            <Input
                                id="website"
                                name="website"
                                defaultValue={profile?.website ?? ''}
                                className={inputUnderlineClassName}
                            />
                        </div>
                        <InputError message={errors.website} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="logo" className={labelClassName}>
                        Logo
                    </Label>
                    <div className="relative">
                        <Upload className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#D28C3C]" />
                        <Input
                            id="logo"
                            name="logo"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className={inputUnderlineClassName}
                        />
                    </div>
                    <InputError message={errors.logo} />

                    {profile?.logo_path ? (
                        <p className="text-xs text-muted-foreground">
                            Logo actual: <code>{profile.logo_path}</code>
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Aún no hay logo cargado.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

