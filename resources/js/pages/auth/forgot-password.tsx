// Components
import { Form, Head } from '@inertiajs/react';
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
    const inputUnderlineClassName =
        'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-3 pl-9 pr-3 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--auth-focus-border)] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[var(--auth-focus-border)] transition-colors duration-150';

    return (
        <AuthOrvaeLoginLayout
            title="Olvidé mi contraseña"
            description="Ingresa tu correo para recibir un enlace de restablecimiento"
        >
            <Head title="Olvidé mi contraseña" />

            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl border"
                        style={{
                            borderColor:
                                'color-mix(in oklab, var(--state-info) 70%, var(--border))',
                            background:
                                'linear-gradient(135deg, color-mix(in oklab, var(--state-info) 46%, var(--auth-header-icon-bg)), color-mix(in oklab, var(--state-success) 34%, var(--auth-header-icon-bg)))',
                            boxShadow:
                                '0 0 24px -4px color-mix(in oklab, var(--state-info) 65%, transparent)',
                        }}
                    >
                        <Mail
                            className="size-6"
                            style={{
                                color: 'var(--state-info)',
                                filter: 'drop-shadow(0 0 6px color-mix(in oklab, var(--state-info) 60%, transparent))',
                            }}
                        />
                    </div>
                    <div>
                        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">
                            Recuperar acceso
                        </h1>
                        <p className="mt-0.5 font-[family-name:var(--font-body)] text-sm text-[var(--muted-foreground)]">
                            Te enviaremos un enlace para restablecer tu contraseña
                        </p>
                    </div>
                </div>

                {status && (
                    <div className="rounded-sm border border-[color-mix(in_oklab,var(--state-success)_35%,transparent)] bg-[color-mix(in_oklab,var(--state-success)_12%,transparent)] px-4 py-3 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--state-success)]">
                        {status}
                    </div>
                )}

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
                                        className={inputUnderlineClassName}
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
            </div>
        </AuthOrvaeLoginLayout>
    );
}
