import { Copy, Info } from 'lucide-react';
import { useState } from 'react';

import { ClientPageTitleCard } from '@/components/client-portal/client-page-title-card';
import AdminCrudPagination from '@/components/admin/crud/AdminCrudPagination';
import {
    licenseKeyStatusBadgeClass,
    licenseKeyStatusLabel,
} from '@/components/acceso/licencias/licenseKeyDisplay';
import { Button } from '@/components/ui/button';
import ClientPortalLayout from '@/layouts/client-portal-layout';

type LicenseRow = {
    id: string;
    key: string;
    status: string;
    expires_at: string | null;
    max_activations: number;
    activation_count: number;
    created_at: string | null;
    order_number: string | null;
    sku_code: string | null;
    sku_name: string | null;
    product_name: string | null;
    evidence_image_url?: string | null;
};

type Props = {
    licenses: {
        data: LicenseRow[];
        links?: { url: string | null; label: string; active: boolean }[];
        from?: number;
        to?: number;
        total?: number;
        per_page?: number;
        current_page?: number;
        last_page?: number;
    };
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function LicenseKeyCell({ row }: { row: LicenseRow }) {
    const [copied, setCopied] = useState(false);

    if (row.status === 'pending') {
        return (
            <div className="space-y-1">
                <p className="text-xs font-medium text-[color-mix(in_oklab,var(--state-alert)_78%,var(--foreground))]">
                    Clave en proceso de compra
                </p>
                <p className="text-[11px] text-muted-foreground">
                    Tiempo estimado: 5 a 20 minutos.
                </p>
            </div>
        );
    }

    const doCopy = async () => {
        try {
            await navigator.clipboard.writeText(row.key);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <code className="break-all rounded bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)] px-2 py-1 text-[11px]">
                {row.key}
            </code>
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={doCopy}
                className="h-7 cursor-pointer px-2 text-xs"
            >
                <Copy className="mr-1 size-3.5" />
                {copied ? 'Copiado' : 'Copiar'}
            </Button>
        </div>
    );
}

export default function ClienteLicencias({ licenses }: Props) {
    const rows = licenses?.data ?? [];

    return (
        <ClientPortalLayout
            title="Licencias"
            headTitle="Licencias — Área del cliente"
            titleInHeader={false}
            breadcrumbs={[
                { label: 'Área del cliente', href: '/cliente' },
                { label: 'Licencias' },
            ]}
        >
            <div className="w-full space-y-5">
                <ClientPageTitleCard title="Tus licencias" />

                <div className="flex gap-3 rounded-xl border border-[color-mix(in_oklab,var(--state-info)_30%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_10%,transparent)] px-4 py-3 text-sm">
                    <Info
                        className="size-5 shrink-0 text-[color-mix(in_oklab,var(--state-info)_75%,var(--foreground))]"
                        aria-hidden
                    />
                    <p className="leading-relaxed text-[color-mix(in_oklab,var(--state-info)_74%,var(--foreground))]">
                        Cuando una compra se confirma, la licencia aparece aquí
                        en estado pendiente. La clave se mostrará cuando el
                        equipo active tu pedido.
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--state-info)_20%,var(--border))] bg-[color-mix(in_oklab,var(--card)_94%,var(--background))] shadow-sm">
                    {rows.length === 0 ? (
                        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                            Aún no tienes licencias registradas.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[color-mix(in_oklab,var(--state-info)_14%,var(--border))] bg-[color-mix(in_oklab,var(--state-info)_7%,transparent)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3">Producto / SKU</th>
                                        <th className="px-4 py-3">Pedido</th>
                                        <th className="px-4 py-3">Clave</th>
                                        <th className="px-4 py-3">Evidencia</th>
                                        <th className="px-4 py-3">Caduca</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b border-[color-mix(in_oklab,var(--state-info)_12%,var(--border))] align-top last:border-0"
                                        >
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${licenseKeyStatusBadgeClass(row.status)}`}
                                                >
                                                    {licenseKeyStatusLabel(row.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">
                                                    {row.product_name ?? '—'}
                                                </p>
                                                <p className="font-mono text-[11px] text-muted-foreground">
                                                    {(row.sku_code ?? '—') +
                                                        ' · ' +
                                                        (row.sku_name ?? '—')}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                {row.order_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <LicenseKeyCell row={row} />
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {row.evidence_image_url ? (
                                                    <a
                                                        href={row.evidence_image_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2"
                                                    >
                                                        <img
                                                            src={row.evidence_image_url}
                                                            alt="Evidencia de activación"
                                                            className="h-10 w-10 rounded-md border border-border object-cover"
                                                        />
                                                        <span>Ver</span>
                                                    </a>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {formatDate(row.expires_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <AdminCrudPagination paginator={licenses} />
            </div>
        </ClientPortalLayout>
    );
}
