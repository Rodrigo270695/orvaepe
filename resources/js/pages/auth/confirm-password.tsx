import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { store } from '@/routes/password/confirm';
import { inertiaFormProps } from '@/lib/inertia-form-props';

export default function ConfirmPassword() {
    const passwordUnderlineClassName =
        'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-3 pl-9 pr-10 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[var(--o-amber)]/60 transition-colors duration-150';

    return (
        <AuthOrvaeLoginLayout
            title="Confirma tu contraseña"
            description="Esta es un área segura de la aplicación. Confirma tu contraseña antes de continuar."
        >
            <Head title="Confirmar contraseña" />

            <Form {...inertiaFormProps(store())} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="flex flex-col gap-6">
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
                                    className={passwordUnderlineClassName}
                                    autoFocus
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <Button
                            type="submit"
                            className="w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--o-void)] transition-opacity duration-150 hover:opacity-95 disabled:cursor-default disabled:opacity-60"
                            disabled={processing}
                            data-test="confirm-password-button"
                            style={{
                                background:
                                    'linear-gradient(135deg, var(--o-amber) 0%, var(--o-amber2) 100%)',
                            }}
                        >
                            {processing && <Spinner />}
                            Confirmar contraseña
                        </Button>
                    </div>
                )}
            </Form>
        </AuthOrvaeLoginLayout>
    );
}
