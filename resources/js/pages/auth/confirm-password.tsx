import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import {
    AuthOrvaeCardHeader,
    AuthOrvaeSecureFooter,
    authPasswordUnderlineClassName,
} from '@/components/auth/auth-orvae-parts';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { store } from '@/routes/password/confirm';
import { inertiaFormProps } from '@/lib/inertia-form-props';

export default function ConfirmPassword() {
    return (
        <AuthOrvaeLoginLayout
            title="Confirma tu contraseña"
            description="Esta es un área segura de la aplicación. Confirma tu contraseña antes de continuar."
        >
            <Head title="Confirmar contraseña" />

            <Form {...inertiaFormProps(store())} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="flex flex-col gap-8">
                        <AuthOrvaeCardHeader
                            icon={Lock}
                            accent="alert"
                            title="Confirma tu contraseña"
                            subtitle="Por seguridad, vuelve a ingresar tu clave para continuar."
                        />
                        <div className="flex flex-col gap-2">
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
                                    placeholder="Contraseña"
                                    autoComplete="current-password"
                                    className={authPasswordUnderlineClassName}
                                    autoFocus
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <button
                            type="submit"
                            className="auth-cta w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-display)] text-sm font-semibold transition-[filter,opacity] duration-150 disabled:cursor-default"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner className="text-[var(--auth-cta-fg)]" />}
                            Confirmar contraseña
                        </button>
                        <AuthOrvaeSecureFooter />
                    </div>
                )}
            </Form>
        </AuthOrvaeLoginLayout>
    );
}
