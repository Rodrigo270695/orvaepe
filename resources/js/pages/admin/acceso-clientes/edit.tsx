import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, UserRoundPen } from 'lucide-react';

import AccesoClienteEditForm, {
    type AccesoClienteEditData,
} from '@/components/acceso/clientes/AccesoClienteEditForm';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    client: AccesoClienteEditData;
};

export default function AccesoClientesEditPage({ client }: Props) {
    const section = 'acceso-clientes';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        {
            title: 'Editar cliente',
            href: `/panel/acceso-clientes/${client.id}/edit`,
        },
    ];

    const fullName = [client.name, client.lastname].filter(Boolean).join(' ');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar · ${fullName || client.email}`} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a clientes
                    </Link>
                    <Link
                        href={`/panel/acceso-clientes/${client.id}/facturas`}
                        className="text-xs font-medium text-[#4A80B8] hover:underline"
                    >
                        Ver facturas del portal
                    </Link>
                </div>

                <NeuCardRaised className="mb-6 rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <UserRoundPen className="mt-0.5 size-4 text-[#4A80B8]" />
                        <div>
                            <h1 className="text-sm font-bold">
                                Editar cliente
                            </h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Corrige correo, documento o RUC cuando chocan al
                                crear una orden. Los cambios aplican a la cuenta
                                del portal y a los datos de facturación.
                            </p>
                            <p className="mt-2 font-mono text-[11px] text-[#4A80B8]">
                                {client.email}
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <AccesoClienteEditForm key={client.id} client={client} />
            </div>
        </AppLayout>
    );
}
