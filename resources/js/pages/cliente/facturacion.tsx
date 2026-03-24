import { Form, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import InputError from '@/components/input-error';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import type { ClientUserProfile } from '@/types/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    profile: ClientUserProfile | null;
};

const labelClass = 'text-sm font-semibold text-foreground/85';

export default function ClienteFacturacion({ profile }: Props) {
    const { auth } = usePage().props;
    const user = auth.user;

    const defaultRuc =
        profile?.ruc ??
        (user?.document_number?.length === 11
            ? user.document_number
            : '');
    const defaultPhone = profile?.phone ?? user?.phone ?? '';
    const defaultBillingEmail = profile?.billing_email ?? user?.email ?? '';

    return (
        <ClientPortalLayout
            title="Datos de facturación"
            headTitle="Datos de facturación"
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Facturación' },
            ]}
        >
            <div className="mx-auto max-w-3xl space-y-5">
                <ClientPageTitleCard title="Datos de facturación" />
                <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] px-5 py-4 shadow-sm md:px-6">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Información de facturación
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Estos datos se usarán como adquirente en tus comprobantes electrónicos.
                        Mantén el RUC y la razón social alineados con SUNAT.
                    </p>
                </div>

                <Form
                    action="/cliente/facturacion"
                    method="patch"
                    options={{ preserveScroll: true }}
                    className="space-y-6 rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] p-6 shadow-sm md:p-8"
                >
                    {({ processing, recentlySuccessful, errors }) => (
                        <>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="legal_name" className={labelClass}>
                                        Razón social / nombre fiscal
                                    </Label>
                                    <Input
                                        id="legal_name"
                                        name="legal_name"
                                        defaultValue={profile?.legal_name ?? ''}
                                        placeholder="Ej. MI EMPRESA S.A.C."
                                        className="h-11 text-[15px]"
                                    />
                                    <InputError message={errors.legal_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company_name" className={labelClass}>
                                        Nombre comercial
                                    </Label>
                                    <Input
                                        id="company_name"
                                        name="company_name"
                                        defaultValue={profile?.company_name ?? ''}
                                        className="h-11 text-[15px]"
                                    />
                                    <InputError message={errors.company_name} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ruc" className={labelClass}>
                                        RUC (11 dígitos)
                                    </Label>
                                    <Input
                                        id="ruc"
                                        name="ruc"
                                        inputMode="numeric"
                                        maxLength={11}
                                        defaultValue={defaultRuc}
                                        placeholder="20XXXXXXXXX"
                                        className="h-11 text-[15px]"
                                    />
                                    <InputError message={errors.ruc} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_status" className={labelClass}>
                                        Condición / régimen (opcional)
                                    </Label>
                                    <Input
                                        id="tax_status"
                                        name="tax_status"
                                        defaultValue={profile?.tax_status ?? ''}
                                        placeholder="Ej. afecto a IGV"
                                        className="h-11 text-[15px]"
                                    />
                                    <InputError message={errors.tax_status} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className={labelClass}>
                                    Dirección fiscal
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={profile?.address ?? ''}
                                    className="h-11 text-[15px]"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className={labelClass}>
                                        Ciudad / provincia
                                    </Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        defaultValue={profile?.city ?? ''}
                                        className="h-11 text-[15px]"
                                    />
                                    <InputError message={errors.city} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country" className={labelClass}>
                                        País (ISO)
                                    </Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        defaultValue={profile?.country ?? 'PE'}
                                        maxLength={2}
                                        className="h-11 text-[15px] uppercase"
                                    />
                                    <InputError message={errors.country} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="billing_email" className={labelClass}>
                                        Correo para facturación
                                    </Label>
                                    <Input
                                        id="billing_email"
                                        name="billing_email"
                                        type="email"
                                        defaultValue={defaultBillingEmail}
                                        className="h-11 text-[15px]"
                                    />
                                    <InputError message={errors.billing_email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className={labelClass}>
                                        Teléfono de contacto
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={defaultPhone}
                                        className="h-11 text-[15px]"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] pt-6">
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="mr-4 self-center text-sm text-muted-foreground" aria-live="polite">
                                        Datos guardados
                                    </p>
                                </Transition>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-11 min-w-40 cursor-pointer bg-[linear-gradient(120deg,var(--state-info),var(--state-success))] text-[15px] font-semibold text-[color-mix(in_oklab,white_95%,var(--foreground))] shadow-[0_12px_28px_-18px_var(--state-info)] hover:brightness-105 disabled:cursor-not-allowed disabled:bg-zinc-400"
                                >
                                    {processing ? 'Guardando…' : 'Guardar datos'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </ClientPortalLayout>
    );
}
