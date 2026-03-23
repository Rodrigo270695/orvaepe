import { Form, Head } from '@inertiajs/react';
import { Mail, Lock } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { update } from '@/routes/password';
import { inertiaFormProps } from '@/lib/inertia-form-props';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    const inputUnderlineClassName =
        'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-3 pl-9 pr-3 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[var(--o-amber)]/60 transition-colors duration-150';

    const passwordUnderlineClassName =
        'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-3 pl-9 pr-10 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[var(--o-amber)]/60 transition-colors duration-150';

    return (
        <AuthOrvaeLoginLayout
            title="Restablecer contraseña"
            description="Ingresa tu nueva contraseña"
            maxWidthClass="max-w-[480px]"
        >
            <Head title="Restablecer contraseña" />

            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--o-amber)]/15">
                        <Lock className="size-6 text-[var(--o-amber)]" />
                    </div>
                    <div>
                        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">
                            Restablecer contraseña
                        </h1>
                        <p className="mt-0.5 font-[family-name:var(--font-body)] text-sm text-[var(--muted-foreground)]">
                            Ingresa tu nueva contraseña
                        </p>
                    </div>
                </div>

                <Form
                    {...inertiaFormProps(update())}
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={[
                        'password',
                        'password_confirmation',
                    ]}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Correo electrónico
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        value={email}
                                        className={inputUnderlineClassName}
                                        readOnly
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Contraseña
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        autoComplete="new-password"
                                        className={`${passwordUnderlineClassName} pr-10`}
                                        autoFocus
                                        placeholder="Contraseña"
                                    />
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Confirmar contraseña
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        className={`${passwordUnderlineClassName} pr-10`}
                                        placeholder="Confirmar contraseña"
                                    />
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                data-test="reset-password-button"
                                className="mt-2 w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--o-void)] transition-opacity duration-150 hover:opacity-95 disabled:cursor-default disabled:opacity-60"
                                style={{
                                    background:
                                        'linear-gradient(135deg, var(--o-amber) 0%, var(--o-amber2) 100%)',
                                }}
                            >
                                {processing && <Spinner />}
                                Restablecer contraseña
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                ¿Ya tienes una cuenta?{' '}
                                <TextLink
                                    href="/login"
                                    tabIndex={10}
                                    className="font-medium text-[var(--o-amber)] hover:underline"
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
