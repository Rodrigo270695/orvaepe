import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';

import type { ClienteUserOption } from '@/components/admin/form/admin-cliente-select';
import type { SkuPickOption } from '@/components/admin/form/admin-sku-search-select';
import VentasCotizacionCreateForm from '@/components/sales/quotes/VentasCotizacionCreateForm';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import panel from '@/routes/panel';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import type { BreadcrumbItem } from '@/types';

type Props = {
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuPickOption[];
};

export default function VentasCotizacionCreatePage({
    usersForSelect,
    skusForSelect,
}: Props) {
    const section = 'ventas-cotizaciones';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        { title: 'Nueva cotización', href: panel.ventasCotizaciones.create.url() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva cotización" />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4">
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a cotizaciones
                    </Link>
                </div>

                <NeuCardRaised className="mb-6 rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 size-4 text-[#D28C3C]" />
                        <div>
                            <h1 className="text-sm font-bold">Nueva cotización</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Cliente con cuenta (opcional) o datos de empresa
                                sin registro web; líneas desde el catálogo (precio
                                listado e IGV del SKU).
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <VentasCotizacionCreateForm
                    usersForSelect={usersForSelect}
                    skusForSelect={skusForSelect}
                />
            </div>
        </AppLayout>
    );
}
