import { Form, Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';

import {
    AuthOrvaeCardHeader,
    AuthOrvaeSecureFooter,
    AuthOrvaeStatusBanner,
} from '@/components/auth/auth-orvae-parts';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { inertiaFormProps } from '@/lib/inertia-form-props';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthOrvaeLoginLayout
            title="Verifica tu correo"
            description="Confirma tu dirección de correo para activar tu cuenta y acceder al portal."
        >
            <Head title="Verificación de correo" />

            <div className="flex flex-col gap-8">
                <AuthOrvaeCardHeader
                    icon={Mail}
                    title="Verifica tu correo"
                    subtitle="Haz clic en el enlace que te enviamos o solicita uno nuevo."
                />

                {status === 'verification-link-sent' ? (
                    <AuthOrvaeStatusBanner>
                        Se envió un nuevo enlace de verificación al correo que registraste.
                    </AuthOrvaeStatusBanner>
                ) : null}

                <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Si no lo ves, revisa spam o promociones. El enlace caduca por seguridad.
                </p>

                <Form {...inertiaFormProps(send())} className="flex flex-col gap-4">
                    {({ processing }) => (
                        <>
                            <button
                                type="submit"
                                disabled={processing}
                                className="auth-cta w-full cursor-pointer rounded-xl py-3 font-[family-name:var(--font-display)] text-sm font-semibold transition-[filter,opacity] duration-150 disabled:cursor-default"
                            >
                                {processing ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <Spinner className="text-[var(--auth-cta-fg)]" />
                                        Enviando...
                                    </span>
                                ) : (
                                    'Reenviar correo de verificación'
                                )}
                            </button>

                            <TextLink
                                href={logout()}
                                className="text-center font-[family-name:var(--font-body)] text-sm font-medium text-[var(--auth-link)] hover:text-[var(--auth-link-hover)]"
                            >
                                Cerrar sesión
                            </TextLink>
                        </>
                    )}
                </Form>

                <AuthOrvaeSecureFooter />
            </div>
        </AuthOrvaeLoginLayout>
    );
}
