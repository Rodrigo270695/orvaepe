import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import ClientPortalController from '@/actions/App/Http/Controllers/Client/ClientPortalController';
import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import { inertiaFormProps } from '@/lib/inertia-form-props';
import { send } from '@/routes/verification';

export default function ClientePerfil({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    if (!auth.user) {
        return null;
    }

    const user = auth.user;

    return (
        <ClientPortalLayout
            title="Mi perfil"
            headTitle="Mi perfil — Área del cliente"
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Perfil' },
            ]}
        >
            <Head title="Mi perfil" />

            <div className="w-full space-y-5">
                <ClientPageTitleCard title="Mi perfil" />
                <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] px-5 py-4 shadow-sm md:px-6">
                    <Heading
                        variant="small"
                        title="Información personal"
                        description="Actualiza tu nombre, documento y datos de contacto."
                    />
                </div>

                <Form
                    {...inertiaFormProps(ClientPortalController.updateProfile())}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6 rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] p-6 shadow-sm md:p-8"
                >
                    {({ processing, recentlySuccessful, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Nombre"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="lastname">
                                    Apellido
                                    <span className="ml-0.5 text-(--o-amber)">
                                        *
                                    </span>
                                </Label>

                                <Input
                                    id="lastname"
                                    className="mt-1 block w-full"
                                    defaultValue={user.lastname ?? ''}
                                    name="lastname"
                                    required
                                    autoComplete="family-name"
                                    placeholder="Apellido"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.lastname}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Correo electrónico
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Correo electrónico"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="document_number">
                                    N.º de documento (DNI o RUC)
                                    <span className="ml-0.5 text-(--o-amber)">
                                        *
                                    </span>
                                </Label>

                                <Input
                                    id="document_number"
                                    className="mt-1 block w-full"
                                    defaultValue={user.document_number ?? ''}
                                    name="document_number"
                                    required
                                    placeholder="8 o 11 dígitos"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.document_number}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Celular (9 dígitos)</Label>

                                <Input
                                    id="phone"
                                    className="mt-1 block w-full"
                                    defaultValue={user.phone ?? ''}
                                    name="phone"
                                    placeholder="987654321"
                                    maxLength={9}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.phone}
                                />
                            </div>

                            {mustVerifyEmail &&
                                user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-(--o-warm)">
                                            Tu correo electrónico no está
                                            verificado.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-medium text-(--o-dark2) underline decoration-(--o-border2) underline-offset-4 transition-colors hover:decoration-(--o-tech)"
                                            >
                                                Reenviar correo de verificación
                                            </Link>
                                            .
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-(--o-success)">
                                                Se ha enviado un nuevo enlace de
                                                verificación a tu correo.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex flex-wrap items-center justify-end gap-4 border-t border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] pt-6">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="h-11 min-w-40 cursor-pointer bg-[linear-gradient(120deg,var(--state-info),var(--state-success))] text-[15px] font-semibold text-[color-mix(in_oklab,white_95%,var(--foreground))] shadow-[0_12px_28px_-18px_var(--state-info)] hover:brightness-105 disabled:cursor-not-allowed disabled:bg-zinc-400"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : 'Guardar cambios'}
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        Guardado
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
