import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

import type { ClienteUserOption } from '@/components/admin/form/admin-cliente-select';
import VentasOrdenCreateForm, {
    type SkuOption,
} from '@/components/sales/orders/VentasOrdenCreateForm';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import panel from '@/routes/panel';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import type { BreadcrumbItem } from '@/types';

type Props = {
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuOption[];
};

export default function VentasOrdenCreatePage({
    usersForSelect,
    skusForSelect,
}: Props) {
    const section = 'ventas-ordenes';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        { title: 'Nueva orden', href: panel.ventasOrdenes.create.url() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva orden" />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a órdenes
                    </Link>
                </div>

                <NeuCardRaised className="mb-6 rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <ShoppingCart className="mt-0.5 size-4 text-[#D28C3C]" />
                        <div>
                            <h1 className="text-sm font-bold">Nueva orden</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Crea un pedido manualmente para un cliente. Las
                                mismas órdenes aparecen en este listado junto a
                                las generadas en checkout.
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <VentasOrdenCreateForm
                    usersForSelect={usersForSelect}
                    skusForSelect={skusForSelect}
                />
            </div>
        </AppLayout>
    );
}
