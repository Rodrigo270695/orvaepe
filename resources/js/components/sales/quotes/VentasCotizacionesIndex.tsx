import { Link, router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { ArrowDown, ArrowUp, Eye, FileDown, Mail, Pencil, Trash2 } from 'lucide-react';

import AdminCrudDeleteModal from '@/components/admin/crud/AdminCrudDeleteModal';
import AdminCrudIndex from '@/components/admin/crud/AdminCrudIndex';
import type { AdminCrudTableColumn } from '@/components/admin/crud/AdminCrudTable';
import { formatOrderMoney } from '@/components/sales/orders/orderDisplay';
import VentasCotizacionSendEmailModal from '@/components/sales/quotes/VentasCotizacionSendEmailModal';
import {
    formatQuoteClientDocument,
    formatQuoteClientName,
    quoteCanDelete,
    quoteCanEdit,
    quoteCanSendEmail,
    quoteDefaultSendEmail,
    quoteStatusBadgeClass,
    quoteStatusLabel,
} from '@/components/sales/quotes/quoteDisplay';
import type { QuoteRow } from '@/components/sales/quotes/quoteTypes';
import VentasCotizacionesFilters from '@/components/sales/quotes/VentasCotizacionesFilters';
import VentasCotizacionesMobileCards from '@/components/sales/quotes/VentasCotizacionesMobileCards';
import VentasCotizacionesToolbar from '@/components/sales/quotes/VentasCotizacionesToolbar';
import panel from '@/routes/panel';

export type { QuoteRow } from '@/components/sales/quotes/quoteTypes';

type Props = {
    quotes: any;
    initialQuery: string;
    initialStatus: string;
    initialSortDir: 'asc' | 'desc';
    initialDateFrom: string;
    initialDateTo: string;
};

export default function VentasCotizacionesIndex({
    quotes,
    initialQuery,
    initialStatus,
    initialSortDir,
    initialDateFrom,
    initialDateTo,
}: Props) {
    const page = usePage();
    const rows: QuoteRow[] = (quotes?.data ?? []) as QuoteRow[];
    const totalQuotes = quotes?.total ?? rows.length;

    const [deleteTarget, setDeleteTarget] = React.useState<QuoteRow | null>(
        null,
    );
    const [sendTarget, setSendTarget] = React.useState<QuoteRow | null>(null);

    const openDeleteModal = (row: QuoteRow) => {
        if (!quoteCanDelete(row.status)) {
            return;
        }
        setDeleteTarget(row);
    };

    const toggleSort = () => {
        const currentUrl = new URL(page.url, window.location.origin);
        const currentSortDir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ??
            initialSortDir;
        const nextDir: 'asc' | 'desc' =
            currentSortDir === 'asc' ? 'desc' : 'asc';
        currentUrl.searchParams.set('sort_dir', nextDir);
        currentUrl.searchParams.set('page', '1');
        router.get(currentUrl.pathname + currentUrl.search, {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const sortIcon = () => {
        const currentUrl = new URL(page.url, window.location.origin);
        const dir =
            (currentUrl.searchParams.get('sort_dir') as 'asc' | 'desc' | null) ??
            initialSortDir;
        return dir === 'asc' ? (
            <ArrowUp className="size-3.5 text-[#4A80B8]" />
        ) : (
            <ArrowDown className="size-3.5 text-[#4A80B8]" />
        );
    };

    const sortableHeader = (label: string) => (
        <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground"
            onClick={() => toggleSort()}
        >
            <span>{label}</span>
            {sortIcon()}
        </button>
    );

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) {
            return '—';
        }
        return d.toLocaleString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const columns: AdminCrudTableColumn<QuoteRow>[] = [
        {
            header: 'Estado',
            cellClassName: 'px-3 py-2 align-middle',
            render: (r) => (
                <span
                    className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        quoteStatusBadgeClass(r.status),
                    ].join(' ')}
                >
                    {quoteStatusLabel(r.status)}
                </span>
            ),
        },
        {
            header: 'Cotización',
            cellClassName: 'px-3 py-2 align-middle font-mono text-sm text-[#4A80B8]',
            render: (r) => r.quote_number,
        },
        {
            header: sortableHeader('Fecha'),
            cellClassName: 'px-3 py-2 align-middle text-xs text-muted-foreground',
            render: (r) => formatDate(r.created_at),
        },
        {
            header: 'Cliente',
            cellClassName: 'px-3 py-2 align-middle max-w-[14rem]',
            render: (r) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium leading-snug">
                        {formatQuoteClientName(r)}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                        {formatQuoteClientDocument(r)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Líneas',
            cellClassName: 'px-3 py-2 align-middle font-mono text-xs',
            render: (r) => String(r.lines_count ?? 0),
        },
        {
            header: 'Total',
            cellClassName: 'px-3 py-2 align-middle font-medium',
            render: (r) => formatOrderMoney(r.grand_total, r.currency),
        },
    ];

    return (
        <>
            <AdminCrudIndex<QuoteRow>
                rows={rows}
                paginator={quotes ?? null}
                rowKey={(r) => r.id}
                columns={columns}
                emptyState="No hay cotizaciones todavía. Crea una con «Nueva cotización»."
                renderToolbar={() => (
                    <VentasCotizacionesToolbar
                        totalQuotes={totalQuotes}
                        rows={rows}
                    />
                )}
                renderAboveTable={() => (
                    <VentasCotizacionesFilters
                        initialQuery={initialQuery}
                        initialStatus={initialStatus}
                        initialDateFrom={initialDateFrom}
                        initialDateTo={initialDateTo}
                        className="mt-1"
                    />
                )}
                renderRowActions={({ row }) => (
                    <div className="flex items-center gap-1">
                        <Link
                            href={panel.ventasCotizaciones.show.url(row.id)}
                            prefetch
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                            aria-label="Ver cotización"
                        >
                            <Eye className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                        </Link>
                        {quoteCanEdit(row.status) ? (
                            <Link
                                href={`/panel/ventas-cotizaciones/${row.id}/edit`}
                                prefetch
                                className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30"
                                aria-label="Editar cotización"
                            >
                                <Pencil className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                            </Link>
                        ) : null}
                        <a
                            href={panel.ventasCotizaciones.pdf.url(row.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b45309]/35"
                            aria-label="Ver PDF de la cotización"
                        >
                            <FileDown className="size-4 text-[#b45309]/70 transition-colors group-hover:text-[#b45309]" />
                        </a>
                        <button
                            type="button"
                            disabled={!quoteCanSendEmail(row.status)}
                            title={
                                quoteCanSendEmail(row.status)
                                    ? 'Enviar por correo'
                                    : 'No se puede enviar una cotización convertida.'
                            }
                            aria-label="Enviar cotización por correo"
                            onClick={() =>
                                quoteCanSendEmail(row.status) &&
                                setSendTarget(row)
                            }
                            className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A80B8]/30 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Mail className="size-4 text-[#4A80B8]/60 transition-colors group-hover:text-[#4A80B8]" />
                        </button>
                        {quoteCanDelete(row.status) ? (
                            <button
                                type="button"
                                className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05050]/30"
                                aria-label="Eliminar cotización"
                                onClick={() => openDeleteModal(row)}
                            >
                                <Trash2 className="size-4 text-[#C05050]/60 transition-colors group-hover:text-[#C05050]" />
                            </button>
                        ) : null}
                    </div>
                )}
                renderMobileRows={({ rows: mobileRows }) => (
                    <VentasCotizacionesMobileCards
                        rows={mobileRows}
                        onRequestDelete={openDeleteModal}
                        onRequestSendEmail={(r) => setSendTarget(r)}
                    />
                )}
            />

            <VentasCotizacionSendEmailModal
                open={sendTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSendTarget(null);
                    }
                }}
                quoteId={sendTarget?.id ?? ''}
                quoteNumber={sendTarget?.quote_number ?? ''}
                defaultEmail={
                    sendTarget ? quoteDefaultSendEmail(sendTarget) : ''
                }
                canSend={
                    sendTarget ? quoteCanSendEmail(sendTarget.status) : false
                }
            />

            <AdminCrudDeleteModal
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
                title="Eliminar cotización"
                description="Solo se pueden eliminar cotizaciones en borrador."
                confirmLabel="Eliminar"
                action={
                    deleteTarget
                        ? panel.ventasCotizaciones.destroy.url(
                              deleteTarget.id,
                          )
                        : '#'
                }
                method="post"
                methodOverride="delete"
                entityLabel={deleteTarget?.quote_number}
            />
        </>
    );
}
