import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileCode2, FileText, Pencil, Receipt } from 'lucide-react';

import { formatOrderMoney } from '@/components/sales/orders/orderDisplay';

import {
    deliveryInvoiceUrl,
    deliveryXmlUrl,
    formatDeliveryDate,
    planPeriodLabel,
    type DeliveryRow,
} from '@/components/sales/deliveries/deliveryTypes';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    delivery: DeliveryRow;
};

export default function VentasEntregaShowPage({ delivery }: Props) {
    const section = 'ventas-entregas';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        {
            title: delivery.legal_name,
            href: `/panel/ventas-entregas/${delivery.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Entrega · ${delivery.legal_name}`} />
            <div className="px-4 py-6 md:px-6 lg:px-7">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={listHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Volver a entregas
                    </Link>
                    <Link href={`/panel/ventas-entregas/${delivery.id}/edit`}>
                        <NeuButtonRaised type="button" className="cursor-pointer">
                            <Pencil className="size-4 text-[#4A80B8]" />
                            Editar
                        </NeuButtonRaised>
                    </Link>
                </div>

                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <Receipt className="mt-0.5 size-4 text-[#D28C3C]" />
                        <div>
                            <h1 className="text-sm font-bold">
                                {delivery.legal_name}
                            </h1>
                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                                RUC {delivery.ruc}
                            </p>
                        </div>
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--o-warm)">
                                Fecha de entrega
                            </dt>
                            <dd className="mt-1 text-sm">
                                {formatDeliveryDate(delivery.delivered_at)}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--o-warm)">
                                Plan comprado
                            </dt>
                            <dd className="mt-1 text-sm">
                                {planPeriodLabel(delivery.plan_period)}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--o-warm)">
                                Finalización del plan
                            </dt>
                            <dd className="mt-1 text-sm">
                                {formatDeliveryDate(delivery.plan_ends_at)}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--o-warm)">
                                Monto de la venta
                            </dt>
                            <dd className="mt-1 text-sm font-medium">
                                {formatOrderMoney(delivery.sale_amount ?? '0', 'PEN')}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--o-warm)">
                                IGV
                            </dt>
                            <dd className="mt-1">
                                <span
                                    className={[
                                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                                        delivery.includes_igv
                                            ? 'bg-[#4A9A72]/12 text-[#4A9A72]'
                                            : 'bg-[#D28C3C]/12 text-[#D28C3C]',
                                    ].join(' ')}
                                >
                                    {delivery.includes_igv
                                        ? 'Incluye IGV'
                                        : 'No incluye IGV'}
                                </span>
                            </dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--o-warm)">
                                Descripción del producto
                            </dt>
                            <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                {delivery.product_description}
                            </dd>
                        </div>
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {delivery.has_invoice ? (
                            <a
                                href={deliveryInvoiceUrl(delivery.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#b45309]/10 px-3 py-2 text-xs font-semibold text-[#b45309]"
                            >
                                <FileText className="size-4" />
                                {delivery.invoice_original_name ?? 'Descargar factura'}
                            </a>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                Sin factura adjunta
                            </span>
                        )}
                        {delivery.has_xml ? (
                            <a
                                href={deliveryXmlUrl(delivery.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6]/12 px-3 py-2 text-xs font-semibold text-[#8B5CF6]"
                            >
                                <FileCode2 className="size-4" />
                                {delivery.xml_original_name ?? 'Descargar XML'}
                            </a>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                Sin XML adjunto
                            </span>
                        )}
                    </div>
                </NeuCardRaised>
            </div>
        </AppLayout>
    );
}
