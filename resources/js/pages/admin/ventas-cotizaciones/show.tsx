import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileDown, FileText, Mail, Pencil } from 'lucide-react';
import * as React from 'react';

import { quoteStatusLabel } from '@/components/sales/quotes/quoteDisplay';
import VentasCotizacionSendEmailModal from '@/components/sales/quotes/VentasCotizacionSendEmailModal';
import { panelPath, panelSectionTitle } from '@/config/admin-panel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { NeuButtonRaised } from '@/components/ui/neu-button-raised';
import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import panel from '@/routes/panel';
import type { BreadcrumbItem } from '@/types';

type QuoteLineShow = {
    id: string;
    product_name_snapshot: string;
    sku_name_snapshot: string | null;
    quantity: number;
    unit_price: string;
    tax_included: boolean;
    igv_applies: boolean;
    tax_rate: string | null;
    line_discount: string;
    tax_amount: string;
    line_total: string;
    metadata: Record<string, unknown> | null;
};

type QuoteShow = {
    id: string;
    quote_number: string;
    status: string;
    currency: string;
    subtotal: string;
    discount_total: string;
    tax_total: string;
    grand_total: string;
    title: string | null;
    customer_legal_name: string | null;
    customer_document_type: string | null;
    customer_document_number: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    billing_snapshot: Record<string, unknown> | null;
    notes_internal: string | null;
    notes_customer: string | null;
    valid_until: string | null;
    created_at: string;
    lines: QuoteLineShow[];
    user?: {
        name: string;
        lastname?: string | null;
        email: string;
    } | null;
    creator?: { name: string; email: string } | null;
};

type Props = {
    quote: QuoteShow;
    /** Nombre completo del creador (perfil legal o nombre + apellidos). */
    creatorDisplayName: string;
    /** Correo sugerido para enviar la cotización (cliente en cotización o cuenta). */
    defaultQuoteEmail: string;
    /** Si es false (ej. convertida), no se puede enviar por correo. */
    canSendQuoteEmail: boolean;
};

function formatMoney(amount: string, currency: string): string {
    const n = Number.parseFloat(amount);
    if (Number.isNaN(n)) {
        return `${currency} ${amount}`;
    }
    return `${currency} ${n.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function yesNo(v: boolean): string {
    return v ? 'Sí' : 'No';
}

export default function VentasCotizacionShowPage({
    quote,
    creatorDisplayName,
    defaultQuoteEmail,
    canSendQuoteEmail,
}: Props) {
    const section = 'ventas-cotizaciones';
    const [sendOpen, setSendOpen] = React.useState(false);

    const listHref = panelPath(section);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel', href: dashboard() },
        { title: panelSectionTitle(section), href: listHref },
        {
            title: quote.quote_number,
            href: `/panel/ventas-cotizaciones/${quote.id}`,
        },
    ];

    const clientLabel =
        quote.user?.name?.trim() ||
        quote.customer_legal_name?.trim() ||
        '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cotización ${quote.quote_number}`} />
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

                <NeuCardRaised className="rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                            <FileText className="mt-0.5 size-4 text-[#D28C3C]" />
                            <div>
                                <h1 className="font-mono text-sm font-bold text-[#4A80B8]">
                                    {quote.quote_number}
                                </h1>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    {quoteStatusLabel(quote.status)}
                                    {quote.user ? (
                                        <>
                                            {' '}
                                            · {quote.user.name}{' '}
                                            <span className="text-muted-foreground/80">
                                                ({quote.user.email})
                                            </span>
                                        </>
                                    ) : null}
                                </p>
                                {quote.title ? (
                                    <p className="mt-1 text-xs text-foreground">
                                        {quote.title}
                                    </p>
                                ) : null}
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Destinatario:{' '}
                                    <span className="font-medium text-foreground">
                                        {clientLabel}
                                    </span>
                                </p>
                                {quote.customer_document_number ? (
                                    <p className="mt-0.5 text-[10px] font-mono text-muted-foreground">
                                        Doc.{' '}
                                        {quote.customer_document_type ?? '—'}{' '}
                                        {quote.customer_document_number}
                                    </p>
                                ) : null}
                                {quote.creator ? (
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        Creada por:{' '}
                                        <span className="font-medium text-foreground">
                                            {creatorDisplayName}
                                        </span>{' '}
                                        <span className="text-muted-foreground/80">
                                            ({quote.creator.email})
                                        </span>
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 self-stretch sm:flex-row sm:items-center sm:self-auto">
                            {quote.status === 'draft' ? (
                                <Link
                                    href={`/panel/ventas-cotizaciones/${quote.id}/edit`}
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#4A80B8]/35 bg-[#4A80B8]/10 px-3 py-2 text-xs font-medium text-[#4A80B8] transition-colors hover:bg-[#4A80B8]/18"
                                >
                                    <Pencil className="size-4" />
                                    Editar
                                </Link>
                            ) : null}
                            <a
                                href={panel.ventasCotizaciones.pdf.url(quote.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#b45309]/35 bg-[#b45309]/10 px-3 py-2 text-xs font-medium text-[#b45309] transition-colors hover:bg-[#b45309]/18"
                            >
                                <FileDown className="size-4" />
                                Ver PDF
                            </a>
                            <NeuButtonRaised
                                type="button"
                                disabled={!canSendQuoteEmail}
                                title={
                                    canSendQuoteEmail
                                        ? undefined
                                        : 'No se puede enviar una cotización convertida.'
                                }
                                onClick={() => canSendQuoteEmail && setSendOpen(true)}
                                className="cursor-pointer justify-center gap-2 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                <Mail className="size-4 text-[#4A80B8]" />
                                Enviar por correo
                            </NeuButtonRaised>
                        </div>
                    </div>
                </NeuCardRaised>

                <VentasCotizacionSendEmailModal
                    open={sendOpen}
                    onOpenChange={setSendOpen}
                    quoteId={quote.id}
                    quoteNumber={quote.quote_number}
                    defaultEmail={defaultQuoteEmail}
                    canSend={canSendQuoteEmail}
                />

                <div className="neumorph-inset mt-4 rounded-xl border border-border/60 p-4 md:p-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Líneas de la cotización
                    </h2>
                    {quote.lines.length === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Sin líneas.
                        </p>
                    ) : (
                        <>
                            <div className="mt-3 space-y-3 md:hidden">
                                {quote.lines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="rounded-lg border border-border/60 bg-black/5 p-3 dark:bg-black/20"
                                    >
                                        <p className="text-sm font-medium leading-snug text-foreground">
                                            {line.product_name_snapshot}
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            {line.sku_name_snapshot ?? '—'}
                                        </p>
                                        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                                            <dt className="text-muted-foreground">
                                                Cantidad
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {line.quantity}
                                            </dd>
                                            <dt className="text-muted-foreground">
                                                P. unitario
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {formatMoney(
                                                    line.unit_price,
                                                    quote.currency,
                                                )}
                                            </dd>
                                            <dt className="text-muted-foreground">
                                                IGV aplica
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {yesNo(line.igv_applies)}
                                            </dd>
                                            <dt className="text-muted-foreground">
                                                Precio c/ IGV
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {yesNo(line.tax_included)}
                                            </dd>
                                            <dt className="text-muted-foreground">
                                                Descuento
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {formatMoney(
                                                    line.line_discount,
                                                    quote.currency,
                                                )}
                                            </dd>
                                            <dt className="text-muted-foreground">
                                                IGV / imp.
                                            </dt>
                                            <dd className="text-right font-mono text-foreground">
                                                {formatMoney(
                                                    line.tax_amount,
                                                    quote.currency,
                                                )}
                                            </dd>
                                            <dt className="col-span-2 border-t border-border/40 pt-2 font-semibold text-foreground">
                                                Total línea
                                            </dt>
                                            <dd className="col-span-2 border-border/40 pt-2 text-right font-mono text-sm font-semibold text-[#4A80B8]">
                                                {formatMoney(
                                                    line.line_total,
                                                    quote.currency,
                                                )}
                                            </dd>
                                        </dl>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead>
                                        <tr className="text-xs text-muted-foreground">
                                            <th className="px-2 py-2 font-semibold">
                                                Producto / SKU
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                Cant.
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                P. unit.
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                IGV
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                c/IGV
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                Desc.
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                IGV / imp.
                                            </th>
                                            <th className="px-2 py-2 font-semibold">
                                                Total línea
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quote.lines.map((line) => (
                                            <tr
                                                key={line.id}
                                                className="border-t border-border/50"
                                            >
                                                <td className="px-2 py-2 align-top">
                                                    <span className="font-medium">
                                                        {
                                                            line.product_name_snapshot
                                                        }
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                                        {line.sku_name_snapshot ??
                                                            '—'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {line.quantity}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {formatMoney(
                                                        line.unit_price,
                                                        quote.currency,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {yesNo(line.igv_applies)}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {yesNo(line.tax_included)}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {formatMoney(
                                                        line.line_discount,
                                                        quote.currency,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs">
                                                    {formatMoney(
                                                        line.tax_amount,
                                                        quote.currency,
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 font-mono text-xs font-medium">
                                                    {formatMoney(
                                                        line.line_total,
                                                        quote.currency,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                <div className="neumorph-inset mt-4 rounded-xl border border-border/60 p-4 md:p-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Totales
                    </h2>
                    <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Subtotal</dt>
                            <dd className="font-mono">
                                {formatMoney(quote.subtotal, quote.currency)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Descuentos</dt>
                            <dd className="font-mono">
                                {formatMoney(
                                    quote.discount_total,
                                    quote.currency,
                                )}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Impuestos</dt>
                            <dd className="font-mono">
                                {formatMoney(quote.tax_total, quote.currency)}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-border/50 pt-2 font-semibold">
                            <dt>Total</dt>
                            <dd className="font-mono text-[#4A80B8]">
                                {formatMoney(quote.grand_total, quote.currency)}
                            </dd>
                        </div>
                    </dl>
                </div>

                {quote.billing_snapshot &&
                Object.keys(quote.billing_snapshot).length > 0 ? (
                    <NeuCardRaised className="mt-4 rounded-xl p-4 md:p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Datos fiscales (snapshot)
                        </h2>
                        <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/20 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                            {JSON.stringify(quote.billing_snapshot, null, 2)}
                        </pre>
                    </NeuCardRaised>
                ) : null}

                {quote.notes_customer ? (
                    <NeuCardRaised className="mt-4 rounded-xl p-4 md:p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Notas al cliente
                        </h2>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                            {quote.notes_customer}
                        </p>
                    </NeuCardRaised>
                ) : null}

                {quote.notes_internal ? (
                    <NeuCardRaised className="mt-4 rounded-xl p-4 md:p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Notas internas
                        </h2>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                            {quote.notes_internal}
                        </p>
                    </NeuCardRaised>
                ) : null}
            </div>
        </AppLayout>
    );
}
