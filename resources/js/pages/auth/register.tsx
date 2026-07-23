import { Form, Head } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { IdCard, Loader2, Lock, Mail, Phone, Search, User, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { AdminToast, type AdminToastType } from '@/components/ui/admin-toast';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';
import { getCsrfToken } from '@/lib/csrf';
import { cn } from '@/lib/utils';
import { store } from '@/routes/register';
import { inertiaFormProps } from '@/lib/inertia-form-props';

type Props = {
    googleOAuthEnabled?: boolean;
};

type LocalToast = {
    id: number;
    type: AdminToastType;
    title: string;
    description?: string;
};

type PasswordChecks = {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    symbol: boolean;
};

function evaluatePassword(password: string): PasswordChecks {
    return {
        length: password.length >= 12,
        upper: /[A-ZÁÉÍÓÚÑ]/.test(password),
        lower: /[a-záéíóúñ]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password),
    };
}

function passwordScore(checks: PasswordChecks): number {
    return Object.values(checks).filter(Boolean).length;
}

function scoreTone(score: number): { bar: string; label: string; text: string } {
    if (score <= 1) {
        return {
            bar: 'bg-rose-500',
            label: 'Muy débil',
            text: 'text-rose-500',
        };
    }
    if (score <= 2) {
        return {
            bar: 'bg-amber-500',
            label: 'Débil',
            text: 'text-amber-500',
        };
    }
    if (score <= 4) {
        return {
            bar: 'bg-yellow-400',
            label: 'Media',
            text: 'text-yellow-500',
        };
    }

    return {
        bar: 'bg-emerald-500',
        label: 'Fuerte',
        text: 'text-emerald-500',
    };
}

export default function Register({ googleOAuthEnabled = false }: Props) {
    const [documentNumber, setDocumentNumber] = useState('');
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [phoneLen, setPhoneLen] = useState(0);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupToast, setLookupToast] = useState<LocalToast | null>(null);
    const [lookupToastOpen, setLookupToastOpen] = useState(false);
    const lastLookupRef = useRef<string | null>(null);
    const toastIdRef = useRef(0);

    const showLookupToast = (
        type: AdminToastType,
        title: string,
        description?: string,
    ) => {
        toastIdRef.current += 1;
        setLookupToast({
            id: toastIdRef.current,
            type,
            title,
            description,
        });
        setLookupToastOpen(true);
    };

    const documentNumberLen = documentNumber.length;
    const documentNumberMax = documentNumberLen <= 8 ? 8 : 11;
    const canLookup = documentNumberLen === 8 || documentNumberLen === 11;

    const passwordChecks = useMemo(() => evaluatePassword(password), [password]);
    const score = passwordScore(passwordChecks);
    const tone = scoreTone(score);

    const inputUnderlineClassName =
        'w-full border-0 border-b border-[var(--o-border2)] bg-transparent rounded-none shadow-none py-2.5 pl-9 pr-3 font-[family-name:var(--font-body)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--auth-focus-border)] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[var(--auth-focus-border)] transition-colors duration-150';

    const lookupDocument = async (doc: string, { silent = false }: { silent?: boolean } = {}) => {
        const digits = doc.replace(/\D/g, '');
        if (digits.length !== 8 && digits.length !== 11) {
            return;
        }
        if (lastLookupRef.current === digits || lookupLoading) {
            return;
        }

        lastLookupRef.current = digits;
        setLookupLoading(true);

        try {
            const res = await fetch('/register/lookup-doc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ document: digits }),
            });

            const body = (await res.json()) as {
                message?: string;
                name?: string;
                lastname?: string;
                nombres?: string;
                apellidos?: string;
            };

            if (!res.ok) {
                lastLookupRef.current = null;
                if (!silent) {
                    showLookupToast(
                        'error',
                        'No se pudo consultar',
                        body.message ?? 'No se pudo consultar el documento.',
                    );
                }
                return;
            }

            const nextName = (body.nombres ?? body.name ?? '').trim();
            const nextLast = (body.apellidos ?? body.lastname ?? '').trim();

            if (nextName !== '') {
                setName(nextName);
            }
            if (digits.length === 11) {
                setLastname(nextLast !== '' ? nextLast : '—');
            } else if (nextLast !== '') {
                setLastname(nextLast);
            }

            showLookupToast(
                'success',
                'Datos obtenidos',
                'Revisa nombre y apellido.',
            );
        } catch {
            lastLookupRef.current = null;
            if (!silent) {
                showLookupToast(
                    'error',
                    'Error de conexión',
                    'No se pudo contactar el servicio de consulta.',
                );
            }
        } finally {
            setLookupLoading(false);
        }
    };

    useEffect(() => {
        if (!lookupToastOpen) return;
        const timer = window.setTimeout(() => setLookupToastOpen(false), 2800);
        return () => window.clearTimeout(timer);
    }, [lookupToastOpen, lookupToast?.id]);

    useEffect(() => {
        if (!canLookup) {
            return;
        }

        const t = window.setTimeout(() => {
            void lookupDocument(documentNumber, { silent: false });
        }, 350);

        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentNumber, canLookup]);

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
            title="Crea una cuenta"
            description="Ingresa tus datos para crear tu cuenta"
            maxWidthClass="max-w-[520px]"
        >
            <Head title="Registrarse" />
            {lookupToast ? (
                <div className="admin-panel-shell">
                    <div className="admin-toast-stack">
                        <Transition
                            show={lookupToastOpen}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-[-6px]"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-[-6px]"
                        >
                            <AdminToast
                                key={lookupToast.id}
                                type={lookupToast.type}
                                title={lookupToast.title}
                                description={lookupToast.description}
                            />
                        </Transition>
                    </div>
                </div>
            ) : null}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
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

                {googleOAuthEnabled && (
                    <div className="flex flex-col gap-4">
                        <GoogleSignInButton label="Registrarse con Google" />
                        <div className="flex items-center gap-3">
                            <span className="h-px flex-1 bg-[var(--o-border2)]" />
                            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                                o con correo
                            </span>
                            <span className="h-px flex-1 bg-[var(--o-border2)]" />
                        </div>
                    </div>
                )}

                <Form
                    {...inertiaFormProps(store())}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <div className="space-y-4">
                            {/* Documento + celular (documento más ancho para RUC) */}
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
                                <div className="grid gap-1.5 min-w-0">
                                    <Label
                                        htmlFor="document_number"
                                        className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                    >
                                        N.º de documento
                                        <span className="ml-0.5 text-[var(--auth-cta-from)]">*</span>
                                    </Label>
                                    <div className="flex items-stretch gap-2">
                                        <div className="relative min-w-0 flex-1">
                                            <IdCard className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                            <Input
                                                id="document_number"
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className={`${inputUnderlineClassName} pr-11 tracking-wide tabular-nums`}
                                                required
                                                tabIndex={1}
                                                name="document_number"
                                                value={documentNumber}
                                                placeholder="DNI (8) o RUC (11)"
                                                maxLength={11}
                                                onChange={(e) => {
                                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                                                    setDocumentNumber(digits);
                                                    if (digits.length !== 8 && digits.length !== 11) {
                                                        lastLookupRef.current = null;
                                                    }
                                                }}
                                            />
                                            <span
                                                className={cn(
                                                    'pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-[10px]',
                                                    canLookup
                                                        ? 'text-emerald-500'
                                                        : 'text-[var(--auth-icon)]',
                                                )}
                                            >
                                                {documentNumberLen}/{documentNumberMax}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            tabIndex={2}
                                            disabled={!canLookup || lookupLoading}
                                            onClick={() => {
                                                lastLookupRef.current = null;
                                                void lookupDocument(documentNumber);
                                            }}
                                            className={cn(
                                                'size-10 shrink-0 rounded-lg border-0 shadow-sm',
                                                'bg-gradient-to-br from-teal-500 to-emerald-600 text-white',
                                                'hover:from-teal-600 hover:to-emerald-700',
                                                'disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:opacity-60',
                                            )}
                                            aria-label="Consultar DNI o RUC"
                                            title="Consultar DNI (RENIEC) o RUC (SUNAT)"
                                        >
                                            {lookupLoading ? (
                                                <Loader2 className="size-4 animate-spin" aria-hidden />
                                            ) : (
                                                <Search className="size-4" aria-hidden />
                                            )}
                                        </Button>
                                    </div>
                                    <InputError message={errors.document_number} />
                                </div>

                                <div className="grid gap-1.5 min-w-0">
                                    <Label
                                        htmlFor="phone"
                                        className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                    >
                                        Celular
                                        <span className="ml-0.5 text-[var(--auth-cta-from)]">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                        <Input
                                            id="phone"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="9[0-9]{8}"
                                            className={`${inputUnderlineClassName} pr-10 tabular-nums`}
                                            required
                                            tabIndex={3}
                                            name="phone"
                                            placeholder="987654321"
                                            maxLength={9}
                                            onInput={handleDigitsOnlyPhone}
                                        />
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-[10px] text-[var(--auth-icon)]">
                                            {phoneLen}/9
                                        </span>
                                    </div>
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
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
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-1.5">
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
                                            tabIndex={5}
                                            autoComplete="given-name"
                                            name="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Nombre"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-1.5">
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
                                            tabIndex={6}
                                            autoComplete="family-name"
                                            name="lastname"
                                            value={lastname}
                                            onChange={(e) => setLastname(e.target.value)}
                                            placeholder="Apellido"
                                        />
                                    </div>
                                    <InputError message={errors.lastname} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-1.5">
                                    <Label
                                        htmlFor="password"
                                        className="font-[family-name:var(--font-mono)] text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
                                    >
                                        Contraseña
                                        <span className="ml-0.5 text-[var(--auth-cta-from)]">*</span>
                                    </Label>
                                    <div className="relative">
                                        {passwordFocused ? (
                                            <div
                                                role="status"
                                                className="absolute bottom-[calc(100%+0.5rem)] left-0 z-20 w-[min(100%,18rem)] rounded-lg border border-[var(--o-border2)] bg-[var(--background)] p-3 shadow-lg"
                                            >
                                                <div className="mb-2 flex gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={cn(
                                                                'h-1.5 flex-1 rounded-full transition-colors',
                                                                i < score ? tone.bar : 'bg-[var(--o-border2)]',
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <p className={cn('mb-2 text-[11px] font-medium', tone.text)}>
                                                    Seguridad: {tone.label}
                                                </p>
                                                <ul className="space-y-1 text-[11px] text-[var(--muted-foreground)]">
                                                    {(
                                                        [
                                                            ['length', 'Mínimo 12 caracteres'],
                                                            ['upper', 'Una mayúscula'],
                                                            ['lower', 'Una minúscula'],
                                                            ['number', 'Un número'],
                                                            ['symbol', 'Un carácter especial'],
                                                        ] as const
                                                    ).map(([key, label]) => (
                                                        <li
                                                            key={key}
                                                            className={cn(
                                                                passwordChecks[key]
                                                                    ? 'text-emerald-500'
                                                                    : 'text-[var(--muted-foreground)]',
                                                            )}
                                                        >
                                                            {passwordChecks[key] ? '✓' : '○'} {label}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <span className="absolute -bottom-1.5 left-6 size-3 rotate-45 border-b border-r border-[var(--o-border2)] bg-[var(--background)]" />
                                            </div>
                                        ) : null}
                                        <Lock className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--auth-icon)]" />
                                        <PasswordInput
                                            id="password"
                                            required
                                            tabIndex={7}
                                            autoComplete="new-password"
                                            name="password"
                                            placeholder="Contraseña"
                                            className={`${inputUnderlineClassName} pr-10`}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => {
                                                window.setTimeout(() => setPasswordFocused(false), 120);
                                            }}
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-1.5">
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
                                    <InputError message={errors.password_confirmation} />
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
                                {processing && <Spinner className="text-[var(--auth-cta-fg)]" />}
                                Crear cuenta
                            </Button>

                            <label className="mt-1 flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    name="accept_privacy"
                                    required
                                    tabIndex={10}
                                    className="mt-0.5 size-4 rounded border-[var(--o-border2)] bg-transparent text-[var(--auth-cta-from)] focus:ring-[var(--auth-ring)]"
                                />
                                <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                                    Acepto la{' '}
                                    <a
                                        href="/privacidad"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-[var(--auth-link)] underline decoration-[var(--auth-link)]/35 underline-offset-4 hover:text-[var(--auth-link-hover)] hover:decoration-[var(--auth-link-hover)]"
                                    >
                                        Política de privacidad
                                    </a>
                                    .
                                </span>
                            </label>
                            <InputError message={errors.accept_privacy} className="mt-1" />

                            <div className="text-center text-sm text-muted-foreground">
                                ¿Ya tienes una cuenta?{' '}
                                <TextLink
                                    href="/login"
                                    tabIndex={11}
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
