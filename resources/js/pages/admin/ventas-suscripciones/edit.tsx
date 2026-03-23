import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, RefreshCcw } from 'lucide-react';

import type { ClienteUserOption } from '@/components/admin/form/admin-cliente-select';
import type { SkuOption } from '@/components/sales/orders/VentasOrdenCreateForm';
import VentasSuscripcionForm, {
    type SubscriptionFormSubscription,
} from '@/components/sales/subscriptions/VentasSuscripcionForm';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import panel from '@/routes/panel';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import type { BreadcrumbItem } from '@/types';

type Props = {
    subscription: SubscriptionFormSubscription;
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuOption[];
};

export default function VentasSuscripcionEditPage({
    subscription,
    usersForSelect,
    skusForSelect,
}: Props) {
    const section = 'ventas-suscripciones';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        {
            title: 'Editar suscripción',
            href: panel.ventasSuscripciones.edit.url(subscription.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar suscripción" />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a suscripciones
                    </Link>
                </div>

                <NeuCardRaised className="mb-6 rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <RefreshCcw className="mt-0.5 size-4 text-[#D28C3C]" />
                        <div>
                            <h1 className="text-sm font-bold">
                                Editar suscripción
                            </h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Modifica estado, períodos, ítems o identificadores
                                del gateway. Usa “Cancelar” en el listado para
                                cerrar la suscripción sin borrar el registro.
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <VentasSuscripcionForm
                    key={subscription.id}
                    mode="edit"
                    subscription={subscription}
                    usersForSelect={usersForSelect}
                    skusForSelect={skusForSelect}
                />
            </div>
        </AppLayout>
    );
}
