import { useState } from 'react';
import { Download, Eye, Package } from 'lucide-react';

import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import CredentialSecretViewModal from '@/components/acceso/credenciales/CredentialSecretViewModal';
import {
    secretKindBadgeClass,
    secretKindLabel,
} from '@/components/acceso/credenciales/secretDisplay';
import type { EntitlementSecretDetail } from '@/components/acceso/credenciales/secretDetailTypes';
import {
    licenseKeyStatusBadgeClass,
    licenseKeyStatusLabel,
} from '@/components/acceso/licencias/licenseKeyDisplay';
import {
    entitlementStatusBadgeClass,
    entitlementStatusLabel,
} from '@/components/acceso/entitlements/entitlementDisplay';
import { Button } from '@/components/ui/button';
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

/** Versiones de producto para SKUs de código fuente (perpetuo o alquiler). */
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
    const [credentialModalOpen, setCredentialModalOpen] = useState(false);
    const [credentialDetail, setCredentialDetail] =
        useState<EntitlementSecretDetail | null>(null);

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
            <div className="w-full space-y-5">
                <ClientPageTitleCard title="Software y suscripciones" />

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Suscripciones</p>
                        <p className="mt-1 text-2xl font-semibold">{subscriptions.length}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Derechos de uso</p>
                        <p className="mt-1 text-2xl font-semibold">{entitlements.length}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-4">
                        <p className="text-sm text-muted-foreground">Secretos técnicos</p>
                        <p className="mt-1 text-2xl font-semibold">{entitlements.reduce((acc, row) => acc + (row.secrets_count ?? 0), 0)}</p>
                    </div>
                </div>

                {(expiringSoonSubscriptions.length > 0 || expiredSubscriptions.length > 0 || expiringSoonLicenses.length > 0) ? (
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
                ) : null}

                <div className="rounded-xl border border-border/60 bg-background/90 p-4">
                    <h2 className="mb-3 text-sm font-semibold">Suscripciones</h2>
                    {subscriptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tienes suscripciones registradas.</p>
                    ) : (
                        <div className="space-y-3">
                            {subscriptions.map((sub) => (
                                <div key={sub.id} className="rounded-lg border border-border/60 p-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${licenseKeyStatusBadgeClass(sub.status === 'past_due' ? 'expired' : sub.status)}`}>
                                            {licenseKeyStatusLabel(sub.status === 'past_due' ? 'expired' : sub.status)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Periodo: {fmtDate(sub.current_period_start)} — {fmtDate(sub.current_period_end)}
                                        </span>
                                        {sub.cancel_at_period_end ? (
                                            <span className="text-xs text-[color-mix(in_oklab,var(--state-alert)_70%,var(--foreground))]">
                                                Cancelación al cierre de periodo
                                            </span>
                                        ) : null}
                                    </div>
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {sub.items.map((item, idx) => (
                                            <li key={`${sub.id}-${idx}`} className="text-foreground/90">
                                                {(item.product_name ?? '—')} · {(item.sku_code ?? '—')} · {(item.sku_name ?? '—')} · Cant: {item.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-border/60 bg-background/90 p-4">
                    <h2 className="mb-3 text-sm font-semibold">Derechos de uso y secretos</h2>
                    {entitlements.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tienes derechos de uso registrados.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead>
                                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="py-2 pr-4">Estado</th>
                                        <th className="py-2 pr-4">Producto / SKU</th>
                                        <th className="py-2 pr-4">Inicio — Fin</th>
                                        <th className="py-2 pr-4">Secretos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entitlements.map((row) => (
                                        <tr key={row.id} className="border-t border-border/50 align-top">
                                            <td className="py-2 pr-4">
                                                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${licenseKeyStatusBadgeClass(row.status === 'suspended' ? 'expired' : row.status)}`}>
                                                    {licenseKeyStatusLabel(row.status === 'suspended' ? 'expired' : row.status)}
                                                </span>
                                            </td>
                                            <td className="py-2 pr-4">
                                                {(row.product_name ?? '—')} · {(row.sku ?? '—')} · {(row.sku_name ?? '—')}
                                            </td>
                                            <td className="py-2 pr-4 text-muted-foreground">
                                                {fmtDate(row.starts_at)} — {fmtDate(row.ends_at)}
                                            </td>
                                            <td className="py-2 pr-4">{row.secrets_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-border/60 bg-background/90 p-4">
                    <div className="mb-3 flex flex-wrap items-start gap-2">
                        <Package className="mt-0.5 size-4 text-[#4A80B8]" />
                        <div>
                            <h2 className="text-sm font-semibold">
                                Código fuente — versiones y descargas
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Disponible cuando tu derecho de uso es de tipo{' '}
                                <span className="font-medium text-foreground/90">
                                    código fuente (perpetuo o alquiler)
                                </span>
                                . Aquí ves notas de versión, requisitos y enlaces
                                para descargar el paquete principal y archivos
                                adicionales registrados por el equipo.
                            </p>
                        </div>
                    </div>
                    {sourceCodeReleases.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No hay versiones disponibles para tus productos de
                            código fuente, o aún no tienes un derecho activo de
                            ese tipo.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {sourceCodeReleases.map((rel) => (
                                <div
                                    key={rel.id}
                                    className="rounded-lg border border-border/60 bg-background/60 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {rel.product?.name ?? 'Producto'}
                                                {rel.is_latest ? (
                                                    <span className="ml-2 inline-flex rounded-full border border-[#4A9A72]/40 bg-[#4A9A72]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2d6b47]">
                                                        Última
                                                    </span>
                                                ) : null}
                                            </p>
                                            <p className="mt-1 font-mono text-[13px] text-[#4A80B8]">
                                                v{rel.version}
                                            </p>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Publicada: {fmtDateTime(rel.released_at)}
                                                {rel.min_php_version
                                                    ? ` · PHP ≥ ${rel.min_php_version}`
                                                    : ''}
                                            </p>
                                            {rel.artifact_sha256 ? (
                                                <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">
                                                    SHA-256: {rel.artifact_sha256}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="shrink-0">
                                            {rel.main_download_available ? (
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 cursor-pointer gap-1.5"
                                                >
                                                    <a
                                                        href={`/cliente/software/descargas/${rel.id}`}
                                                    >
                                                        <Download className="size-3.5" />
                                                        Descargar
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    Artefacto no configurado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {rel.changelog ? (
                                        <details className="mt-3 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm">
                                            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                                                Ver changelog
                                            </summary>
                                            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground/90">
                                                {rel.changelog}
                                            </pre>
                                        </details>
                                    ) : null}
                                    {rel.assets.length > 0 ? (
                                        <div className="mt-4 border-t border-border/50 pt-3">
                                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Archivos adicionales
                                            </p>
                                            <ul className="space-y-2">
                                                {rel.assets.map((a) => (
                                                    <li
                                                        key={a.id}
                                                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                                                    >
                                                        <span>{a.label}</span>
                                                        {a.download_available ? (
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 cursor-pointer gap-1 px-2 text-xs"
                                                            >
                                                                <a
                                                                    href={`/cliente/software/descargas/${rel.id}/assets/${a.id}`}
                                                                >
                                                                    <Download className="size-3" />
                                                                    Descargar
                                                                </a>
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                No disponible
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-border/60 bg-background/90 p-4">
                    <h2 className="mb-3 text-sm font-semibold">Credenciales y API keys</h2>
                    <p className="mb-4 text-xs text-muted-foreground">
                        Estas son las credenciales técnicas asociadas a tus derechos de uso. Guárdalas en un lugar seguro; no las compartas.
                    </p>
                    {credentialSecrets.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No hay credenciales registradas para tu cuenta.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead>
                                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="py-2 pr-4">Tipo</th>
                                        <th className="py-2 pr-4">Producto / SKU</th>
                                        <th className="py-2 pr-4">Ref. pública</th>
                                        <th className="py-2 pr-4">Estado</th>
                                        <th className="py-2 pr-4">Caduca</th>
                                        <th className="py-2 pr-4">Revocado</th>
                                        <th className="py-2 pr-4 text-right">Ver</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {credentialSecrets.map((row) => {
                                        const entSt = row.entitlement?.status ?? '';
                                        return (
                                            <tr key={row.id} className="border-t border-border/50 align-top">
                                                <td className="py-2 pr-4">
                                                    <span
                                                        className={[
                                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                                            secretKindBadgeClass(row.kind),
                                                        ].join(' ')}
                                                    >
                                                        {secretKindLabel(row.kind)}
                                                    </span>
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <span className="line-clamp-2">
                                                        {row.entitlement?.product_name ?? '—'}
                                                        {(row.entitlement?.sku || row.entitlement?.sku_name)
                                                            ? ` · ${[row.entitlement?.sku, row.entitlement?.sku_name].filter(Boolean).join(' · ')}`
                                                            : ''}
                                                    </span>
                                                </td>
                                                <td className="max-w-[10rem] py-2 pr-4 font-mono text-[11px] text-muted-foreground">
                                                    <span className="line-clamp-2 break-all">
                                                        {row.public_ref ?? '—'}
                                                    </span>
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <span
                                                        className={[
                                                            'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                                            entitlementStatusBadgeClass(entSt),
                                                        ].join(' ')}
                                                    >
                                                        {entitlementStatusLabel(entSt)}
                                                    </span>
                                                </td>
                                                <td className="py-2 pr-4 text-muted-foreground">
                                                    {fmtDate(row.expires_at ?? null)}
                                                </td>
                                                <td className="py-2 pr-4 text-muted-foreground">
                                                    {fmtDate(row.revoked_at ?? null)}
                                                </td>
                                                <td className="py-2 pr-0 text-right">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 cursor-pointer px-2"
                                                        aria-label="Ver credencial completa"
                                                        onClick={() => openCredentialDetail(row)}
                                                    >
                                                        <Eye className="size-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <CredentialSecretViewModal
                    open={credentialModalOpen}
                    onOpenChange={handleCredentialModalChange}
                    detail={credentialDetail}
                />

                <div className="rounded-xl border border-border/60 bg-background/90 p-4">
                    <h2 className="mb-3 text-sm font-semibold">Licencias con caducidad</h2>
                    {licenses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tienes licencias con vencimiento configurado.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px] text-left text-sm">
                                <thead>
                                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="py-2 pr-4">Estado</th>
                                        <th className="py-2 pr-4">Producto / SKU</th>
                                        <th className="py-2 pr-4">Clave</th>
                                        <th className="py-2 pr-4">Caduca</th>
                                        <th className="py-2 pr-4">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {licenses.map((row) => {
                                        const days = daysUntil(row.expires_at);
                                        const action = days === null
                                            ? '—'
                                            : days < 0
                                                ? 'Contactar soporte'
                                                : days <= 7
                                                    ? 'Renovar'
                                                    : 'Sin acción';
                                        return (
                                            <tr key={row.id} className="border-t border-border/50 align-top">
                                                <td className="py-2 pr-4">
                                                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${licenseKeyStatusBadgeClass(row.status)}`}>
                                                        {licenseKeyStatusLabel(row.status)}
                                                    </span>
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {(row.product_name ?? '—')} · {(row.sku_code ?? '—')} · {(row.sku_name ?? '—')}
                                                </td>
                                                <td className="py-2 pr-4 font-mono text-xs">{row.key}</td>
                                                <td className="py-2 pr-4 text-muted-foreground">{fmtDate(row.expires_at)}</td>
                                                <td className="py-2 pr-4 text-muted-foreground">{action}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ClientPortalLayout>
    );
}
