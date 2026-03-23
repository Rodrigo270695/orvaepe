import { Form, Head } from '@inertiajs/react';
import { IdCard, Lock, Mail, Phone, User, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { store } from '@/routes/register';
import { inertiaFormProps } from '@/lib/inertia-form-props';

export default function Register() {
    const [documentNumberLen, setDocumentNumberLen] = useState(0);
    const [phoneLen, setPhoneLen] = useState(0);

    const inputUnderlineClassName =
        'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-3 pl-9 pr-3 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--auth-focus-border)] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[var(--auth-focus-border)] transition-colors duration-150';

    // El documento puede ser 8 (DNI) o 11 (RUC). Mostramos /8 mientras tenga hasta 8 dígitos,
    // y cambiamos a /11 cuando el usuario ingresa el 9º dígito.
    const documentNumberMax = documentNumberLen <= 8 ? 8 : 11;

    const handleDigitsOnlyDocument = (e: FormEvent<HTMLInputElement>) => {
        const raw = e.currentTarget.value;
        let digits = raw.replace(/\D/g, '');

        // Máximo absoluto: 11.
        digits = digits.slice(0, 11);

        e.currentTarget.value = digits;
        setDocumentNumberLen(digits.length);
    };

    const handleDigitsOnlyPhone = (e: FormEvent<HTMLInputElement>) => {
        const raw = e.currentTarget.value;
        let digits = raw.replace(/\D/g, '');

        if (digits.length > 0) {
            // Forzar que empiece por 9.
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
            title="Crea una cuenta"
            description="Ingresa tus datos para crear tu cuenta"
            maxWidthClass="max-w-[480px]"
        >
            <Head title="Registrarse" />
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--auth-header-icon-bg)]">
                        <UserPlus className="size-6 text-[var(--auth-cta-from)]" />
                    </div>
                    <div>
                        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">
                            Crea tu cuenta
                        </h1>
                        <p className="mt-0.5 font-[family-name:var(--font-body)] text-sm text-[var(--muted-foreground)]">
                            Completa tus datos para comenzar
                        </p>
                    </div>
                </div>

            <Form
                {...inertiaFormProps(store())}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                        <div className="space-y-6">
                            {/* Fila 1: Correo (ocupa las 2 columnas en desktop) */}
                            <div className="grid gap-2 md:col-span-2">
                                <Label
                                    htmlFor="email"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Correo electrónico
                                    <span className="ml-0.5 text-[var(--auth-cta-from)]">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className={inputUnderlineClassName}
                                        required
                                        tabIndex={4}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Fila 2: Nombre + Apellido */}
                            <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Nombre
                                    <span className="ml-0.5 text-[var(--auth-cta-from)]">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                    <Input
                                        id="name"
                                        type="text"
                                        className={inputUnderlineClassName}
                                        required
                                        tabIndex={2}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Nombre"
                                    />
                                </div>
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="lastname"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Apellido
                                    <span className="ml-0.5 text-[var(--auth-cta-from)]">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                    <Input
                                        id="lastname"
                                        type="text"
                                        className={inputUnderlineClassName}
                                        required
                                        tabIndex={3}
                                        autoComplete="family-name"
                                        name="lastname"
                                        placeholder="Apellido"
                                    />
                                </div>
                                <InputError
                                    message={errors.lastname}
                                    className="mt-2"
                                />
                            </div>
                            </div>

                            {/* Fila 3: Documento + Celular */}
                            <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="document_number"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    N.º de documento
                                    <span className="ml-0.5 text-[var(--auth-cta-from)]">*</span>
                                </Label>
                                <div className="relative">
                                    <IdCard className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                    <Input
                                        id="document_number"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className={`${inputUnderlineClassName} pr-12`}
                                        required
                                        tabIndex={5}
                                        name="document_number"
                                        placeholder="DNI o RUC"
                                        maxLength={11}
                                        onInput={handleDigitsOnlyDocument}
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-[10px] text-[var(--auth-icon)]">
                                        {documentNumberLen}/{documentNumberMax}
                                    </span>
                                </div>
                                <InputError
                                    message={errors.document_number}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="phone"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Celular (9 dígitos)
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                    <Input
                                        id="phone"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className={`${inputUnderlineClassName} pr-12`}
                                        tabIndex={6}
                                        name="phone"
                                        placeholder="987654321"
                                        maxLength={9}
                                        onInput={handleDigitsOnlyPhone}
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-[10px] text-[var(--auth-icon)]">
                                        {phoneLen}/9
                                    </span>
                                </div>
                                <InputError
                                    message={errors.phone}
                                    className="mt-2"
                                />
                            </div>
                            </div>

                            {/* Fila 4: Contraseña + Confirmación */}
                            <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Contraseña
                                    <span className="ml-0.5 text-[var(--auth-cta-from)]">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={7}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Contraseña"
                                        className={`${inputUnderlineClassName} pr-10`}
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Confirmar contraseña
                                    <span className="ml-0.5 text-[var(--auth-cta-from)]">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={8}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirmar contraseña"
                                        className={`${inputUnderlineClassName} pr-10`}
                                    />
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>
                            </div>

                            <Button
                                type="submit"
                                variant="ghost"
                                tabIndex={9}
                                data-test="register-user-button"
                                disabled={processing}
                                className="auth-cta mt-2 h-auto w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--auth-cta-fg)] transition-[filter,opacity] duration-150 hover:bg-transparent hover:text-[var(--auth-cta-fg)] disabled:cursor-default"
                            >
                                {processing && (
                                    <Spinner className="text-[var(--auth-cta-fg)]" />
                                )}
                                Crear cuenta
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                ¿Ya tienes una cuenta?{' '}
                                <TextLink
                                    href="/login"
                                    tabIndex={10}
                                    className="font-medium text-[var(--auth-link)] hover:text-[var(--auth-link-hover)]"
                                >
                                    Inicia sesión
                                </TextLink>
                            </div>
                        </div>
                )}
            </Form>
            </div>
        </AuthOrvaeLoginLayout>
    );
}
