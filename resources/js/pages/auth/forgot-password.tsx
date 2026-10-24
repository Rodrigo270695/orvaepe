// Components
import { Form, Head } from '@inertiajs/react';
import {
    AuthOrvaeCardHeader,
    AuthOrvaeSecureFooter,
    AuthOrvaeStatusBanner,
    authInputUnderlineClassName,
} from '@/components/auth/auth-orvae-parts';
import { LoaderCircle, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { email } from '@/routes/password';
import { inertiaFormProps } from '@/lib/inertia-form-props';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthOrvaeLoginLayout
            title="Olvidé mi contraseña"
            description="Ingresa tu correo para recibir un enlace de restablecimiento"
        >
            <Head title="Olvidé mi contraseña" />

            <div className="flex flex-col gap-8">
                <AuthOrvaeCardHeader
                    icon={Mail}
                    title="Recuperar acceso"
                    subtitle="Te enviaremos un enlace para restablecer tu contraseña"
                />

                {status ? <AuthOrvaeStatusBanner>{status}</AuthOrvaeStatusBanner> : null}

                <Form {...inertiaFormProps(email())}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                >
                                    Correo electrónico
                                </Label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-0 top-1/2 size-4 -translate-y-1/2"
                                        style={{ color: 'var(--state-info)' }}
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        autoFocus
                                        className={authInputUnderlineClassName}
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>

                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    variant="ghost"
                                    className="auth-cta h-auto w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--auth-cta-fg)] transition-[filter,opacity] duration-150 hover:bg-transparent hover:text-[var(--auth-cta-fg)] disabled:cursor-default"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin text-[var(--auth-cta-fg)]" />
                                    )}
                                    Enviar enlace para restablecer contraseña
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>O vuelve a</span>
                    <TextLink
                        href="/login"
                        className="font-medium text-[var(--auth-link)] hover:text-[var(--auth-link-hover)]"
                    >
                        iniciar sesión
                    </TextLink>
                </div>

                <AuthOrvaeSecureFooter />
            </div>
        </AuthOrvaeLoginLayout>
    );
}
