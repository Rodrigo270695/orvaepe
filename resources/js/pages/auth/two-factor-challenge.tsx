import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { store } from '@/routes/two-factor/login';
import { inertiaFormProps } from '@/lib/inertia-form-props';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Código de recuperación',
                description:
                    'Confirma el acceso a tu cuenta ingresando uno de tus códigos de recuperación de emergencia.',
                toggleText: 'iniciar sesión usando un código de autenticación',
            };
        }

        return {
            title: 'Código de autenticación',
            description:
                'Ingresa el código de autenticación generado por tu aplicación de autenticación.',
            toggleText: 'iniciar sesión usando un código de recuperación',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <AuthOrvaeLoginLayout
            title="Verificación de seguridad"
            description="Confirma tu identidad para terminar de iniciar sesión"
        >
            <Head title="Autenticación en dos pasos">
                <meta name="theme-color" content="#1C1410" />
            </Head>

            <Form
                {...inertiaFormProps(store())}
                className="flex flex-col gap-6"
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <div className="relative flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)]">
                                {authConfigContent.title}
                            </h1>
                            <p className="font-[family-name:var(--font-body)] text-sm text-[var(--muted-foreground)]">
                                {authConfigContent.description}
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {showRecoveryInput ? (
                                <div className="flex flex-col gap-2">
                                    <label className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                                        Código de recuperación
                                    </label>
                                    <Input
                                        name="recovery_code"
                                        type="text"
                                        placeholder="Ingresa tu código de recuperación"
                                        autoFocus={showRecoveryInput}
                                        required
                                        className="h-11 border-[var(--o-border2)] bg-transparent"
                                    />
                                    <InputError message={errors.recovery_code} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="flex w-full items-center justify-center">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                        >
                                            <InputOTPGroup>
                                                {Array.from({ length: OTP_MAX_LENGTH }, (_, index) => (
                                                    <InputOTPSlot key={index} index={index} />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="auth-cta h-11 w-full rounded-xl font-[family-name:var(--font-display)] font-semibold"
                                disabled={processing}
                            >
                                {processing ? 'Verificando...' : 'Continuar'}
                            </Button>

                            <div className="text-center text-sm text-[var(--muted-foreground)]">
                                <span>o también puedes </span>
                                <button
                                    type="button"
                                    className="cursor-pointer text-[var(--auth-link)] underline decoration-[var(--auth-link)]/35 underline-offset-4 hover:text-[var(--auth-link-hover)]"
                                    onClick={() => toggleRecoveryMode(clearErrors)}
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 border-t border-[var(--o-border2)] pt-5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted-foreground)]">
                            <KeyRound className="size-3.5 text-[var(--state-info)]" />
                            <span>Doble verificación activa</span>
                            <span className="opacity-50">·</span>
                            <ShieldCheck className="size-3.5 text-[var(--state-success)]" />
                        </div>
                    </div>
                )}
            </Form>
        </AuthOrvaeLoginLayout>
    );
}
