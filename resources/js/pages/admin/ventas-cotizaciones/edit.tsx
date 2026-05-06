import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';

import type { ClienteUserOption } from '@/components/admin/form/admin-cliente-select';
import type { SkuPickOption } from '@/components/admin/form/admin-sku-search-select';
import VentasCotizacionCreateForm from '@/components/sales/quotes/VentasCotizacionCreateForm';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import type { BreadcrumbItem } from '@/types';

type QuoteLineEdit = {
    catalog_sku_id: string | null;
    quantity: number;
    unit_price: string;
    line_discount: string;
    igv_applies?: boolean;
    tax_included?: boolean;
    metadata?: Record<string, unknown> | null;
    product_name_snapshot?: string | null;
};

type QuoteEdit = {
    id: string;
    user_id?: number | null;
    customer_legal_name?: string | null;
    customer_document_type?: string | null;
    customer_document_number?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    customer_address?: string | null;
    title?: string | null;
    currency: string;
    status: string;
    notes_internal?: string | null;
    lines: QuoteLineEdit[];
};

type Props = {
    usersForSelect: ClienteUserOption[];
    skusForSelect: SkuPickOption[];
    quote: QuoteEdit;
};

export default function VentasCotizacionEditPage({
    usersForSelect,
    skusForSelect,
    quote,
}: Props) {
    const section = 'ventas-cotizaciones';
    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        { title: quote.id, href: `/panel/ventas-cotizaciones/${quote.id}/edit` },
    ];

    const initialData = {
        user_id: quote.user_id ? String(quote.user_id) : '',
        customer_legal_name: quote.customer_legal_name ?? '',
        customer_document_type: quote.customer_document_type ?? '6',
        customer_document_number: quote.customer_document_number ?? '',
        customer_email: quote.customer_email ?? '',
        customer_phone: quote.customer_phone ?? '',
        customer_address: quote.customer_address ?? '',
        title: quote.title ?? '',
        currency: quote.currency ?? 'PEN',
        status: quote.status ?? 'draft',
        notes_internal: quote.notes_internal ?? '',
        lines:
            quote.lines.length > 0
                ? quote.lines.map((line) => {
                      const metadata = line.metadata ?? {};
                      const manualCode =
                          typeof metadata.manual_code === 'string'
                              ? metadata.manual_code
                              : '';
                      const manualNameMeta =
                          typeof metadata.manual_name === 'string'
                              ? metadata.manual_name
                              : '';
                      const manualNameSnapshot =
                          line.catalog_sku_id === null
                              ? (line.product_name_snapshot ?? '')
                              : '';
                      const manualIgvApplies =
                          typeof line.igv_applies === 'boolean'
                              ? line.igv_applies
                              : true;
                      const manualTaxIncluded =
                          line.catalog_sku_id === null &&
                          typeof line.tax_included === 'boolean'
                              ? line.tax_included
                              : false;

                      return {
                          catalog_sku_id: line.catalog_sku_id ?? '',
                          manual_code: manualCode,
                          manual_name:
                              manualNameMeta !== ''
                                  ? manualNameMeta
                                  : manualNameSnapshot,
                          manual_tax_included: manualTaxIncluded,
                          manual_igv_applies: manualIgvApplies,
                          quantity: Number(line.quantity ?? 1) || 1,
                          unit_price: line.unit_price ?? '0',
                          line_discount: line.line_discount ?? '0',
                      };
                  })
                : [
                  {
                      catalog_sku_id: '',
                      manual_code: '',
                      manual_name: '',
                      manual_tax_included: false,
                      manual_igv_applies: true,
                      quantity: 1,
                      unit_price: '',
                      line_discount: '0',
                  },
                  ],
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar cotización" />
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
                            <h1 className="text-sm font-bold">Editar cotización</h1>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Ajusta cliente, datos fiscales y líneas (catálogo o
                                manuales temporales) antes de enviar.
                            </p>
                        </div>
                    </div>
                </NeuCardRaised>

                <VentasCotizacionCreateForm
                    usersForSelect={usersForSelect}
                    skusForSelect={skusForSelect}
                    initialData={initialData}
                    submitMethod="patch"
                    submitUrl={`/panel/ventas-cotizaciones/${quote.id}`}
                    submitLabel="Guardar cambios"
                />
            </div>
        </AppLayout>
    );
}

