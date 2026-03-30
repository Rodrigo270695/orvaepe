import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
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

type Props = {
    subscriptions: SubscriptionRow[];
    entitlements: EntitlementRow[];
};

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ClienteSoftwarePage({ subscriptions, entitlements }: Props) {
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
            </div>
        </ClientPortalLayout>
    );
}
