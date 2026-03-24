import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { inertiaFormProps } from '@/lib/inertia-form-props';

const inputUnderlineClassName =
    'w-full border-0 border-b border-[var(--o-border2)] bg-transparent py-3 pl-9 pr-3 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--auth-focus-border)] focus:outline-none transition-colors duration-150';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) { 
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthOrvaeLoginLayout
            title="Bienvenido de vuelta."
            description="Ingresa tu usuario y contraseña para iniciar sesión"
        >
            <Head title="Iniciar sesión">
                <meta name="theme-color" content="#1C1410" />
            </Head>

            <Form
                {...inertiaFormProps(store())}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <div className="relative flex flex-col gap-8">
                        {/* Card header: título + subtítulo */}
                        <div className="flex flex-col gap-3">
                            <div>
                                <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">
                                    Iniciar sesión
                                </h1>
                                <p className="mt-0.5 font-[family-name:var(--font-body)] text-sm text-[var(--muted-foreground)]">
                                    Accede al sistema
                                </p>
                            </div>
                        </div>

                            <div className="grid gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="login"
                                        className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                    >
                                        Usuario o documento
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                        <input
                                            id="login"
                                            type="text"
                                            name="login"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="username"
                                            placeholder="usuario o DNI/RUC"
                                            className={inputUnderlineClassName}
                                        />
                                    </div>
                                    <InputError
                                        message={errors.login}
                                        className="font-mono text-xs text-[var(--state-danger)]"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                        >
                                            Contraseña
                                        </label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="font-[family-name:var(--font-body)] text-xs text-[var(--auth-link)] decoration-[var(--auth-link)]/35 underline-offset-4 hover:text-[var(--auth-link-hover)] hover:decoration-[var(--auth-link-hover)]"
                                                tabIndex={5}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••••••"
                                            className={`${inputUnderlineClassName} pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((p) => !p)
                                            }
                                            className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer p-2 text-[var(--auth-icon)] hover:text-[var(--auth-link)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-ring)] rounded-md"
                                            aria-label={
                                                showPassword
                                                    ? 'Ocultar contraseña'
                                                    : 'Mostrar contraseña'
                                            }
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError
                                        message={errors.password}
                                        className="font-mono text-xs text-[var(--state-danger)]"
                                    />
                                </div>

                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        tabIndex={3}
                                        className="size-4 rounded border-[var(--o-border2)] bg-transparent text-[var(--auth-cta-from)] focus:ring-[var(--auth-ring)]"
                                    />
                                    <span className="font-[family-name:var(--font-body)] text-sm text-[var(--muted-foreground)]">
                                        Mantener sesión iniciada
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                    className="auth-cta w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-display)] text-sm font-semibold transition-[filter,opacity] duration-150 disabled:cursor-default"
                                >
                                    {processing ? (
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <span className="size-4 animate-spin rounded-full border-2 border-[var(--auth-cta-fg)] border-t-transparent" />
                                            Verificando...
                                        </span>
                                    ) : (
                                        'Entrar al sistema'
                                    )}
                                </button>
                            </div>

                            {canRegister && (
                                <p className="text-center font-[family-name:var(--font-body)] text-[13px] text-[var(--muted-foreground)]">
                                    ¿No tienes cuenta?{' '}
                                    <TextLink
                                        href="/register"
                                        className="font-medium text-[var(--auth-link)] hover:text-[var(--auth-link-hover)]"
                                        tabIndex={5}
                                    >
                                        Crear cuenta gratis →
                                    </TextLink>
                                </p>
                            )}

                            {/* Footer card: conexión segura */}
                            <div className="mt-8 flex items-center justify-center gap-2 border-t border-[var(--o-border2)] pt-6 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted-foreground)]">
                                <ShieldCheck
                                    className="size-3.5"
                                    style={{
                                        color: 'var(--state-info)',
                                        filter: 'drop-shadow(0 0 4px color-mix(in oklab, var(--state-info) 62%, transparent))',
                                    }}
                                />
                                <span className="text-[color-mix(in_oklab,var(--state-info)_68%,var(--muted-foreground))]">
                                    Conexión segura
                                </span>
                                <span className="opacity-50">·</span>
                                <span className="text-[color-mix(in_oklab,var(--state-success)_52%,var(--muted-foreground))]">
                                    ORVAE
                                </span>
                            </div>
                            {/* Overlay de carga tipo glass cuando se procesa el login */}
                            {processing && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--o-dark2)_88%,transparent)] backdrop-blur-xl">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="size-8 animate-spin rounded-full border-2 border-[var(--auth-cta-from)] border-t-transparent" />
                                        <p className="font-mono text-xs text-[var(--foreground)]/85">
                                            Iniciando sesión...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                )}
            </Form>

            {status && (
                <div className="mt-4 rounded-sm border border-[color-mix(in_oklab,var(--state-success)_35%,transparent)] bg-[color-mix(in_oklab,var(--state-success)_12%,transparent)] px-4 py-3 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--state-success)]">
                    {status}
                </div>
            )}
        </AuthOrvaeLoginLayout>
    );
}
