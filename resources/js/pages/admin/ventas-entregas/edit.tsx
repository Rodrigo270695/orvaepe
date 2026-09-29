import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Receipt } from 'lucide-react';

import VentasEntregaForm from '@/components/sales/deliveries/VentasEntregaForm';
import type { DeliveryRow } from '@/components/sales/deliveries/deliveryTypes';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    delivery: DeliveryRow;
};

export default function VentasEntregaEditPage({ delivery }: Props) {
    const section = 'ventas-entregas';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        {
            title: delivery.legal_name,
            href: `/panel/ventas-entregas/${delivery.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar entrega · ${delivery.legal_name}`} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={`/panel/ventas-entregas/${delivery.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver al detalle
                    </Link>
                </div>

                <NeuCardRaised className="mb-6 rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <Receipt className="mt-0.5 size-4 text-[#D28C3C]" />
                        <div>
                            <h1 className="text-sm font-bold">Editar entrega</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Corrige los datos o reemplaza la factura y el
                                XML. Si no eliges un archivo nuevo, se conserva
                                el actual.
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <VentasEntregaForm mode="edit" delivery={delivery} />
            </div>
        </AppLayout>
    );
}
