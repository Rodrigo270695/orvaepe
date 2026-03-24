import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';

import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import { inertiaFormProps } from '@/lib/inertia-form-props';

export default function ClienteSeguridad() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <ClientPortalLayout
            title="Seguridad"
            headTitle="Seguridad — Área del cliente"
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Seguridad' },
            ]}
        >
            <Head title="Seguridad" />

            <div className="mx-auto max-w-xl space-y-5">
                <ClientPageTitleCard title="Seguridad" />
                <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] px-5 py-4 shadow-sm md:px-6">
                    <Heading
                        variant="small"
                        title="Contraseña"
                        description="Usa una contraseña larga y única para proteger tu cuenta."
                    />
                </div>

                <Form
                    {...inertiaFormProps(SecurityController.update())}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6 rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] p-6 shadow-sm md:p-8"
                >
                    {({ errors, processing, recentlySuccessful }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    Contraseña actual
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    placeholder="Contraseña actual"
                                />

                                <InputError
                                    message={errors.current_password}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Nueva contraseña
                                </Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Nueva contraseña"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar contraseña
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Confirmar contraseña"
                                />

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-4 border-t border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] pt-6">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-password-button"
                                    className="h-11 min-w-40 cursor-pointer bg-[linear-gradient(120deg,var(--state-info),var(--state-success))] text-[15px] font-semibold text-[color-mix(in_oklab,white_95%,var(--foreground))] shadow-[0_12px_28px_-18px_var(--state-info)] hover:brightness-105 disabled:cursor-not-allowed disabled:bg-zinc-400"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : 'Guardar contraseña'}
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-[color-mix(in_oklab,var(--state-success)_72%,var(--foreground))]" aria-live="polite">
                                        Contraseña actualizada
                                    </p>
                                </Transition>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </ClientPortalLayout>
    );
}
