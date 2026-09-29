import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Receipt } from 'lucide-react';

import VentasEntregaForm from '@/components/sales/deliveries/VentasEntregaForm';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export default function VentasEntregaCreatePage() {
    const section = 'ventas-entregas';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        { title: 'Nueva entrega', href: '/panel/ventas-entregas/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva entrega" />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a entregas
                    </Link>
                </div>

                <NeuCardRaised className="mb-6 rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <Receipt className="mt-0.5 size-4 text-[#D28C3C]" />
                        <div>
                            <h1 className="text-sm font-bold">Nueva entrega</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Registra a quién se ofreció el servicio, el plan
                                comprado y su finalización, si incluye IGV, la
                                fecha de entrega y sube la factura y el XML.
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <VentasEntregaForm mode="create" />
            </div>
        </AppLayout>
    );
}
