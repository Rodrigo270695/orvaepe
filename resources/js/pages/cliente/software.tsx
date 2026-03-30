import { useState } from 'react';

import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import {
    ClienteSoftwareTabNav,
    CredentialsCards,
    EntitlementsCards,
    LicensesCards,
    ProductHeading,
    SourceCodeReleasesSection,
    type ClienteSoftwareTabId,
} from '@/components/client-portal/ClienteSoftwareSections';
import CredentialSecretViewModal from '@/components/acceso/credenciales/CredentialSecretViewModal';
import type { EntitlementSecretDetail } from '@/components/acceso/credenciales/secretDetailTypes';
import {
    licenseKeyStatusBadgeClass,
    licenseKeyStatusLabel,
} from '@/components/acceso/licencias/licenseKeyDisplay';
import ClientPortalLayout from '@/layouts/client-portal-layout';

type SubscriptionItemRow = {
    sku_code: string | null;
    sku_name: string | null;
    product_name: string | null;
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
    sku: string | null;
    sku_name: string | null;
    secrets_count: number;
};

type SourceCodeReleaseRow = {
    id: string;
    version: string;
    changelog: string | null;
    released_at: string | null;
    min_php_version: string | null;
    is_latest: boolean;
    artifact_sha256: string | null;
    main_download_available: boolean;
    product: {
        id: string | null;
        name: string | null;
        slug: string | null;
    };
    assets: Array<{
        id: string;
        label: string;
        sha256: string | null;
        download_available: boolean;
    }>;
};

type Props = {
    subscriptions: SubscriptionRow[];
    entitlements: EntitlementRow[];
    credentialSecrets: EntitlementSecretDetail[];
    sourceCodeReleases: SourceCodeReleaseRow[];
    licenses: Array<{
        id: string;
        status: string;
        key: string;
        expires_at: string | null;
        sku_code: string | null;
        sku_name: string | null;
        product_name: string | null;
    }>;
};

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function daysUntil(iso: string | null): number | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const diffMs = d.getTime() - Date.now();
    return Math.floor(diffMs / 86400000);
}

export default function ClienteSoftwarePage({
    subscriptions,
    entitlements,
    credentialSecrets,
    sourceCodeReleases,
    licenses,
}: Props) {
    const [activeTab, setActiveTab] = useState<ClienteSoftwareTabId>('resumen');
    const [credentialModalOpen, setCredentialModalOpen] = useState(false);
    const [credentialDetail, setCredentialDetail] =
        useState<EntitlementSecretDetail | null>(null);

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
    const expiringSoonLicenses = licenses.filter((row) => {
        const days = daysUntil(row.expires_at);
        return days !== null && days >= 0 && days <= 7;
    });

    const hasAlerts =
        expiredSubscriptions.length > 0 ||
        expiringSoonSubscriptions.length > 0 ||
        expiringSoonLicenses.length > 0;

    return (
        <ClientPortalLayout
            title="Software"
            headTitle="Software — Área del cliente"
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Software' },
            ]}
        >
            <div className="w-full max-w-6xl mx-auto space-y-5">
                <ClientPageTitleCard title="Software y suscripciones" />

                <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                    Elige una pestaña para ver cada bloque. En el móvil puedes
                    deslizar las pestañas horizontalmente.
                </div>

                <ClienteSoftwareTabNav
                    active={activeTab}
                    onChange={setActiveTab}
                    badgeCredenciales={credentialSecrets.length}
                    badgeCodigo={sourceCodeReleases.length}
                />

                {activeTab === 'resumen' ? (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-border/60 bg-background/80 p-3 sm:p-4">
                                <p className="text-[11px] text-muted-foreground sm:text-sm">
                                    Suscripciones
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
                                    Versiones código
                                </p>
                                <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
                                    {sourceCodeReleases.length}
                                </p>
                            </div>
                        </div>

                        {hasAlerts ? (
                            <div className="space-y-2">
                                {expiredSubscriptions.length > 0 ? (
                                    <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-danger)_45%,var(--border))] bg-[color-mix(in_oklab,var(--state-danger)_12%,transparent)] px-4 py-3 text-sm">
                                        <p className="font-semibold text-[color-mix(in_oklab,var(--state-danger)_80%,var(--foreground))]">
                                            Suscripción vencida
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
                                            Acción recomendada: revisar renovación para evitar suspensión.
                                        </p>
                                    </div>
                                ) : null}
                                {expiringSoonLicenses.length > 0 ? (
                                    <div className="rounded-xl border border-[color-mix(in_oklab,var(--state-alert)_40%,var(--border))] bg-[color-mix(in_oklab,var(--state-alert)_10%,transparent)] px-4 py-3 text-sm">
                                        <p className="font-semibold text-[color-mix(in_oklab,var(--state-alert)_75%,var(--foreground))]">
                                            Licencia por vencer (7 días)
                                        </p>
                                        <p className="text-[color-mix(in_oklab,var(--state-alert)_70%,var(--foreground))]">
                                            Acción recomendada: renovar licencia para mantener continuidad.
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
                            Suscripciones
                        </h2>
                        {subscriptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No tienes suscripciones registradas.
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
                                                    sub.status === 'past_due' ? 'expired' : sub.status,
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
                            Productos y SKUs cubiertos por tu contrato; la columna
                            «Secretos» indica credenciales vinculadas.
                        </p>
                        {entitlements.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No tienes derechos de uso registrados.
                            </p>
                        ) : (
                            <EntitlementsCards
                                entitlements={entitlements}
                                fmtDate={fmtDate}
                            />
                        )}
                    </div>
                ) : null}

                {activeTab === 'codigo' ? (
                    <div className="rounded-xl border border-border/60 bg-background/90 p-4 sm:p-5">
                        <h2 className="mb-1 text-sm font-semibold sm:text-base">
                            Código fuente — descargas
                        </h2>
                        <SourceCodeReleasesSection
                            releases={sourceCodeReleases}
                            fmtDateTime={fmtDateTime}
                        />
                    </div>
                ) : null}

                {activeTab === 'credenciales' ? (
                    <div className="rounded-xl border border-border/60 bg-background/90 p-4 sm:p-5">
                        <h2 className="mb-1 text-sm font-semibold sm:text-base">
                            Credenciales y API keys
                        </h2>
                        <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
                            Guárdalas en un lugar seguro; no las compartas.
                        </p>
                        {credentialSecrets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hay credenciales registradas para tu cuenta.
                            </p>
                        ) : (
                            <CredentialsCards
                                rows={credentialSecrets}
                                fmtDate={fmtDate}
                                onView={openCredentialDetail}
                            />
                        )}
                    </div>
                ) : null}

                {activeTab === 'licencias' ? (
                    <div className="rounded-xl border border-border/60 bg-background/90 p-4 sm:p-5">
                        <h2 className="mb-1 text-sm font-semibold sm:text-base">
                            Licencias con caducidad
                        </h2>
                        <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
                            Claves on-prem con fecha de vencimiento configurada.
                        </p>
                        {licenses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No tienes licencias con vencimiento configurado.
                            </p>
                        ) : (
                            <LicensesCards
                                licenses={licenses}
                                fmtDate={fmtDate}
                                daysUntil={daysUntil}
                            />
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
