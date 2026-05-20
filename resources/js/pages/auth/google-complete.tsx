import { Form, Head } from '@inertiajs/react';
import { IdCard, Phone } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { inertiaFormProps } from '@/lib/inertia-form-props';

const inputUnderlineClassName =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent py-3 pl-9 pr-3 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--auth-focus-border)] focus:outline-none transition-colors duration-150';

type Props = {
    user: {
        name: string;
        lastname: string;
        email: string;
    };
};

export default function GoogleComplete({ user }: Props) {
    const [documentNumberLen, setDocumentNumberLen] = useState(0);
    const [phoneLen, setPhoneLen] = useState(0);
    const documentNumberMax = documentNumberLen <= 8 ? 8 : 11;

    const handleDigitsOnlyDocument = (e: FormEvent<HTMLInputElement>) => {
        const raw = e.currentTarget.value;
        let digits = raw.replace(/\D/g, '');
        digits = digits.slice(0, 11);
        e.currentTarget.value = digits;
        setDocumentNumberLen(digits.length);
    };

    const handleDigitsOnlyPhone = (e: FormEvent<HTMLInputElement>) => {
        const raw = e.currentTarget.value;
        let digits = raw.replace(/\D/g, '');

        if (digits.length > 0) {
            if (!digits.startsWith('9')) {
                digits = `9${digits.slice(1)}`;
            }
            digits = digits.slice(0, 9);
        }

        e.currentTarget.value = digits;
        setPhoneLen(digits.length);
    };

    return (
        <AuthOrvaeLoginLayout
            title="Completa tu perfil"
            description="Necesitamos tu documento de identidad para continuar"
            maxWidthClass="max-w-[480px]"
        >
            <Head title="Completar perfil" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">
                        Un paso más
                    </h1>
                    <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-[var(--muted-foreground)]">
                        Hola {user.name}, confirma tus datos de cliente para Perú.
                    </p>
                    <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
                        {user.email}
                    </p>
                </div>

                <Form
                    {...inertiaFormProps({
                        url: '/auth/google/complete',
                        method: 'post',
                    })}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="document_number"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    DNI o RUC
                                </label>
                                <div className="relative">
                                    <IdCard className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                    <input
                                        id="document_number"
                                        name="document_number"
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        autoFocus
                                        maxLength={documentNumberMax}
                                        onInput={handleDigitsOnlyDocument}
                                        placeholder="DNI 8 dígitos o RUC 11"
                                        className={inputUnderlineClassName}
                                    />
                                </div>
                                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                                    {documentNumberLen}/{documentNumberMax}
                                </span>
                                <InputError message={errors.document_number} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="phone"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Celular (opcional)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={9}
                                        onInput={handleDigitsOnlyPhone}
                                        placeholder="9XXXXXXXX"
                                        className={inputUnderlineClassName}
                                    />
                                </div>
                                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                                    {phoneLen}/9
                                </span>
                                <InputError message={errors.phone} />
                            </div>

                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    name="accept_privacy"
                                    required
                                    className="mt-0.5 size-4 rounded border-[var(--o-border2)] bg-transparent text-[var(--auth-cta-from)] focus:ring-[var(--auth-ring)]"
                                />
                                <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                                    Acepto la{' '}
                                    <a
                                        href="/privacidad"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-[var(--auth-link)] underline decoration-[var(--auth-link)]/35 underline-offset-4"
                                    >
                                        Política de privacidad
                                    </a>
                                    .
                                </span>
                            </label>
                            <InputError message={errors.accept_privacy} />

                            <button
                                type="submit"
                                disabled={processing}
                                className="auth-cta w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-display)] text-sm font-semibold transition-[filter,opacity] duration-150 disabled:cursor-default"
                            >
                                {processing ? 'Guardando...' : 'Continuar al portal'}
                            </button>
                        </>
                    )}
                </Form>
            </div>
        </AuthOrvaeLoginLayout>
    );
}
