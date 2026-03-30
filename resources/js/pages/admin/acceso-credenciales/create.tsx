import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, KeyRound } from 'lucide-react';

import AccesoCredencialesSecretForm from '@/components/acceso/credenciales/AccesoCredencialesSecretForm';
import type { EntitlementOption } from '@/components/acceso/credenciales/AccesoCredencialesSecretForm';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import type { BreadcrumbItem } from '@/types';

const STORE_URL = '/panel/acceso-credenciales';

type KindOption = { value: string; label: string };

type Props = {
    entitlementOptions: EntitlementOption[];
    selectedEntitlementId: string | null;
    kindOptions: KindOption[];
};

export default function AccesoCredencialesCreatePage({
    entitlementOptions,
    selectedEntitlementId,
    kindOptions,
}: Props) {
    const section = 'acceso-credenciales';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        {
            title: 'Registrar credencial',
            href: `${listHref}/create`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrar credencial" />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a credenciales
                    </Link>
                </div>

                <NeuCardRaised className="mb-6 rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <KeyRound className="mt-0.5 size-4 text-[#D28C3C]" />
                        <div>
                            <h1 className="text-sm font-bold">
                                Registrar credencial o API key
                            </h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Crea un registro en{' '}
                                <span className="font-mono">entitlement_secrets</span>{' '}
                                ligado a un derecho de uso ya existente (p. ej. tras
                                un pago). El valor se guarda cifrado y no se vuelve a
                                mostrar en el listado.
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <AccesoCredencialesSecretForm
                    entitlementOptions={entitlementOptions}
                    selectedEntitlementId={selectedEntitlementId}
                    kindOptions={kindOptions}
                    storeUrl={STORE_URL}
                />
            </div>
        </AppLayout>
    );
}
