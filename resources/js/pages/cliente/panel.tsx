import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Building2, Receipt } from 'lucide-react';

import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import type { ClientUserProfile } from '@/types/client';

type Props = {
    profile: ClientUserProfile | null;
    licenseStats?: {
        total: number;
        active: number;
        pending: number;
    };
};

export default function ClientePanel({ profile, licenseStats }: Props) {
    const { auth } = usePage().props;
    const user = auth.user;

    const displayName =
        profile?.legal_name ||
        profile?.company_name ||
        (user && 'name' in user
            ? `${user.name}${user.lastname ? ` ${user.lastname}` : ''}`
            : 'Cliente');

    const addressLine =
        profile?.address ||
        profile?.city ||
        'Completa tu dirección en datos de facturación';

    return (
        <ClientPortalLayout
            title="Mi panel"
            headTitle="Mi panel — Área del cliente"
            titleInHeader={false}
            breadcrumbs={[{ label: 'Área del cliente' }]}
        >
            <div className="w-full space-y-6">
                <ClientPageTitleCard title="Mi panel" />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-[color-mix(in_oklab,var(--state-info)_24%,var(--border))] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_90%,transparent),color-mix(in_oklab,var(--state-info)_12%,transparent),color-mix(in_oklab,var(--state-success)_10%,transparent))] p-6 text-foreground shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--state-info)_60%,transparent)]">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_35%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--state-info)_16%,transparent),color-mix(in_oklab,var(--state-success)_14%,transparent))] p-2">
                                    <Building2 className="size-6 text-(--state-info)" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-lg font-semibold leading-tight">
                                        {displayName}
                                    </p>
                                    <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--state-info)_58%,var(--foreground))]">
                                        {addressLine}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href="/cliente/facturacion"
                                    className="inline-flex items-center rounded-lg border border-[color-mix(in_oklab,var(--state-info)_35%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_16%,transparent)] px-3 py-2 text-sm font-medium text-[color-mix(in_oklab,var(--state-info)_70%,var(--foreground))] shadow-sm hover:bg-[color-mix(in_oklab,var(--state-info)_24%,transparent)]"
                                >
                                    Actualizar datos
                                </Link>
                                <Link
                                    href="/cliente/facturacion"
                                    className="inline-flex items-center gap-1 text-sm text-[color-mix(in_oklab,var(--state-success)_62%,var(--foreground))] underline-offset-2 hover:underline"
                                >
                                    Facturación
                                    <Receipt className="size-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-[color-mix(in_oklab,var(--state-info)_22%,var(--border))] bg-[color-mix(in_oklab,var(--card)_90%,var(--background))] p-4 text-sm text-muted-foreground shadow-sm">
                            <p className="font-medium text-foreground">
                                Accesos rápidos
                            </p>
                            <ul className="mt-2 space-y-2">
                                <li>
                                    <Link
                                        href="/software"
                                    className="text-[color-mix(in_oklab,var(--state-info)_68%,var(--foreground))] hover:underline"
                                    >
                                        Ver catálogo
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/cliente/pagos"
                                        className="text-[color-mix(in_oklab,var(--state-info)_68%,var(--foreground))] hover:underline"
                                    >
                                        Pagos y pedidos
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/cliente/facturacion"
                                        className="inline-flex items-center gap-1 font-medium text-[color-mix(in_oklab,var(--state-success)_65%,var(--foreground))] hover:underline"
                                    >
                                        Datos fiscales para factura
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            {[
                                {
                                    label: 'Licencias totales',
                                    value: String(licenseStats?.total ?? 0),
                                },
                                {
                                    label: 'Licencias activas',
                                    value: String(licenseStats?.active ?? 0),
                                },
                                {
                                    label: 'Licencias pendientes',
                                    value: String(licenseStats?.pending ?? 0),
                                },
                                { label: 'Recibos pendientes', value: '0' },
                                { label: 'Tickets', value: '0' },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] p-4 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-foreground">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] p-6 shadow-sm transition-shadow hover:shadow-md">
                            <h2 className="text-lg font-semibold text-foreground">
                                Productos / servicios
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Cuando contrates servicios, aparecerán aquí con
                                estado y enlaces de administración.
                            </p>
                            <div className="mt-6 rounded-lg border border-dashed border-[color-mix(in_oklab,var(--state-alert)_35%,var(--border))] bg-[color-mix(in_oklab,var(--state-alert)_8%,transparent)] py-12 text-center text-sm text-zinc-500">
                                Aún no hay servicios registrados.
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_92%,var(--background))] p-6 shadow-sm transition-shadow hover:shadow-md">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Soporte reciente
                                </h2>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Sin tickets por ahora.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientPortalLayout>
    );
}
