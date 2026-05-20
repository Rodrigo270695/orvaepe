import {
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    GraduationCap,
    PawPrint,
    Settings2,
} from 'lucide-react';

type SaasTenantRow = {
    tenant_slug: string;
    tenant_label: string;
    customer_email: string | null;
    customer_name: string | null;
    plan_label: string | null;
    subscription_status: string | null;
    access_url: string | null;
    provision_status: 'ok' | 'pending' | 'error' | 'skipped';
    provision_note: string | null;
    order_number: string | null;
    created_at: string | null;
};

type SaasPanel = {
    key: string;
    label: string;
    description: string;
    accent: 'aula' | 'vet';
    enabled: boolean;
    configured: boolean;
    provision_url: string | null;
    tenant_domain: string;
    stats: {
        tenants_total: number;
        subscriptions_total: number;
        subscriptions_active: number;
        paid_orders: number;
        revenue_last_30d: number;
        provision_attention: number;
    };
    recent_tenants: SaasTenantRow[];
};

type Props = {
    panels: {
        aulavirtual: SaasPanel;
        vetsaas: SaasPanel;
    };
};

function formatPEN(n: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(n);
}

function subscriptionStatusLabel(status: string | null): string {
    if (!status) {
        return '—';
    }
    const m: Record<string, string> = {
        trialing: 'Prueba',
        active: 'Activa',
        past_due: 'Vencida',
        paused: 'Pausada',
        cancelled: 'Cancelada',
    };
    return m[status] ?? status;
}

function provisionBadge(status: SaasTenantRow['provision_status']) {
    if (status === 'ok') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--state-success)_14%,transparent)] px-2 py-0.5 text-[10px] font-medium text-[var(--state-success)]">
                <CheckCircle2 className="size-3" />
                Activo
            </span>
        );
    }
    if (status === 'pending') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--state-warning)_14%,transparent)] px-2 py-0.5 text-[10px] font-medium text-[var(--state-warning)]">
                <AlertTriangle className="size-3" />
                Pendiente
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--state-danger)_14%,transparent)] px-2 py-0.5 text-[10px] font-medium text-[var(--state-danger)]">
            <AlertTriangle className="size-3" />
            {status === 'skipped' ? 'Omitido' : 'Error'}
        </span>
    );
}

function SaasTenantPanelCard({ panel }: { panel: SaasPanel }) {
    const Icon = panel.accent === 'vet' ? PawPrint : GraduationCap;
    const accentVar =
        panel.accent === 'vet' ? 'var(--dash-series-2)' : 'var(--dash-series-4)';

    return (
        <article
            className="neumorph flex min-h-0 flex-col rounded-2xl p-5 ring-1 ring-[color-mix(in_oklab,var(--dash-grid)_80%,transparent)]"
            style={{
                borderLeftWidth: '4px',
                borderLeftColor: accentVar,
            }}
        >
            <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                    <div
                        className="inline-flex rounded-xl p-2.5"
                        style={{
                            background: `color-mix(in oklab, ${accentVar} 18%, transparent)`,
                        }}
                    >
                        <Icon className="size-5" style={{ color: accentVar }} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-foreground">
                            {panel.label}
                        </h2>
                        <p className="mt-0.5 max-w-prose text-xs text-muted-foreground">
                            {panel.description}
                        </p>
                        <p className="mt-2 font-mono text-[10px] tracking-wide text-muted-foreground">
                            Dominio tenants:{' '}
                            <span className="text-foreground/80">
                                *.{panel.tenant_domain}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
                            panel.enabled
                                ? 'bg-[color-mix(in_oklab,var(--state-success)_12%,transparent)] text-[var(--state-success)]'
                                : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {panel.enabled ? 'Provisión ON' : 'Provisión OFF'}
                    </span>
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
                            panel.configured
                                ? 'bg-[color-mix(in_oklab,var(--o-tech)_12%,transparent)] text-[var(--o-tech)]'
                                : 'bg-[color-mix(in_oklab,var(--state-warning)_12%,transparent)] text-[var(--state-warning)]'
                        }`}
                    >
                        <Settings2 className="size-3" />
                        {panel.configured ? 'API lista' : 'Falta config'}
                    </span>
                </div>
            </header>

            <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-[color-mix(in_oklab,var(--card)_65%,transparent)] px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Tenants
                    </p>
                    <p className="mt-0.5 text-xl font-semibold">
                        {panel.stats.tenants_total}
                    </p>
                </div>
                <div className="rounded-xl bg-[color-mix(in_oklab,var(--card)_65%,transparent)] px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Suscripciones
                    </p>
                    <p className="mt-0.5 text-xl font-semibold">
                        {panel.stats.subscriptions_active}
                        <span className="text-sm font-normal text-muted-foreground">
                            {' '}
                            / {panel.stats.subscriptions_total}
                        </span>
                    </p>
                </div>
                <div className="rounded-xl bg-[color-mix(in_oklab,var(--card)_65%,transparent)] px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Ingresos 30 d
                    </p>
                    <p className="mt-0.5 text-xl font-semibold text-[var(--dash-revenue)]">
                        {formatPEN(panel.stats.revenue_last_30d)}
                    </p>
                </div>
                <div className="rounded-xl bg-[color-mix(in_oklab,var(--card)_65%,transparent)] px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Pedidos pagados
                    </p>
                    <p className="mt-0.5 text-lg font-semibold">
                        {panel.stats.paid_orders}
                    </p>
                </div>
                <div className="rounded-xl bg-[color-mix(in_oklab,var(--card)_65%,transparent)] px-3 py-2.5 sm:col-span-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Requieren revisión
                    </p>
                    <p className="mt-0.5 text-lg font-semibold">
                        {panel.stats.provision_attention === 0 ? (
                            <span className="text-[var(--state-success)]">
                                Ninguno
                            </span>
                        ) : (
                            <span className="text-[var(--state-warning)]">
                                {panel.stats.provision_attention} pedido(s)
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="min-h-0 flex-1">
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Tenants recientes
                </h3>
                {panel.recent_tenants.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[var(--o-border2)] px-4 py-6 text-center text-sm text-muted-foreground">
                        Aún no hay tenants provisionados para esta plataforma.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-[var(--o-border2)]">
                        <table className="w-full min-w-[520px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-[var(--o-border2)] bg-[color-mix(in_oklab,var(--muted)_8%,transparent)] font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                                    <th className="px-3 py-2">Tenant</th>
                                    <th className="px-3 py-2">Cliente</th>
                                    <th className="px-3 py-2">Estado</th>
                                    <th className="px-3 py-2 text-right">
                                        Acceso
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {panel.recent_tenants.map((row) => (
                                    <tr
                                        key={`${row.tenant_slug}-${row.order_number ?? row.created_at}`}
                                        className="border-b border-[var(--o-border2)] last:border-0"
                                    >
                                        <td className="px-3 py-2.5 align-top">
                                            <p className="font-medium text-foreground">
                                                {row.tenant_label}
                                            </p>
                                            <p className="font-mono text-[10px] text-muted-foreground">
                                                {row.tenant_slug}
                                            </p>
                                            {row.plan_label && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {row.plan_label}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 align-top text-xs text-muted-foreground">
                                            <p>
                                                {row.customer_name?.trim() ||
                                                    '—'}
                                            </p>
                                            <p className="font-mono text-[10px]">
                                                {row.customer_email ?? '—'}
                                            </p>
                                            {row.order_number && (
                                                <p className="mt-1 font-mono text-[10px]">
                                                    {row.order_number}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 align-top">
                                            <div className="flex flex-col gap-1">
                                                {provisionBadge(
                                                    row.provision_status,
                                                )}
                                                {row.subscription_status && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {subscriptionStatusLabel(
                                                            row.subscription_status,
                                                        )}
                                                    </span>
                                                )}
                                                {row.provision_note && (
                                                    <span className="text-[10px] leading-snug text-muted-foreground">
                                                        {row.provision_note}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-right align-top">
                                            {row.access_url ? (
                                                <a
                                                    href={row.access_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--auth-link)] hover:underline"
                                                >
                                                    Abrir
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </article>
    );
}

export default function SaasTenantsSection({ panels }: Props) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-foreground">
                    Plataformas SaaS
                </h2>
                <p className="text-sm text-muted-foreground">
                    Tenants de Aula Virtual y VetSaaS provisionados desde ORVAE.
                </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
                <SaasTenantPanelCard panel={panels.aulavirtual} />
                <SaasTenantPanelCard panel={panels.vetsaas} />
            </div>
        </section>
    );
}
