import { useState } from 'react';

import { Link, usePage } from '@inertiajs/react';
import { ExternalLink, MessageCircle } from 'lucide-react';

import CredentialSecretViewModal from '@/components/acceso/credenciales/CredentialSecretViewModal';
import type { EntitlementSecretDetail } from '@/components/acceso/credenciales/secretDetailTypes';
import {
    ClienteServiciosTabNav,
    type ClienteServiciosTabId,
} from '@/components/client-portal/ClienteServiciosSections';
import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import {
    CredentialsCards,
    EntitlementsCards,
    ProductHeading,
} from '@/components/client-portal/ClienteSoftwareSections';
import {
    licenseKeyStatusBadgeClass,
    licenseKeyStatusLabel,
} from '@/components/acceso/licencias/licenseKeyDisplay';
import { orderStatusBadgeClass, orderStatusLabel } from '@/components/sales/orders/orderDisplay';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import { buildWhatsAppHref, WHATSAPP_E164 } from '@/lib/whatsapp';

type SubscriptionItemRow = {
    sku_code: string | null;
    sku_name: string | null;
    product_name: string | null;
    product_slug: string | null;
    quantity: number;
    unit_price: string;
};

type SubscriptionRow = {
    id: string;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    items: SubscriptionItemRow[];
};

type EntitlementRow = {
    id: string;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    product_name: string | null;
    product_slug: string | null;
    sku: string | null;
    sku_name: string | null;
    secrets_count: number;
};

type ServiceLineRow = {
    id: string;
    product_name: string | null;
    sku_name: string | null;
    sku_code: string | null;
    product_slug: string | null;
    order_number: string | null;
    order_status: string | null;
    placed_at: string | null;
    line_total: string;
    currency: string;
};

type PageProps = {
    serviceLines: ServiceLineRow[];
    subscriptions: SubscriptionRow[];
    entitlements: EntitlementRow[];
    credentialSecrets: EntitlementSecretDetail[];
    contact?: { whatsapp_e164?: string };
};

function fmtDate(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '—';
    }
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
}

function formatMoney(amount: string, currency: string): string {
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n)) {
        return `${amount} ${currency}`;
    }
    return `${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function daysUntil(iso: string | null): number | null {
    if (!iso) {
        return null;
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return null;
    }
    const diffMs = d.getTime() - Date.now();
    return Math.floor(diffMs / 86400000);
}

export default function ClienteServicios() {
    const { serviceLines, subscriptions, entitlements, credentialSecrets, contact } =
        usePage<PageProps>().props;
    const whatsappE164 =
        contact?.whatsapp_e164?.replace(/\D/g, '') || WHATSAPP_E164;

    const [activeTab, setActiveTab] = useState<ClienteServiciosTabId>('resumen');
    const [credentialModalOpen, setCredentialModalOpen] = useState(false);
    const [credentialDetail, setCredentialDetail] =
        useState<EntitlementSecretDetail | null>(null);

    const consultHref = buildWhatsAppHref(
        whatsappE164,
        'Hola ORVAE, escribo desde el área del cliente para consultar sobre un servicio.',
    );

    const secretsTotal = entitlements.reduce(
        (acc, row) => acc + (row.secrets_count ?? 0),
        0,
    );

    const openCredentialDetail = (row: EntitlementSecretDetail) => {
        setCredentialDetail(row);
        setCredentialModalOpen(true);
    };

    const handleCredentialModalChange = (open: boolean) => {
        setCredentialModalOpen(open);
        if (!open) {
            setCredentialDetail(null);
        }
    };

    const expiringSoonSubscriptions = subscriptions.filter((sub) => {
        const days = daysUntil(sub.current_period_end);
        return days !== null && days >= 0 && days <= 7;
    });
    const expiredSubscriptions = subscriptions.filter((sub) => {
        const days = daysUntil(sub.current_period_end);
        return days !== null && days < 0;
    });

    const hasAlerts =
        expiredSubscriptions.length > 0 ||
        expiringSoonSubscriptions.length > 0;

    return (
        <ClientPortalLayout
            title="Servicios"
            headTitle="Servicios — Área del cliente"
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Servicios' },
            ]}
        >
            <div className="mx-auto w-full max-w-6xl space-y-5">
                <ClientPageTitleCard title="Servicios contratados" />

                <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                    Misma estructura que Software: suscripciones recurrentes, derechos de uso,
                    credenciales técnicas y líneas de pedido. Solo se muestran productos de la
                    línea <span className="font-medium text-foreground">servicios</span> del
                    catálogo.
                </div>

                <ClienteServiciosTabNav
                    active={activeTab}
                    onChange={setActiveTab}
                    badgeCredenciales={credentialSecrets.length}
                />

                {activeTab === 'resumen' ? (
                    <div className="space-y-5">
                        <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-info)_22%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_8%,var(--card))] px-4 py-3 text-sm leading-relaxed text-[color-mix(in_oklab,var(--state-info)_78%,var(--foreground))]">
                            <p>
                                Los servicios sin precio publicado en la web se coordinan por
                                WhatsApp o correo; el importe en pedidos refleja lo acordado.
                            </p>
                            <a
                                href={consultHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-[filter,transform] hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                            >
                                <MessageCircle className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                                Consultar por WhatsApp
                            </a>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-border/60 bg-background/80 p-3 sm:p-4">
                                <p className="text-[11px] text-muted-foreground sm:text-sm">
                                    Suscripciones (servicios)
                                </p>
                                <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
                                    {subscriptions.length}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-background/80 p-3 sm:p-4">
                                <p className="text-[11px] text-muted-foreground sm:text-sm">
                                    Derechos de uso
                                </p>
                                <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
                                    {entitlements.length}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-background/80 p-3 sm:p-4">
                                <p className="text-[11px] text-muted-foreground sm:text-sm">
                                    Secretos técnicos
                                </p>
                                <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
                                    {secretsTotal}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-background/80 p-3 sm:p-4">
                                <p className="text-[11px] text-muted-foreground sm:text-sm">
                                    Líneas en pedidos
                                </p>
                                <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
                                    {serviceLines.length}
                                </p>
                            </div>
                        </div>

                        {hasAlerts ? (
                            <div className="space-y-2">
                                {expiredSubscriptions.length > 0 ? (
                                    <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-danger)_45%,var(--border))] bg-[color-mix(in_oklab,var(--state-danger)_12%,transparent)] px-4 py-3 text-sm">
                                        <p className="font-semibold text-[color-mix(in_oklab,var(--state-danger)_80%,var(--foreground))]">
                                            Suscripción de servicio vencida
                                        </p>
                                        <p className="text-[color-mix(in_oklab,var(--state-danger)_70%,var(--foreground))]">
                                            Acción recomendada: renovar o contactar soporte.
                                        </p>
                                    </div>
                                ) : null}
                                {expiringSoonSubscriptions.length > 0 ? (
                                    <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-alert)_40%,var(--border))] bg-[color-mix(in_oklab,var(--state-alert)_12%,transparent)] px-4 py-3 text-sm">
                                        <p className="font-semibold text-[color-mix(in_oklab,var(--state-alert)_75%,var(--foreground))]">
                                            Suscripción por vencer (7 días)
                                        </p>
                                        <p className="text-[color-mix(in_oklab,var(--state-alert)_70%,var(--foreground))]">
                                            Revisa la renovación para evitar interrupciones.
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No hay alertas de vencimiento en los próximos 7 días.
                            </p>
                        )}
                    </div>
                ) : null}

                {activeTab === 'suscripciones' ? (
                    <div className="rounded-xl border border-border/60 bg-background/90 p-4 sm:p-5">
                        <h2 className="mb-3 text-sm font-semibold sm:text-base">
                            Suscripciones (solo servicios)
                        </h2>
                        {subscriptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No tienes suscripciones con SKUs de servicios.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {subscriptions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="rounded-xl border border-border/60 bg-background/50 p-4"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${licenseKeyStatusBadgeClass(sub.status === 'past_due' ? 'expired' : sub.status)}`}
                                            >
                                                {licenseKeyStatusLabel(
                                                    sub.status === 'past_due'
                                                        ? 'expired'
                                                        : sub.status,
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {fmtDate(sub.current_period_start)} —{' '}
                                                {fmtDate(sub.current_period_end)}
                                            </span>
                                            {sub.cancel_at_period_end ? (
                                                <span className="text-xs text-[color-mix(in_oklab,var(--state-alert)_70%,var(--foreground))]">
                                                    Cancelación al cierre de periodo
                                                </span>
                                            ) : null}
                                        </div>
                                        <ul className="mt-3 space-y-3">
                                            {sub.items.map((item, idx) => (
                                                <li
                                                    key={`${sub.id}-${idx}`}
                                                    className="border-t border-border/40 pt-3 first:border-t-0 first:pt-0"
                                                >
                                                    <ProductHeading
                                                        productName={item.product_name}
                                                        skuCode={item.sku_code}
                                                        skuName={item.sku_name}
                                                    />
                                                    {item.product_slug ? (
                                                        <Link
                                                            href={`/servicios/${item.product_slug}`}
                                                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#4A80B8] hover:underline"
                                                        >
                                                            Ver ficha pública
                                                            <ExternalLink
                                                                className="size-3 opacity-80"
                                                                aria-hidden
                                                            />
                                                        </Link>
                                                    ) : null}
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Cantidad:{' '}
                                                        <span className="font-medium text-foreground">
                                                            {item.quantity}
                                                        </span>
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : null}

                {activeTab === 'derechos' ? (
                    <div className="rounded-xl border border-border/60 bg-background/90 p-4 sm:p-5">
                        <h2 className="mb-1 text-sm font-semibold sm:text-base">
                            Derechos de uso
                        </h2>
                        <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
                            Servicios cubiertos por tu contrato; «Secretos» indica credenciales
                            vinculadas.
                        </p>
                        {entitlements.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No tienes derechos de uso de servicios registrados.
                            </p>
                        ) : (
                            <EntitlementsCards
                                entitlements={entitlements}
                                fmtDate={fmtDate}
                                productPublicHref={(slug) => `/servicios/${slug}`}
                            />
                        )}
                    </div>
                ) : null}

                {activeTab === 'credenciales' ? (
                    <div className="rounded-xl border border-border/60 bg-background/90 p-4 sm:p-5">
                        <h2 className="mb-1 text-sm font-semibold sm:text-base">
                            Credenciales y API keys
                        </h2>
                        <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
                            Asociadas a derechos de servicios. Guárdalas en un lugar seguro.
                        </p>
                        {credentialSecrets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hay credenciales registradas para servicios en tu cuenta.
                            </p>
                        ) : (
                            <CredentialsCards
                                rows={credentialSecrets}
                                fmtDate={fmtDate}
                                onView={openCredentialDetail}
                                productPublicHref={(slug) => `/servicios/${slug}`}
                            />
                        )}
                    </div>
                ) : null}

                {activeTab === 'pedidos' ? (
                    <div className="overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--border)_55%,transparent)] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] shadow-sm">
                        <div className="border-b border-border/60 px-4 py-3 sm:px-5">
                            <h2 className="text-sm font-semibold sm:text-base">
                                Líneas de pedido (servicios)
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Importes según la orden cerrada en el sistema.
                            </p>
                        </div>
                        {serviceLines.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Aún no hay líneas de servicio en tus pedidos.
                                </p>
                                <Link
                                    href="/servicios"
                                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[color-mix(in_oklab,var(--state-info)_70%,var(--foreground))] hover:underline"
                                >
                                    Ver catálogo de servicios
                                    <ExternalLink className="size-3.5 opacity-80" aria-hidden />
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[color-mix(in_oklab,var(--border)_65%,transparent)] bg-[color-mix(in_oklab,var(--muted)_35%,transparent)]">
                                            <th className="px-4 py-3 font-semibold">Servicio / SKU</th>
                                            <th className="px-4 py-3 font-semibold">Pedido</th>
                                            <th className="px-4 py-3 font-semibold">Estado</th>
                                            <th className="px-4 py-3 font-semibold">Fecha</th>
                                            <th className="px-4 py-3 text-right font-semibold">
                                                Importe línea
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviceLines.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="border-b border-[color-mix(in_oklab,var(--border)_45%,transparent)] last:border-0"
                                            >
                                                <td className="px-4 py-3 align-top">
                                                    <p className="font-medium text-foreground">
                                                        {row.product_name ?? '—'}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {row.sku_name ?? row.sku_code ?? '—'}
                                                    </p>
                                                    {row.product_slug ? (
                                                        <Link
                                                            href={`/servicios/${row.product_slug}`}
                                                            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[color-mix(in_oklab,var(--state-info)_72%,var(--foreground))] hover:underline"
                                                        >
                                                            Ficha pública
                                                            <ExternalLink
                                                                className="size-3 opacity-80"
                                                                aria-hidden
                                                            />
                                                        </Link>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-3 align-top font-mono text-xs">
                                                    {row.order_number ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    {row.order_status ? (
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${orderStatusBadgeClass(row.order_status)}`}
                                                        >
                                                            {orderStatusLabel(row.order_status)}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 align-top text-muted-foreground">
                                                    {formatDateTime(row.placed_at)}
                                                </td>
                                                <td className="px-4 py-3 align-top text-right tabular-nums font-medium">
                                                    {formatMoney(row.line_total, row.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : null}

                <CredentialSecretViewModal
                    open={credentialModalOpen}
                    onOpenChange={handleCredentialModalChange}
                    detail={credentialDetail}
                />
            </div>
        </ClientPortalLayout>
    );
}
