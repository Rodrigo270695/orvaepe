import {
    Download,
    Eye,
    KeyRound,
    LayoutDashboard,
    Package,
    Repeat,
    Shield,
    Ticket,
} from 'lucide-react';

import { Link } from '@inertiajs/react';

import {
    secretKindBadgeClass,
    secretKindLabel,
} from '@/components/acceso/credenciales/secretDisplay';
import type { EntitlementSecretDetail } from '@/components/acceso/credenciales/secretDetailTypes';
import {
    entitlementStatusBadgeClass,
    entitlementStatusLabel,
} from '@/components/acceso/entitlements/entitlementDisplay';
import {
    licenseKeyStatusBadgeClass,
    licenseKeyStatusLabel,
} from '@/components/acceso/licencias/licenseKeyDisplay';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ClienteSoftwareTabId =
    | 'resumen'
    | 'suscripciones'
    | 'derechos'
    | 'codigo'
    | 'credenciales'
    | 'licencias';

export const CLIENTE_SOFTWARE_TABS: {
    id: ClienteSoftwareTabId;
    label: string;
    short: string;
    icon: typeof LayoutDashboard;
}[] = [
    { id: 'resumen', label: 'Resumen', short: 'Inicio', icon: LayoutDashboard },
    { id: 'suscripciones', label: 'Suscripciones', short: 'Subs', icon: Repeat },
    { id: 'derechos', label: 'Derechos de uso', short: 'Derechos', icon: Shield },
    { id: 'codigo', label: 'Código fuente', short: 'Código', icon: Package },
    { id: 'credenciales', label: 'Credenciales', short: 'API', icon: KeyRound },
    { id: 'licencias', label: 'Licencias', short: 'Lic.', icon: Ticket },
];

type ProductHeadingProps = {
    productName: string | null;
    skuCode: string | null;
    skuName: string | null;
};

export function ProductHeading({
    productName,
    skuCode,
    skuName,
}: ProductHeadingProps) {
    const sub = [skuCode, skuName].filter(Boolean).join(' · ');

    return (
        <div className="min-w-0">
            <p className="font-medium leading-snug text-foreground">
                {productName ?? '—'}
            </p>
            {sub ? (
                <p className="mt-1 font-mono text-[11px] leading-snug text-muted-foreground">
                    {sub}
                </p>
            ) : null}
        </div>
    );
}

type TabNavProps = {
    active: ClienteSoftwareTabId;
    onChange: (id: ClienteSoftwareTabId) => void;
    badgeCredenciales?: number;
    badgeCodigo?: number;
};

export function ClienteSoftwareTabNav({
    active,
    onChange,
    badgeCredenciales = 0,
    badgeCodigo = 0,
}: TabNavProps) {
    return (
        <nav
            aria-label="Secciones de software"
            className="mb-5 rounded-xl border border-border/60 bg-muted/20 p-1.5 shadow-sm"
        >
            <div className="flex gap-1 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80">
                {CLIENTE_SOFTWARE_TABS.map((t) => {
                    const Icon = t.icon;
                    const isActive = active === t.id;
                    let badge: number | null = null;
                    if (t.id === 'credenciales' && badgeCredenciales > 0) {
                        badge = badgeCredenciales;
                    }
                    if (t.id === 'codigo' && badgeCodigo > 0) {
                        badge = badgeCodigo;
                    }

                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => onChange(t.id)}
                            className={cn(
                                'flex shrink-0 snap-start items-center gap-1.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors sm:px-3',
                                isActive
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/80'
                                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
                            )}
                        >
                            <Icon
                                className={cn(
                                    'size-3.5 shrink-0',
                                    isActive ? 'text-[#4A80B8]' : 'opacity-70',
                                )}
                            />
                            <span className="sm:hidden">{t.short}</span>
                            <span className="hidden sm:inline">{t.label}</span>
                            {badge !== null ? (
                                <span className="ml-0.5 inline-flex min-w-[1.1rem] justify-center rounded-full bg-[#4A80B8]/20 px-1 text-[10px] font-semibold text-[#4A80B8]">
                                    {badge > 9 ? '9+' : badge}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

type EntitlementsCardsProps = {
    entitlements: Array<{
        id: string;
        status: string;
        starts_at: string | null;
        ends_at: string | null;
        product_name: string | null;
        product_slug?: string | null;
        sku: string | null;
        sku_name: string | null;
        secrets_count: number;
    }>;
    fmtDate: (iso: string | null) => string;
    /** Ruta pública del producto (ej. `/servicios/{slug}` o `/software/{slug}`). */
    productPublicHref?: (slug: string) => string;
};

export function EntitlementsCards({
    entitlements,
    fmtDate,
    productPublicHref,
}: EntitlementsCardsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
            {entitlements.map((row) => (
                <div
                    key={row.id}
                    className="rounded-xl border border-border/60 bg-background/50 p-4"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <ProductHeading
                                productName={row.product_name}
                                skuCode={row.sku}
                                skuName={row.sku_name}
                            />
                            {row.product_slug && productPublicHref ? (
                                <Link
                                    href={productPublicHref(row.product_slug)}
                                    className="mt-2 inline-block text-xs font-medium text-[#4A80B8] hover:underline"
                                >
                                    Ver ficha pública
                                </Link>
                            ) : null}
                        </div>
                        <span
                            className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${licenseKeyStatusBadgeClass(row.status === 'suspended' ? 'expired' : row.status)}`}
                        >
                            {licenseKeyStatusLabel(
                                row.status === 'suspended' ? 'expired' : row.status,
                            )}
                        </span>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border/50 pt-3 text-xs">
                        <div>
                            <dt className="text-muted-foreground">Vigencia</dt>
                            <dd className="mt-0.5 text-foreground/90">
                                {fmtDate(row.starts_at)} — {fmtDate(row.ends_at)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Secretos</dt>
                            <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                                {row.secrets_count}
                            </dd>
                        </div>
                    </dl>
                </div>
            ))}
        </div>
    );
}

type CredentialsCardsProps = {
    rows: EntitlementSecretDetail[];
    fmtDate: (iso: string | null) => string;
    onView: (row: EntitlementSecretDetail) => void;
    productPublicHref?: (slug: string) => string;
};

export function CredentialsCards({
    rows,
    fmtDate,
    onView,
    productPublicHref,
}: CredentialsCardsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
            {rows.map((row) => {
                const entSt = row.entitlement?.status ?? '';
                return (
                    <div
                        key={row.id}
                        className="rounded-xl border border-border/60 bg-background/50 p-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <span
                                className={[
                                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                    secretKindBadgeClass(row.kind),
                                ].join(' ')}
                            >
                                {secretKindLabel(row.kind)}
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 shrink-0 cursor-pointer gap-1 px-2"
                                onClick={() => onView(row)}
                            >
                                <Eye className="size-3.5" />
                                Ver
                            </Button>
                        </div>
                        <div className="mt-3">
                            <ProductHeading
                                productName={row.entitlement?.product_name ?? null}
                                skuCode={row.entitlement?.sku ?? null}
                                skuName={row.entitlement?.sku_name ?? null}
                            />
                            {row.entitlement?.product_slug && productPublicHref ? (
                                <Link
                                    href={productPublicHref(row.entitlement.product_slug)}
                                    className="mt-2 inline-block text-xs font-medium text-[#4A80B8] hover:underline"
                                >
                                    Ver ficha pública
                                </Link>
                            ) : null}
                        </div>
                        {row.public_ref ? (
                            <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">
                                Ref: {row.public_ref}
                            </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span
                                className={[
                                    'inline-flex rounded-full border px-2 py-0.5 font-medium',
                                    entitlementStatusBadgeClass(entSt),
                                ].join(' ')}
                            >
                                {entitlementStatusLabel(entSt)}
                            </span>
                            <span className="text-muted-foreground">
                                Caduca: {fmtDate(row.expires_at ?? null)}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

type LicensesCardsProps = {
    licenses: Array<{
        id: string;
        status: string;
        key: string;
        expires_at: string | null;
        sku_code: string | null;
        sku_name: string | null;
        product_name: string | null;
    }>;
    fmtDate: (iso: string | null) => string;
    daysUntil: (iso: string | null) => number | null;
};

export function LicensesCards({ licenses, fmtDate, daysUntil }: LicensesCardsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
            {licenses.map((row) => {
                const days = daysUntil(row.expires_at);
                const action =
                    days === null
                        ? '—'
                        : days < 0
                          ? 'Contactar soporte'
                          : days <= 7
                            ? 'Renovar'
                            : 'Sin acción';

                return (
                    <div
                        key={row.id}
                        className="rounded-xl border border-border/60 bg-background/50 p-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${licenseKeyStatusBadgeClass(row.status)}`}
                            >
                                {licenseKeyStatusLabel(row.status)}
                            </span>
                        </div>
                        <div className="mt-3">
                            <ProductHeading
                                productName={row.product_name}
                                skuCode={row.sku_code}
                                skuName={row.sku_name}
                            />
                        </div>
                        <p className="mt-3 break-all font-mono text-xs text-foreground/90">
                            {row.key}
                        </p>
                        <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border/50 pt-3 text-xs">
                            <div>
                                <dt className="text-muted-foreground">Caduca</dt>
                                <dd>{fmtDate(row.expires_at)}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Acción</dt>
                                <dd className="text-muted-foreground">{action}</dd>
                            </div>
                        </dl>
                    </div>
                );
            })}
        </div>
    );
}

type SourceCodeSectionProps = {
    releases: Array<{
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
    }>;
    fmtDateTime: (iso: string | null) => string;
};

export function SourceCodeReleasesSection({
    releases,
    fmtDateTime,
}: SourceCodeSectionProps) {
    if (releases.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No hay versiones disponibles para tus productos de código fuente,
                o aún no tienes un derecho activo de ese tipo.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
                Versiones y paquetes para SKUs de{' '}
                <span className="font-medium text-foreground/90">
                    código fuente (perpetuo o alquiler)
                </span>
                .
            </p>
            {releases.map((rel) => (
                <div
                    key={rel.id}
                    className="rounded-xl border border-border/60 bg-background/50 p-4"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-sm font-medium">
                                {rel.product?.name ?? 'Producto'}
                                {rel.is_latest ? (
                                    <span className="ml-2 inline-flex rounded-full border border-[#4A9A72]/40 bg-[#4A9A72]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2d6b47]">
                                        Última
                                    </span>
                                ) : null}
                            </p>
                            <p className="mt-1 font-mono text-sm text-[#4A80B8]">
                                v{rel.version}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Publicada: {fmtDateTime(rel.released_at)}
                                {rel.min_php_version
                                    ? ` · PHP ≥ ${rel.min_php_version}`
                                    : ''}
                            </p>
                            {rel.artifact_sha256 ? (
                                <details className="mt-2 text-[10px]">
                                    <summary className="cursor-pointer text-muted-foreground">
                                        SHA-256 (verificar integridad)
                                    </summary>
                                    <p className="mt-1 break-all font-mono text-muted-foreground">
                                        {rel.artifact_sha256}
                                    </p>
                                </details>
                            ) : null}
                        </div>
                        <div className="shrink-0 sm:pl-2">
                            {rel.main_download_available ? (
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-full cursor-pointer gap-1.5 sm:w-auto"
                                >
                                    <a href={`/cliente/software/descargas/${rel.id}`}>
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
                        <details className="mt-3 rounded-lg border border-border/50 bg-muted/25 px-3 py-2">
                            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                                Changelog
                            </summary>
                            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-xs leading-relaxed">
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
                                        className="flex flex-col gap-2 rounded-lg border border-border/40 bg-muted/15 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <span className="text-sm">{a.label}</span>
                                        {a.download_available ? (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 w-full cursor-pointer gap-1 sm:w-auto"
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
    );
}
